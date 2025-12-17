const express = require('express');
const router = express.Router();
const pool = require('../db');
const { getUsernameFromToken } = require('../utils/context-helper');

async function ensureBookingTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS booking (
      id SERIAL PRIMARY KEY,
      booking_no VARCHAR(50) UNIQUE NOT NULL,
      booking_type VARCHAR(20),
      enquiry_id INTEGER,
      selected_enquiries JSONB,
      customer_id INTEGER,
      customer_name VARCHAR(255),
      mail_id VARCHAR(255),
      phone_no1 VARCHAR(50),
      phone_no2 VARCHAR(50),
      company_name VARCHAR(255),
      from_location VARCHAR(255),
      to_location VARCHAR(255),
      effective_date_from DATE,
      effective_date_to DATE,
      department VARCHAR(100),
      service_type VARCHAR(100),
      status VARCHAR(50) DEFAULT 'Open',
      remarks TEXT,
      vendor_details JSONB,
      line_items JSONB,
      charges JSONB,
      cargo JSONB,
      carriage_map JSONB,
      schedules JSONB,
      company_code VARCHAR(10),
      branch_code VARCHAR(10),
      department_code VARCHAR(10),
      service_type_code VARCHAR(10),
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      created_by VARCHAR(100),
      updated_by VARCHAR(100)
    );
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_booking_no ON booking(booking_no);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_booking_status ON booking(status);`);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_booking_context ON booking(company_code, branch_code, department_code, service_type_code);`);
  await pool.query(`ALTER TABLE booking ADD COLUMN IF NOT EXISTS source_sales_person VARCHAR(255);`);
  await pool.query(`ALTER TABLE booking ADD COLUMN IF NOT EXISTS enquiry_type VARCHAR(100);`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS booking_line_items (
      id SERIAL PRIMARY KEY,
      booking_id INTEGER NOT NULL REFERENCES booking(id) ON DELETE CASCADE,
      s_no INTEGER,
      quantity DECIMAL(10,2),
      basis VARCHAR(100),
      remarks TEXT,
      status VARCHAR(50) DEFAULT 'Active',
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(booking_id, s_no)
    );
  `);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS booking_charges (
      id SERIAL PRIMARY KEY,
      booking_id INTEGER NOT NULL REFERENCES booking(id) ON DELETE CASCADE,
      charge_name VARCHAR(255),
      currency VARCHAR(10),
      basis VARCHAR(100),
      amount DECIMAL(15,2),
      sell_rate_currency VARCHAR(10),
      sell_rate DECIMAL(15,2),
      gst_vat DECIMAL(6,2),
      remarks TEXT,
      raw JSONB,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_booking_charges_booking ON booking_charges(booking_id);`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS booking_cargo (
      id SERIAL PRIMARY KEY,
      booking_id INTEGER NOT NULL REFERENCES booking(id) ON DELETE CASCADE,
      cargo_type VARCHAR(100),
      description TEXT,
      quantity DECIMAL(12,3),
      unit VARCHAR(50),
      weight DECIMAL(12,3),
      volume DECIMAL(12,3),
      remarks TEXT,
      raw JSONB,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_booking_cargo_booking ON booking_cargo(booking_id);`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS booking_carriage_map (
      id SERIAL PRIMARY KEY,
      booking_id INTEGER NOT NULL REFERENCES booking(id) ON DELETE CASCADE,
      sequence_no INTEGER,
      mode VARCHAR(50),
      from_location VARCHAR(255),
      to_location VARCHAR(255),
      vendor_name VARCHAR(255),
      vehicle_no VARCHAR(100),
      transit_days INTEGER,
      remarks TEXT,
      raw JSONB,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_booking_carriage_booking ON booking_carriage_map(booking_id);`);
  await pool.query(`
    CREATE TABLE IF NOT EXISTS booking_schedules (
      id SERIAL PRIMARY KEY,
      booking_id INTEGER NOT NULL REFERENCES booking(id) ON DELETE CASCADE,
      schedule_date DATE,
      milestone VARCHAR(255),
      location VARCHAR(255),
      remarks TEXT,
      raw JSONB,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    );
  `);
  await pool.query(`CREATE INDEX IF NOT EXISTS idx_booking_schedules_booking ON booking_schedules(booking_id);`);
}

