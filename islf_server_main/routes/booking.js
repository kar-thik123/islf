const express = require('express');
const router = express.Router();
const pool = require('../db');
const { getUsernameFromToken } = require('../utils/context-helper');

// Utility for safe JSON parsing (handles jsonb objects and strings)
const safeJsonParse = (val) => {
  if (typeof val === 'object' && val !== null) return val;
  if (typeof val === 'string') {
    try {
      return JSON.parse(val || '[]');
    } catch (e) {
      console.error('JSON parse error:', e, 'Value:', val);
      return [];
    }
  }
  return [];
};


router.get('/', async (req, res) => {
  try {

    const { page = 1, limit = 10, search = '', status = '', companyCode, branchCode, departmentCode } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    // Select only necessary columns for the list view to reduce payload size
    let query = `SELECT id, booking_no, customer_name, company_name, department, service_type, from_location, to_location, status, created_at, effective_date_from, effective_date_to FROM booking WHERE 1=1`;

    const params = [];
    let idx = 1;
    if (status) { query += ` AND status = $${idx}`; params.push(status); idx++; }
    if (companyCode) { query += ` AND company_code = $${idx}`; params.push(companyCode); idx++; }
    if (branchCode) { query += ` AND branch_code = $${idx}`; params.push(branchCode); idx++; }
    if (departmentCode) { query += ` AND department_code = $${idx}`; params.push(departmentCode); idx++; }
    if (search) {
      query += ` AND (booking_no ILIKE $${idx} OR customer_name ILIKE $${idx} OR company_name ILIKE $${idx})`;
      params.push(`%${search}%`); idx++;
    }
    query += ` ORDER BY id DESC LIMIT $${idx} OFFSET $${idx + 1}`;
    params.push(Number(limit), Number(offset));

    // Get total count (filtering applied)
    let countQuery = `SELECT COUNT(*) FROM booking WHERE 1=1`;
    const countParams = [];
    let cIdx = 1;
    if (status) { countQuery += ` AND status = $${cIdx}`; countParams.push(status); cIdx++; }
    if (companyCode) { countQuery += ` AND company_code = $${cIdx}`; countParams.push(companyCode); cIdx++; }
    if (branchCode) { countQuery += ` AND branch_code = $${cIdx}`; countParams.push(branchCode); cIdx++; }
    if (departmentCode) { countQuery += ` AND department_code = $${cIdx}`; countParams.push(departmentCode); cIdx++; }
    if (search) {
      countQuery += ` AND (booking_no ILIKE $${cIdx} OR customer_name ILIKE $${cIdx} OR company_name ILIKE $${cIdx})`;
      countParams.push(`%${search}%`); cIdx++;
    }

    const [resRows, resCount] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, countParams)
    ]);

    res.json({ data: resRows.rows, total: Number(resCount.rows[0].count) });
  } catch (error) {
    console.error('Error listing bookings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/search-enquiries', async (req, res) => {
  try {
    // await ensureBookingTable();
    const { department, service_type, from_location, to_location } = req.body || {};
    let query = `SELECT id, code, customer_id, customer_name, company_name, from_location, to_location, effective_date_from, effective_date_to, department, service_type, service_type_code, department_code, status,
                 COALESCE((SELECT json_agg(ecm.*) FROM enquiry_carriage_mapping ecm WHERE ecm.enquiry_id = enquiry.id), '[]'::json) as carriage_map
                 FROM enquiry WHERE (effective_date_to >= CURRENT_DATE OR effective_date_to IS NULL)`;
    const params = [];
    let idx = 1;
    const norm = (f, i) => `LOWER(REPLACE(${f}, ' ', '')) = LOWER(REPLACE($${i}, ' ', ''))`;
    if (department) {
      query += ` AND (${norm('department', idx)} OR ${norm('department_code', idx)})`;
      params.push(department); idx++;
    }
    if (service_type) {
      query += ` AND (${norm('service_type', idx)} OR ${norm('service_type_code', idx)})`;
      params.push(service_type); idx++;
    }
    if (from_location) { query += ` AND ${norm('from_location', idx)}`; params.push(from_location); idx++; }
    if (to_location) { query += ` AND ${norm('to_location', idx)}`; params.push(to_location); idx++; }
    query += ` ORDER BY id DESC LIMIT 100`;
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error('Error searching enquiries:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/', async (req, res) => {
  const username = getUsernameFromToken(req);
  try {
    // await ensureBookingTable();
    const { booking_type, criteria, selected_enquiries = [], freeze, customer_id, customer_name, company_name, department, service_type, from_location, to_location, effective_date_from, effective_date_to, status = 'Open', remarks, vendor_details, line_items, charges, cargo, carriage_map, schedules, booking_breakup, companyCode, branchCode, departmentCode, serviceTypeCode, enquiry_type, sub_breakup_vendor_type } = req.body || {};

    // Resolve User Context for Number Series
    const userRes = await pool.query('SELECT company_code, branch_code, department_code FROM users WHERE username = $1', [username]);
    const uCtx = userRes.rows[0] || {};
    const effectiveCompany = companyCode || uCtx.company_code;
    const effectiveBranch = branchCode || uCtx.branch_code;
    const effectiveDept = departmentCode || uCtx.department_code;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      let bookingNo;
      let seriesCode;
      if (effectiveCompany) {
        let whereConds = ["code_type = $1", "company_code = $2"];
        let params = ["bookingNo", effectiveCompany];
        let p = 3;
        if (effectiveBranch) { whereConds.push(`(branch_code = $${p} OR branch_code IS NULL OR branch_code = '')`); params.push(effectiveBranch); p++; } else { whereConds.push("(branch_code IS NULL OR branch_code = '')"); }
        if (effectiveDept) { whereConds.push(`(department_code = $${p} OR department_code IS NULL OR department_code = '')`); params.push(effectiveDept); } else { whereConds.push("(department_code IS NULL OR department_code = '')"); }
        const mapQ = `SELECT mapping FROM mapping_relations WHERE ${whereConds.join(' AND ')} ORDER BY id DESC LIMIT 1`;
        const mapRes = await client.query(mapQ, params);
        if (mapRes.rows.length > 0) seriesCode = mapRes.rows[0].mapping;
      }
      if (seriesCode) {
        const seriesRes = await client.query("SELECT * FROM number_series WHERE code = $1 ORDER BY id DESC LIMIT 1", [seriesCode]);
        if (seriesRes.rows.length > 0) {
          const relRes = await client.query("SELECT * FROM number_relation WHERE number_series = $1 ORDER BY id DESC LIMIT 1 FOR UPDATE", [seriesCode]);
          if (relRes.rows.length > 0) {
            const rel = relRes.rows[0];
            let nextNo = rel.last_no_used === 0 ? Number(rel.starting_no) : Number(rel.last_no_used) + Number(rel.increment_by);
            bookingNo = `${rel.prefix || ''}${nextNo}`;
            await client.query("UPDATE number_relation SET last_no_used = $1 WHERE id = $2", [nextNo, rel.id]);
          }
        }
      }
      if (!bookingNo) {
        const nextNoRes = await client.query(`SELECT COALESCE(MAX(CAST(SUBSTRING(booking_no FROM '[0-9]+') AS INTEGER)), 0) + 1 as next_no FROM booking WHERE booking_no ~ '^BKG[0-9]+$'`);
        bookingNo = 'BKG' + nextNoRes.rows[0].next_no.toString().padStart(6, '0');
      }

      let selectedSnapshot = Array.isArray(selected_enquiries) ? selected_enquiries : [];
      let vendorSnap = vendor_details;
      let lineItemSnap = line_items;
      let chargesSnap = charges;
      let carriageMapSnap = carriage_map;

      if (booking_type === 'from_enquiry' && selectedSnapshot.length > 0) {
        const ids = selectedSnapshot.map(e => e.id).filter(id => typeof id === 'number');
        let enqs = [];
        if (ids.length > 0) {
          const resIds = await client.query(`SELECT * FROM enquiry WHERE id = ANY($1)`, [ids]);
          enqs = resIds.rows;
        } else {
          const codes = selectedSnapshot.map(e => e.code).filter(c => typeof c === 'string');
          if (codes.length > 0) {
            const resCodes = await client.query(`SELECT * FROM enquiry WHERE code = ANY($1)`, [codes]);
            enqs = resCodes.rows;
          }
        }
        const enq = enqs[0] || {};
        const ctx = enq;
        let cards = [];
        if (ids.length > 0) {
          const resCards = await client.query(`SELECT * FROM enquiry_vendor_cards WHERE enquiry_id = ANY($1) ORDER BY id DESC`, [ids]);
          cards = resCards.rows;
        }
        vendorSnap = vendorSnap || cards;
        let lis = [];
        if (ids.length > 0) {
          const resLis = await client.query(`SELECT * FROM enquiry_line_items WHERE enquiry_id = ANY($1) ORDER BY s_no`, [ids]);
          lis = resLis.rows;
        }
        // Build vendor mapping per line item via sub-charges
        let liVendorMap = {};
        if (ids.length > 0) {
          const resVm = await client.query(
            `SELECT sc.enquiry_line_item_id, vc.vendor_name
             FROM enquiry_vendor_sub_charges sc
             JOIN enquiry_vendor_cards vc ON vc.id = sc.master_id
             WHERE sc.enquiry_id = ANY($1)`,
            [ids]
          );
          for (const r of resVm.rows) {
            if (r.enquiry_line_item_id) liVendorMap[r.enquiry_line_item_id] = r.vendor_name || null;
          }
        }
        lineItemSnap = lineItemSnap || lis.map(li => ({
          ...li,
          sourced_vendor: liVendorMap[li.id] || li.sourced_vendor || null,
          enq_no: enq.code || null,
          enq_exp: enq.effective_date_to || null
        }));
        let carr = [];
        if (ids.length > 0) {
          const resCarr = await client.query(`SELECT * FROM enquiry_carriage_mapping WHERE enquiry_id = ANY($1) ORDER BY id`, [ids]);
          carr = resCarr.rows;
        } else {
          const codes = selectedSnapshot.map(e => e.code).filter(c => typeof c === 'string');
          if (codes.length > 0) {
            const resIdsByCode = await client.query(`SELECT id FROM enquiry WHERE code = ANY($1)`, [codes]);
            const idList = resIdsByCode.rows.map(r => r.id);
            if (idList.length > 0) {
              const resCarr2 = await client.query(`SELECT * FROM enquiry_carriage_mapping WHERE enquiry_id = ANY($1) ORDER BY id`, [idList]);
              carr = resCarr2.rows;
            }
          }
        }
        carriageMapSnap = carriageMapSnap || carr;
        chargesSnap = chargesSnap || (
          Array.isArray(vendorSnap) ? (vendorSnap[0]?.negotiated_charges || null) : (vendorSnap ? vendorSnap.negotiated_charges : null)
        );
        await client.query(
          `INSERT INTO booking (booking_no, booking_type, enquiry_id, selected_enquiries, customer_id, customer_name, company_name, from_location, to_location, effective_date_from, effective_date_to, department, service_type, status, remarks, vendor_details, line_items, charges, carriage_map, cargo, schedules, company_code, branch_code, department_code, service_type_code, created_by, enquiry_type, sub_breakup_vendor_type)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28)`,
          [
            bookingNo,
            'from_enquiry',
            enq.id || null,
            JSON.stringify(selectedSnapshot || []),
            enq.customer_id || customer_id || null,
            enq.customer_name || customer_name || null,
            enq.company_name || company_name || null,
            enq.from_location || from_location || null,
            enq.to_location || to_location || null,
            effective_date_from || enq.effective_date_from || null,
            effective_date_to || enq.effective_date_to || null,
            enq.department || department || null,
            enq.service_type || service_type || null,
            status,
            remarks || enq.remarks || null,
            vendorSnap ? JSON.stringify(vendorSnap) : null,
            lineItemSnap ? JSON.stringify(lineItemSnap) : null,
            chargesSnap ? JSON.stringify(chargesSnap) : null,
            carriageMapSnap ? JSON.stringify(carriageMapSnap) : null,
            cargo ? JSON.stringify(cargo) : null,
            schedules ? JSON.stringify(schedules) : null,
            enq.company_code || effectiveCompany || null,
            enq.branch_code || effectiveBranch || null,
            enq.department_code || effectiveDept || null,
            enq.service_type_code || serviceTypeCode || null,
            username,
            enq.enquiry_type || enquiry_type || null,
            sub_breakup_vendor_type || null
          ]
        );
        const bRes = await client.query('SELECT id FROM booking WHERE booking_no = $1', [bookingNo]);
        const bookingId = bRes.rows[0]?.id;
        if (bookingId) {
          const liArr = Array.isArray(lineItemSnap) ? lineItemSnap : [];
          for (const li of liArr) {
            await client.query(
              `INSERT INTO booking_line_items (booking_id, s_no, basis, remarks, status, enquiry_no, enquiry_expiry) VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (booking_id, s_no) DO NOTHING`,
              [bookingId, li.s_no || null, li.basis || null, li.remarks || null, li.status || 'Active', li.enq_no || null, li.enq_exp || null]
            );
          }
          const chArr = Array.isArray(chargesSnap) ? chargesSnap : (Array.isArray(chargesSnap?.list) ? chargesSnap.list : []);
          for (const ch of chArr) {
            const chargeName = ch.charge_name || ch.name || null;
            const currencyVal = ch.currency || null;
            const basisVal = ch.basis || null;
            const amountVal = ch.amount ?? ch.charges ?? null;
            const sellRateCur = ch.sell_rate_currency || null;
            const sellRateVal = ch.sell_rate || null;
            const gstVatVal = ch.gst_vat || ch.gst_rate || null;
            const remarksVal = ch.remarks || null;
            await client.query(
              `INSERT INTO booking_charges (booking_id, charge_name, currency, basis, amount, sell_rate_currency, sell_rate, gst_vat, remarks, raw) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
              [bookingId, chargeName, currencyVal, basisVal, amountVal, sellRateCur, sellRateVal, gstVatVal, remarksVal, JSON.stringify(ch)]
            );
          }
          const cargoArr = Array.isArray(cargo) ? cargo : [];
          for (const cg of cargoArr) {
            await client.query(
              `INSERT INTO booking_cargo (booking_id, cargo_type, description, quantity, unit, weight, volume, remarks, raw) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
              [bookingId, cg.cargo_type || cg.type || null, cg.description || null, cg.quantity || null, cg.unit || null, cg.weight || null, cg.volume || null, cg.remarks || null, JSON.stringify(cg)]
            );
          }
          const schArr = Array.isArray(schedules) ? schedules : [];
          for (const sc of schArr) {
            await client.query(
              `INSERT INTO booking_schedules (booking_id, schedule_date, milestone, location, remarks, raw) VALUES ($1,$2,$3,$4,$5,$6)`,
              [bookingId, sc.schedule_date || sc.date || null, sc.milestone || null, sc.location || null, sc.remarks || null, JSON.stringify(sc)]
            );
          }
          const breakupArr = Array.isArray(booking_breakup) ? booking_breakup : [];
          for (const bk of breakupArr) {
            const bkRes = await client.query(
              `INSERT INTO booking_breakup (booking_id, vendor_type, vendor_name, booking_ref_no, basis, valid_till, quantity, remarks, breakup_no) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
              [bookingId, bk.vendor_type || null, bk.vendor_name || null, bk.booking_ref_no || null, bk.basis || null, bk.valid_till || null, bk.quantity || null, bk.remarks || null, bk.breakup_no || null]
            );
            const bkId = bkRes.rows[0].id;

            // Handle container breakup
            if (bk.container_breakup && Array.isArray(bk.container_breakup)) {
              for (const cb of bk.container_breakup) {
                await client.query(
                  `INSERT INTO booking_container_breakup (booking_id, booking_breakup_id, vendor_name, booking_ref_no, basis, container_no, pickup_handover_date, empty_yard, breakup_no) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
                  [bookingId, bkId, bk.vendor_name || null, bk.booking_ref_no || null, bk.basis || null, cb.container_no || null, cb.pickup_handover_date || null, cb.empty_yard || null, bk.breakup_no || null]
                );
              }
            }

            // Handle package breakup
            if (bk.package_breakup && Array.isArray(bk.package_breakup)) {
              for (const pb of bk.package_breakup) {
                await client.query(
                  `INSERT INTO booking_package_breakup (booking_id, booking_breakup_id, vendor_name, booking_ref_no, basis, package_no, length_cm, width_cm, height_cm, weight_kgs, handover_date, carting, breakup_no) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
                  [bookingId, bkId, bk.vendor_name || null, bk.booking_ref_no || null, bk.basis || null, pb.package_no || null, pb.length_cm || null, pb.width_cm || null, pb.height_cm || null, pb.weight_kgs || null, pb.handover_date || null, pb.carting || null, bk.breakup_no || null]
                );
              }
            }
          }
        }
      } else if (booking_type === 'from_enquiry') {
        await client.query(
          `INSERT INTO booking (booking_no, booking_type, selected_enquiries, customer_id, customer_name, company_name, from_location, to_location, effective_date_from, effective_date_to, department, service_type, status, remarks, company_code, branch_code, department_code, service_type_code, created_by, enquiry_type, sub_breakup_vendor_type)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)`,
          [
            bookingNo,
            'from_enquiry',
            JSON.stringify(selectedSnapshot || []),
            customer_id || null,
            customer_name || null,
            company_name || null,
            from_location || null,
            to_location || null,
            effective_date_from || null,
            effective_date_to || null,
            department || null,
            service_type || null,
            status,
            remarks || null,
            companyCode || effectiveCompany || null,
            branchCode || effectiveBranch || null,
            departmentCode || effectiveDept || null,
            serviceTypeCode || null,
            username,
            enquiry_type || null,
            sub_breakup_vendor_type || null
          ]
        );
        const bRes = await client.query('SELECT id FROM booking WHERE booking_no = $1', [bookingNo]);
        const bookingId = bRes.rows[0]?.id;
        if (bookingId) {
          const liArr = Array.isArray(lineItemSnap) ? lineItemSnap : [];
          for (const li of liArr) {
            await client.query(
              `INSERT INTO booking_line_items (booking_id, s_no, basis, remarks, status) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (booking_id, s_no) DO NOTHING`,
              [bookingId, li.s_no || null, li.basis || null, li.remarks || null, li.status || 'Active']
            );
          }
          const chArr = Array.isArray(chargesSnap) ? chargesSnap : (Array.isArray(chargesSnap?.list) ? chargesSnap.list : []);
          for (const ch of chArr) {
            const chargeName = ch.charge_name || ch.name || null;
            const currencyVal = ch.currency || null;
            const basisVal = ch.basis || null;
            const amountVal = ch.amount ?? ch.charges ?? null;
            const sellRateCur = ch.sell_rate_currency || null;
            const sellRateVal = ch.sell_rate || null;
            const gstVatVal = ch.gst_vat || ch.gst_rate || null;
            const remarksVal = ch.remarks || null;
            await client.query(
              `INSERT INTO booking_charges (booking_id, charge_name, currency, basis, amount, sell_rate_currency, sell_rate, gst_vat, remarks, raw) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
              [bookingId, chargeName, currencyVal, basisVal, amountVal, sellRateCur, sellRateVal, gstVatVal, remarksVal, JSON.stringify(ch)]
            );
          }
          const breakupArr = Array.isArray(booking_breakup) ? booking_breakup : [];
          for (const bk of breakupArr) {
            const bkRes = await client.query(
              `INSERT INTO booking_breakup (booking_id, vendor_type, vendor_name, booking_ref_no, basis, valid_till, quantity, remarks, breakup_no) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
              [bookingId, bk.vendor_type || null, bk.vendor_name || null, bk.booking_ref_no || null, bk.basis || null, bk.valid_till || null, bk.quantity || null, bk.remarks || null, bk.breakup_no || null]
            );
            const bkId = bkRes.rows[0].id;

            // Handle container breakup
            if (bk.container_breakup && Array.isArray(bk.container_breakup)) {
              for (const cb of bk.container_breakup) {
                await client.query(
                  `INSERT INTO booking_container_breakup (booking_id, booking_breakup_id, vendor_name, booking_ref_no, basis, container_no, pickup_handover_date, empty_yard, breakup_no) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
                  [bookingId, bkId, bk.vendor_name || null, bk.booking_ref_no || null, bk.basis || null, cb.container_no || null, cb.pickup_handover_date || null, cb.empty_yard || null, bk.breakup_no || null]
                );
              }
            }

            // Handle package breakup
            if (bk.package_breakup && Array.isArray(bk.package_breakup)) {
              for (const pb of bk.package_breakup) {
                await client.query(
                  `INSERT INTO booking_package_breakup (booking_id, booking_breakup_id, vendor_name, booking_ref_no, basis, package_no, length_cm, width_cm, height_cm, weight_kgs, handover_date, carting, breakup_no) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
                  [bookingId, bkId, bk.vendor_name || null, bk.booking_ref_no || null, bk.basis || null, pb.package_no || null, pb.length_cm || null, pb.width_cm || null, pb.height_cm || null, pb.weight_kgs || null, pb.handover_date || null, pb.carting || null, bk.breakup_no || null]
                );
              }
            }
          }
        }
      } else {
        await client.query(
          `INSERT INTO booking (booking_no, booking_type, customer_id, customer_name, company_name, from_location, to_location, effective_date_from, effective_date_to, department, service_type, status, remarks, vendor_details, line_items, charges, cargo, carriage_map, schedules, company_code, branch_code, department_code, service_type_code, created_by, enquiry_type, sub_breakup_vendor_type)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26)`,
          [
            bookingNo,
            'manual',
            customer_id || null,
            customer_name || null,
            company_name || null,
            from_location || null,
            to_location || null,
            effective_date_from || null,
            effective_date_to || null,
            department || null,
            service_type || null,
            status,
            remarks || null,
            vendorSnap ? JSON.stringify(vendorSnap) : null,
            lineItemSnap ? JSON.stringify(lineItemSnap) : null,
            chargesSnap ? JSON.stringify(chargesSnap) : null,
            cargo ? JSON.stringify(cargo) : null,
            carriage_map ? JSON.stringify(carriage_map) : null,
            schedules ? JSON.stringify(schedules) : null,
            companyCode || effectiveCompany || null,
            branchCode || effectiveBranch || null,
            departmentCode || effectiveDept || null,
            serviceTypeCode || null,
            username,
            enquiry_type || null,
            sub_breakup_vendor_type || null
          ]
        );
        const bRes = await client.query('SELECT id FROM booking WHERE booking_no = $1', [bookingNo]);
        const bookingId = bRes.rows[0]?.id;
        if (bookingId) {
          const liArr = Array.isArray(lineItemSnap) ? lineItemSnap : [];
          for (const li of liArr) {
            await client.query(
              `INSERT INTO booking_line_items (booking_id, s_no, basis, remarks, status, enquiry_no, enquiry_expiry) VALUES ($1,$2,$3,$4,$5,$6,$7) ON CONFLICT (booking_id, s_no) DO NOTHING`,
              [bookingId, (li.s_no ?? null) ?? null, li.basis || null, li.remarks || null, li.status || 'Active', li.enq_no || null, li.enq_exp || null]
            );
          }
          const chArr = Array.isArray(chargesSnap) ? chargesSnap : [];
          for (const ch of chArr) {
            const chargeName = ch.charge_name || ch.name || null;
            const currencyVal = ch.currency || null;
            const basisVal = ch.basis || null;
            const amountVal = ch.amount ?? ch.charges ?? null;
            const sellRateCur = ch.sell_rate_currency || null;
            const sellRateVal = ch.sell_rate || null;
            const gstVatVal = ch.gst_vat || ch.gst_rate || null;
            const remarksVal = ch.remarks || null;
            await client.query(
              `INSERT INTO booking_charges (booking_id, charge_name, currency, basis, amount, sell_rate_currency, sell_rate, gst_vat, remarks, raw) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
              [bookingId, chargeName, currencyVal, basisVal, amountVal, sellRateCur, sellRateVal, gstVatVal, remarksVal, JSON.stringify(ch)]
            );
          }
          const cargoArr = Array.isArray(cargo) ? cargo : [];
          for (const cg of cargoArr) {
            await client.query(
              `INSERT INTO booking_cargo (booking_id, cargo_type, description, quantity, unit, weight, volume, remarks, raw) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
              [bookingId, cg.cargo_type || cg.type || null, cg.description || null, cg.quantity || null, cg.unit || null, cg.weight || null, cg.volume || null, cg.remarks || null, JSON.stringify(cg)]
            );
          }
          const cmArr = Array.isArray(carriage_map) ? carriage_map : [];
          let seq = 1;
          for (const cm of cmArr) {
            await client.query(
              `INSERT INTO booking_carriage_map (booking_id, sequence_no, mode, from_location, to_location, vendor_name, vehicle_no, transit_days, remarks, raw) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
              [bookingId, cm.sequence_no || seq++, cm.mode || null, cm.from_location || null, cm.to_location || null, cm.vendor_name || null, cm.vehicle_no || null, cm.transit_days || null, cm.remarks || null, JSON.stringify(cm)]
            );
          }
          const schArr = Array.isArray(schedules) ? schedules : [];
          for (const sc of schArr) {
            await client.query(
              `INSERT INTO booking_schedules (booking_id, schedule_date, milestone, location, remarks, raw) VALUES ($1,$2,$3,$4,$5,$6)`,
              [bookingId, sc.schedule_date || sc.date || null, sc.milestone || null, sc.location || null, sc.remarks || null, JSON.stringify(sc)]
            );
          }
          const breakupArr = Array.isArray(booking_breakup) ? booking_breakup : [];
          for (const bk of breakupArr) {
            const bkRes = await client.query(
              `INSERT INTO booking_breakup (booking_id, vendor_type, vendor_name, booking_ref_no, basis, valid_till, quantity, remarks, breakup_no) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
              [bookingId, bk.vendor_type || null, bk.vendor_name || null, bk.booking_ref_no || null, bk.basis || null, bk.valid_till || null, bk.quantity || null, bk.remarks || null, bk.breakup_no || null]
            );
            const bkId = bkRes.rows[0].id;

            // Handle container breakup
            if (bk.container_breakup && Array.isArray(bk.container_breakup)) {
              for (const cb of bk.container_breakup) {
                await client.query(
                  `INSERT INTO booking_container_breakup (booking_id, booking_breakup_id, vendor_name, booking_ref_no, basis, container_no, pickup_handover_date, empty_yard, breakup_no) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
                  [bookingId, bkId, bk.vendor_name || null, bk.booking_ref_no || null, bk.basis || null, cb.container_no || null, cb.pickup_handover_date || null, cb.empty_yard || null, bk.breakup_no || null]
                );
              }
            }

            // Handle package breakup
            if (bk.package_breakup && Array.isArray(bk.package_breakup)) {
              for (const pb of bk.package_breakup) {
                await client.query(
                  `INSERT INTO booking_package_breakup (booking_id, booking_breakup_id, vendor_name, booking_ref_no, basis, package_no, length_cm, width_cm, height_cm, weight_kgs, handover_date, carting, breakup_no) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
                  [bookingId, bkId, bk.vendor_name || null, bk.booking_ref_no || null, bk.basis || null, pb.package_no || null, pb.length_cm || null, pb.width_cm || null, pb.height_cm || null, pb.weight_kgs || null, pb.handover_date || null, pb.carting || null, bk.breakup_no || null]
                );
              }
            }
          }
        }
      }
      await client.query('COMMIT');
      res.json({ booking_no: bookingNo, message: 'Booking created successfully' });
    } catch (e) {
      await client.query('ROLLBACK');
      console.error('Error creating booking:', e);
      res.status(500).json({ error: 'Internal server error', message: e.message, detail: e.toString() });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Create booking route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const username = getUsernameFromToken(req);
  try {
    // await ensureBookingTable();
    const { booking_type, selected_enquiries = [], customer_id, customer_name, company_name, department, service_type, from_location, to_location, effective_date_from, effective_date_to, status, remarks, vendor_details, line_items, charges, cargo, carriage_map, schedules, companyCode, branchCode, departmentCode, serviceTypeCode, enquiry_type, booking_breakup, sub_breakup_vendor_type } = req.body || {};

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Update main booking table
      await client.query(
        `UPDATE booking SET 
           booking_type = COALESCE($1, booking_type),
           selected_enquiries = COALESCE($2, selected_enquiries),
           customer_id = COALESCE($3, customer_id),
           customer_name = COALESCE($4, customer_name),
           company_name = COALESCE($5, company_name),
           from_location = COALESCE($6, from_location),
           to_location = COALESCE($7, to_location),
           effective_date_from = COALESCE($8, effective_date_from),
           effective_date_to = COALESCE($9, effective_date_to),
           department = COALESCE($10, department),
           service_type = COALESCE($11, service_type),
           status = COALESCE($12, status),
           remarks = COALESCE($13, remarks),
           vendor_details = COALESCE($14, vendor_details),
           line_items = COALESCE($15, line_items),
           charges = COALESCE($16, charges),
           cargo = COALESCE($17, cargo),
           carriage_map = COALESCE($18, carriage_map),
           company_code = COALESCE($19, company_code),
           branch_code = COALESCE($20, branch_code),
           department_code = COALESCE($21, department_code),
           service_type_code = COALESCE($22, service_type_code),
           enquiry_type = COALESCE($23, enquiry_type),
           schedules = COALESCE($24, schedules),
           sub_breakup_vendor_type = COALESCE($25, sub_breakup_vendor_type),
           updated_by = $26,
           updated_at = NOW()
         WHERE id = $27`,
        [
          booking_type || null,
          JSON.stringify(selected_enquiries || []),
          customer_id || null,
          customer_name || null,
          company_name || null,
          from_location || null,
          to_location || null,
          effective_date_from || null,
          effective_date_to || null,
          department || null,
          service_type || null,
          status || null,
          remarks || null,
          vendor_details ? JSON.stringify(vendor_details) : null,
          line_items ? JSON.stringify(line_items) : null,
          charges ? JSON.stringify(charges) : null,
          cargo ? JSON.stringify(cargo) : null,
          carriage_map ? JSON.stringify(carriage_map) : null,
          companyCode || null,
          branchCode || null,
          departmentCode || null,
          serviceTypeCode || null,
          enquiry_type || null,
          schedules ? JSON.stringify(schedules) : null,
          sub_breakup_vendor_type || null,
          username,
          id
        ]
      );

      // Handle Booking Breakup
      await client.query('DELETE FROM booking_breakup WHERE booking_id = $1', [id]);
      const breakupArr = Array.isArray(booking_breakup) ? booking_breakup : [];
      for (const bk of breakupArr) {
        const bkRes = await client.query(
          `INSERT INTO booking_breakup (booking_id, vendor_type, vendor_name, booking_ref_no, basis, valid_till, quantity, remarks, breakup_no) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id`,
          [id, bk.vendor_type || null, bk.vendor_name || null, bk.booking_ref_no || null, bk.basis || null, bk.valid_till || null, bk.quantity || null, bk.remarks || null, bk.breakup_no || null]
        );
        const bkId = bkRes.rows[0].id;

        // Handle container breakup
        if (bk.container_breakup && Array.isArray(bk.container_breakup)) {
          for (const cb of bk.container_breakup) {
            await client.query(
              `INSERT INTO booking_container_breakup (booking_id, booking_breakup_id, vendor_name, booking_ref_no, basis, container_no, pickup_handover_date, empty_yard, breakup_no) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
              [id, bkId, bk.vendor_name || null, bk.booking_ref_no || null, bk.basis || null, cb.container_no || null, cb.pickup_handover_date || null, cb.empty_yard || null, bk.breakup_no || null]
            );
          }
        }

        // Handle package breakup
        if (bk.package_breakup && Array.isArray(bk.package_breakup)) {
          for (const pb of bk.package_breakup) {
            await client.query(
              `INSERT INTO booking_package_breakup (booking_id, booking_breakup_id, vendor_name, booking_ref_no, basis, package_no, length_cm, width_cm, height_cm, weight_kgs, handover_date, carting, breakup_no) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
              [id, bkId, bk.vendor_name || null, bk.booking_ref_no || null, bk.basis || null, pb.package_no || null, pb.length_cm || null, pb.width_cm || null, pb.height_cm || null, pb.weight_kgs || null, pb.handover_date || null, pb.carting || null, bk.breakup_no || null]
            );
          }
        }
      }

      // Handle Child Tables: Delete and Re-insert
      await client.query('DELETE FROM booking_line_items WHERE booking_id = $1', [id]);
      const liArr = Array.isArray(line_items) ? line_items : [];
      for (const li of liArr) {
        await client.query(
          `INSERT INTO booking_line_items (booking_id, s_no, basis, remarks, status, enquiry_no, enquiry_expiry) VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [id, (li.s_no ?? null) ?? null, li.basis || null, li.remarks || null, li.status || 'Active', li.enq_no || null, li.enq_exp || null]
        );
      }

      await client.query('DELETE FROM booking_charges WHERE booking_id = $1', [id]);
      const chArr = Array.isArray(charges) ? charges : [];
      for (const ch of chArr) {
        await client.query(
          `INSERT INTO booking_charges (booking_id, charge_name, currency, basis, amount, sell_rate_currency, sell_rate, gst_vat, remarks, raw) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
          [id, ch.charge_name || ch.name || null, ch.currency || null, ch.basis || null, ch.amount ?? ch.charges ?? null, ch.sell_rate_currency || null, ch.sell_rate || null, ch.gst_vat || ch.gst_rate || null, ch.remarks || null, JSON.stringify(ch)]
        );
      }

      await client.query('DELETE FROM booking_cargo WHERE booking_id = $1', [id]);
      const cargoArr = Array.isArray(cargo) ? cargo : [];
      for (const cg of cargoArr) {
        await client.query(
          `INSERT INTO booking_cargo (booking_id, cargo_type, description, quantity, unit, weight, volume, remarks, raw) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
          [id, cg.cargo_type || cg.type || null, cg.description || null, cg.quantity || null, cg.unit || null, cg.weight || null, cg.volume || null, cg.remarks || null, JSON.stringify(cg)]
        );
      }

      await client.query('DELETE FROM booking_carriage_map WHERE booking_id = $1', [id]);
      const cmArr = Array.isArray(carriage_map) ? carriage_map : [];
      let seq = 1;
      for (const cm of cmArr) {
        await client.query(
          `INSERT INTO booking_carriage_map (booking_id, sequence_no, mode, from_location, to_location, vendor_name, vehicle_no, transit_days, remarks, raw) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
          [id, cm.sequence_no || seq++, cm.mode || null, cm.from_location || null, cm.to_location || null, cm.vendor_name || null, cm.vehicle_no || null, cm.transit_days || null, cm.remarks || null, JSON.stringify(cm)]
        );
      }

      await client.query('DELETE FROM booking_schedules WHERE booking_id = $1', [id]);
      const schArr = Array.isArray(schedules) ? schedules : [];
      for (const sc of schArr) {
        await client.query(
          `INSERT INTO booking_schedules (booking_id, schedule_date, milestone, location, remarks, raw) VALUES ($1,$2,$3,$4,$5,$6)`,
          [id, sc.schedule_date || sc.date || null, sc.milestone || null, sc.location || null, sc.remarks || null, JSON.stringify(sc)]
        );
      }

      await client.query('COMMIT');

      const resUpdated = await client.query('SELECT * FROM booking WHERE id = $1', [id]);
      res.json(resUpdated.rows[0]);
    } catch (e) {
      await client.query('ROLLBACK');
      console.error('Error updating booking:', e);
      res.status(500).json({ error: 'Internal server error', details: e.message });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Update booking route error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});


router.get('/:bookingNo', async (req, res) => {
  try {
    const { bookingNo } = req.params;
    const { rows } = await pool.query('SELECT * FROM booking WHERE booking_no = $1', [bookingNo]);
    if (rows.length === 0) return res.status(404).json({ error: 'Booking not found' });

    const booking = rows[0];
    const breakupRes = await pool.query('SELECT * FROM booking_breakup WHERE booking_id = $1 ORDER BY id', [booking.id]);
    const breakupRows = breakupRes.rows;

    // BULK FETCH: Get all container and package breakups for this booking
    const { rows: allContainers } = await pool.query(
      'SELECT * FROM booking_container_breakup WHERE booking_id = $1',
      [booking.id]
    );
    const { rows: allPackages } = await pool.query(
      'SELECT * FROM booking_package_breakup WHERE booking_id = $1',
      [booking.id]
    );

    // Grouping logic in memory
    const containersByBreakup = allContainers.reduce((acc, c) => {
      if (!acc[c.booking_breakup_id]) acc[c.booking_breakup_id] = [];
      acc[c.booking_breakup_id].push(c);
      return acc;
    }, {});

    const packagesByBreakup = allPackages.reduce((acc, p) => {
      if (!acc[p.booking_breakup_id]) acc[p.booking_breakup_id] = [];
      acc[p.booking_breakup_id].push(p);
      return acc;
    }, {});

    for (let row of breakupRows) {
      row.container_breakup = containersByBreakup[row.id] || [];
      row.package_breakup = packagesByBreakup[row.id] || [];
    }
    booking.booking_breakup = breakupRows;

    // Fetch quote mappings
    const quoteMappingsRes = await pool.query('SELECT * FROM booking_quote_mapping WHERE booking_id = $1 ORDER BY breakup_number, enquiry_no', [booking.id]);
    booking.quote_mappings = quoteMappingsRes.rows;

    res.json(booking);
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});


// =====================================================
// QUOTE MAPPING ENDPOINTS
// =====================================================

// Get all quote mappings for a booking
router.get('/:bookingNo/quote-mappings', async (req, res) => {
  try {
    const { bookingNo } = req.params;
    const bookingRes = await pool.query('SELECT id FROM booking WHERE booking_no = $1', [bookingNo]);
    if (bookingRes.rows.length === 0) return res.status(404).json({ error: 'Booking not found' });

    const bookingId = bookingRes.rows[0].id;
    const { rows } = await pool.query(
      'SELECT * FROM booking_quote_mapping WHERE booking_id = $1 ORDER BY breakup_number, enquiry_no',
      [bookingId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Get quote mappings error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get enquiries associated with a booking
router.get('/:bookingNo/enquiries', async (req, res) => {
  try {
    const { bookingNo } = req.params;
    const { rows } = await pool.query('SELECT selected_enquiries FROM booking WHERE booking_no = $1', [bookingNo]);
    if (rows.length === 0) return res.status(404).json({ error: 'Booking not found' });

    const selectedEnquiries = safeJsonParse(rows[0].selected_enquiries);
    res.json(selectedEnquiries);
  } catch (error) {
    console.error('Get booking enquiries error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get line item types for a specific enquiry
router.get('/:bookingNo/enquiry/:enquiryNo/line-item-types', async (req, res) => {
  try {
    const { bookingNo, enquiryNo } = req.params;

    // Verify booking exists and enquiry is associated
    const bookingRes = await pool.query('SELECT selected_enquiries FROM booking WHERE booking_no = $1', [bookingNo]);
    if (bookingRes.rows.length === 0) return res.status(404).json({ error: 'Booking not found' });

    const selectedEnquiries = safeJsonParse(bookingRes.rows[0].selected_enquiries);
    const enquiryCodes = selectedEnquiries.map(e => e.code);

    if (!enquiryCodes.includes(enquiryNo)) {
      return res.status(400).json({ error: 'Enquiry not associated with this booking' });
    }

    // Get enquiry ID
    const enquiryRes = await pool.query('SELECT id FROM enquiry WHERE code = $1', [enquiryNo]);
    if (enquiryRes.rows.length === 0) return res.status(404).json({ error: 'Enquiry not found' });

    const enquiryId = enquiryRes.rows[0].id;

    // Get distinct line item types
    const { rows } = await pool.query(
      'SELECT DISTINCT type FROM enquiry_line_items WHERE enquiry_id = $1 AND type IS NOT NULL ORDER BY type',
      [enquiryId]
    );

    res.json(rows);
  } catch (error) {
    console.error('Get line item types error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

// Save/update quote mappings for a booking
router.post('/:bookingNo/quote-mappings', async (req, res) => {
  const username = getUsernameFromToken(req);
  try {
    const { bookingNo } = req.params;
    const { mappings } = req.body;

    if (!Array.isArray(mappings)) {
      return res.status(400).json({ error: 'Mappings must be an array' });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Get booking ID
      const bookingRes = await client.query('SELECT id, selected_enquiries FROM booking WHERE booking_no = $1', [bookingNo]);
      if (bookingRes.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Booking not found' });
      }

      const bookingId = bookingRes.rows[0].id;
      const selectedEnquiries = safeJsonParse(bookingRes.rows[0].selected_enquiries);
      const enquiryCodes = selectedEnquiries.map(e => e.code);

      // Delete existing mappings
      await client.query('DELETE FROM booking_quote_mapping WHERE booking_id = $1', [bookingId]);

      // Insert new mappings with validation
      for (const mapping of mappings) {
        const { breakup_type, breakup_number, enquiry_no, line_item_type } = mapping;

        // Validate required fields
        if (!breakup_type || !breakup_number || !enquiry_no || !line_item_type) {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: 'Missing required fields in mapping' });
        }

        // Validate enquiry is associated with booking
        if (!enquiryCodes.includes(enquiry_no)) {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: `Enquiry ${enquiry_no} is not associated with this booking` });
        }

        // Get enquiry ID and validate line item type
        const enquiryRes = await client.query('SELECT id FROM enquiry WHERE code = $1', [enquiry_no]);
        if (enquiryRes.rows.length === 0) {
          await client.query('ROLLBACK');
          return res.status(404).json({ error: `Enquiry ${enquiry_no} not found` });
        }

        const enquiryId = enquiryRes.rows[0].id;

        const lineItemRes = await client.query(
          'SELECT COUNT(*) FROM enquiry_line_items WHERE enquiry_id = $1 AND type = $2',
          [enquiryId, line_item_type]
        );

        if (parseInt(lineItemRes.rows[0].count) === 0) {
          await client.query('ROLLBACK');
          return res.status(400).json({ error: `Line item type "${line_item_type}" not found for enquiry ${enquiry_no}` });
        }

        // Insert mapping
        await client.query(
          `INSERT INTO booking_quote_mapping 
           (booking_id, booking_no, breakup_type, breakup_number, enquiry_no, enquiry_id, line_item_type, created_by) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [bookingId, bookingNo, breakup_type, breakup_number, enquiry_no, enquiryId, line_item_type, username]
        );
      }

      await client.query('COMMIT');

      // Fetch and return saved mappings
      const savedMappings = await client.query(
        'SELECT * FROM booking_quote_mapping WHERE booking_id = $1 ORDER BY breakup_number, enquiry_no',
        [bookingId]
      );

      res.json({ message: 'Quote mappings saved successfully', mappings: savedMappings.rows });
    } catch (e) {
      await client.query('ROLLBACK');
      console.error('Save quote mappings error:', e);
      res.status(500).json({ error: 'Internal server error' });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Save quote mappings route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete a specific quote mapping
router.delete('/:bookingNo/quote-mappings/:id', async (req, res) => {
  try {
    const { bookingNo, id } = req.params;

    // Verify booking exists
    const bookingRes = await pool.query('SELECT id FROM booking WHERE booking_no = $1', [bookingNo]);
    if (bookingRes.rows.length === 0) return res.status(404).json({ error: 'Booking not found' });

    const bookingId = bookingRes.rows[0].id;

    // Delete mapping
    const result = await pool.query(
      'DELETE FROM booking_quote_mapping WHERE id = $1 AND booking_id = $2 RETURNING *',
      [id, bookingId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Quote mapping not found' });
    }

    res.json({ message: 'Quote mapping deleted successfully', deleted: result.rows[0] });
  } catch (error) {
    console.error('Delete quote mapping error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