router.get('/', async (req, res) => {
  try {
    // await ensureBookingTable(); // Removed for performance
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
    await ensureBookingTable();
    const { department, service_type, from_location, to_location } = req.body || {};
    let query = `SELECT id, code, customer_id, customer_name, company_name, from_location, to_location, effective_date_from, effective_date_to, department, service_type, service_type_code, department_code, status
                 FROM enquiry WHERE (status IN ('Open','Pending','Quoted'))`;
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
  const username = getUsernameFromToken(req) || 'system';
  try {
    await ensureBookingTable();
    const { booking_type, criteria, selected_enquiries = [], freeze, customer_id, customer_name, company_name, department, service_type, from_location, to_location, effective_date_from, effective_date_to, status = 'Open', remarks, vendor_details, line_items, charges, cargo, carriage_map, schedules, companyCode, branchCode, departmentCode, serviceTypeCode, enquiry_type } = req.body || {};

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      let bookingNo;
      let seriesCode;
      if (companyCode) {
        let whereConds = ["code_type = $1", "company_code = $2"];
        let params = ["bookingNo", companyCode];
        let p = 3;
        if (branchCode) { whereConds.push(`branch_code = $${p}`); params.push(branchCode); p++; } else { whereConds.push("(branch_code IS NULL OR branch_code = '')"); }
        if (departmentCode) { whereConds.push(`department_code = $${p}`); params.push(departmentCode); } else { whereConds.push("(department_code IS NULL OR department_code = '')"); }
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
        lineItemSnap = lineItemSnap || lis.map(li => ({ ...li, sourced_vendor: liVendorMap[li.id] || li.sourced_vendor || null }));
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
          `INSERT INTO booking (booking_no, booking_type, enquiry_id, selected_enquiries, customer_id, customer_name, company_name, from_location, to_location, effective_date_from, effective_date_to, department, service_type, status, remarks, vendor_details, line_items, charges, carriage_map, company_code, branch_code, department_code, service_type_code, created_by, enquiry_type)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25)`,
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
            enq.effective_date_from || effective_date_from || null,
            enq.effective_date_to || effective_date_to || null,
            enq.department || department || null,
            enq.service_type || service_type || null,
            status,
            remarks || enq.remarks || null,
            vendorSnap ? JSON.stringify(vendorSnap) : null,
            lineItemSnap ? JSON.stringify(lineItemSnap) : null,
            chargesSnap ? JSON.stringify(chargesSnap) : null,
            carriageMapSnap ? JSON.stringify(carriageMapSnap) : null,
            enq.company_code || null,
            enq.branch_code || null,
            enq.department_code || null,
            enq.service_type_code || null,
            username,
            enq.enquiry_type || enquiry_type || null
          ]
        );
        const bRes = await client.query('SELECT id FROM booking WHERE booking_no = $1', [bookingNo]);
        const bookingId = bRes.rows[0]?.id;
        if (bookingId) {
          const liArr = Array.isArray(lineItemSnap) ? lineItemSnap : [];
          for (const li of liArr) {
            await client.query(
              `INSERT INTO booking_line_items (booking_id, s_no, quantity, basis, remarks, status) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (booking_id, s_no) DO NOTHING`,
              [bookingId, li.s_no || null, li.quantity || null, li.basis || null, li.remarks || null, li.status || 'Active']
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
        }
      } else if (booking_type === 'from_enquiry') {
        await client.query(
          `INSERT INTO booking (booking_no, booking_type, selected_enquiries, customer_id, customer_name, company_name, from_location, to_location, effective_date_from, effective_date_to, department, service_type, status, remarks, company_code, branch_code, department_code, service_type_code, created_by, enquiry_type)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)`,
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
            companyCode || null,
            branchCode || null,
            departmentCode || null,
            serviceTypeCode || null,
            username,
            enquiry_type || null
          ]
        );
        const bRes = await client.query('SELECT id FROM booking WHERE booking_no = $1', [bookingNo]);
        const bookingId = bRes.rows[0]?.id;
        if (bookingId) {
          const liArr = Array.isArray(lineItemSnap) ? lineItemSnap : [];
          for (const li of liArr) {
            await client.query(
              `INSERT INTO booking_line_items (booking_id, s_no, quantity, basis, remarks, status) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (booking_id, s_no) DO NOTHING`,
              [bookingId, li.s_no || null, li.quantity || null, li.basis || null, li.remarks || null, li.status || 'Active']
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
        }
      } else {
        await client.query(
          `INSERT INTO booking (booking_no, booking_type, customer_id, customer_name, company_name, from_location, to_location, effective_date_from, effective_date_to, department, service_type, status, remarks, vendor_details, line_items, charges, cargo, carriage_map, schedules, company_code, branch_code, department_code, service_type_code, created_by, enquiry_type)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25)`,
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
            companyCode || null,
            branchCode || null,
            departmentCode || null,
            serviceTypeCode || null,
            username,
            enquiry_type || null
          ]
        );
        const bRes = await client.query('SELECT id FROM booking WHERE booking_no = $1', [bookingNo]);
        const bookingId = bRes.rows[0]?.id;
        if (bookingId) {
          const liArr = Array.isArray(lineItemSnap) ? lineItemSnap : [];
          for (const li of liArr) {
            await client.query(
              `INSERT INTO booking_line_items (booking_id, s_no, quantity, basis, remarks, status) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (booking_id, s_no) DO NOTHING`,
              [bookingId, (li.s_no ?? null) ?? null, li.quantity || null, li.basis || null, li.remarks || null, li.status || 'Active']
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
        }
      }
      await client.query('COMMIT');
      res.json({ booking_no: bookingNo, message: 'Booking created successfully' });
    } catch (e) {
      await client.query('ROLLBACK');
      console.error('Error creating booking:', e);
      res.status(500).json({ error: 'Internal server error' });
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
  const username = getUsernameFromToken(req) || 'system';
  try {
    await ensureBookingTable();
    const { booking_type, selected_enquiries = [], customer_id, customer_name, company_name, department, service_type, from_location, to_location, effective_date_from, effective_date_to, status, remarks, vendor_details, line_items, charges, cargo, carriage_map, schedules, companyCode, branchCode, departmentCode, serviceTypeCode, enquiry_type } = req.body || {};

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
           updated_by = $25,
           updated_at = NOW()
         WHERE id = $26`,
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
          username,
          id
        ]
      );

      // Handle Child Tables: Delete and Re-insert
      await client.query('DELETE FROM booking_line_items WHERE booking_id = $1', [id]);
      const liArr = Array.isArray(line_items) ? line_items : [];
      for (const li of liArr) {
        await client.query(
          `INSERT INTO booking_line_items (booking_id, s_no, quantity, basis, remarks, status) VALUES ($1,$2,$3,$4,$5,$6)`,
          [id, (li.s_no ?? null) ?? null, li.quantity || null, li.basis || null, li.remarks || null, li.status || 'Active']
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
      res.status(500).json({ error: 'Internal server error' });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Update booking route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


router.get('/:bookingNo', async (req, res) => {
  try {
    await ensureBookingTable();
    const { bookingNo } = req.params;
    const { rows } = await pool.query('SELECT * FROM booking WHERE booking_no = $1', [bookingNo]);
    if (rows.length === 0) return res.status(404).json({ error: 'Booking not found' });
    res.json(rows[0]);
  } catch (error) {
    console.error('Get booking error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
