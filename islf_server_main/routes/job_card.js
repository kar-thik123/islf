const express = require('express');
const router = express.Router();
const pool = require('../db');
const { getUsernameFromToken } = require('../utils/context-helper');
const { ADMIN_BYPASS_ROLES } = require('../constants/roles');

/**
 * Bulk insert helper for Job Card child tables
 */
async function insertJobCardRelatedData(client, jobCardId, data) {
  const { line_items, cargo, schedules, breakup } = data;

  // 1. Bulk insert line items
  const liArr = Array.isArray(line_items) ? line_items : [];
  if (liArr.length > 0) {
    const liValues = [];
    const liPlaceholders = liArr.map((li, i) => {
      const offset = i * 8;
      liValues.push(
        jobCardId,
        li.s_no || (i + 1),
        li.type || null,
        li.service_area || null,
        li.vendor || null,
        li.vendor_booking_no || null,
        li.basis || null,
        li.qty ?? null
      );
      return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8})`;
    }).join(',');
    if (liPlaceholders.length > 0) {
      const q = `INSERT INTO job_card_line_items (job_card_id, s_no, type, service_area, vendor, vendor_booking_no, basis, qty) 
       VALUES ${liPlaceholders}`;
      if (q.trim().length > 0) await client.query(q, liValues);
    }
  }

  // 2. Bulk insert cargo
  const cargoArr = Array.isArray(cargo) ? cargo : [];
  if (cargoArr.length > 0) {
    const cargoValues = [];
    const cargoPlaceholders = cargoArr.map((cg, i) => {
      const offset = i * 5;
      cargoValues.push(
        jobCardId,
        cg.cargo_type || null,
        cg.cargo_name || null,
        cg.hs_code || null,
        cg.remarks || null
      );
      return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5})`;
    }).join(',');
    if (cargoPlaceholders.length > 0) {
      const q = `INSERT INTO job_card_cargo (job_card_id, cargo_type, cargo_name, hs_code, remarks) 
       VALUES ${cargoPlaceholders}`;
      if (q.trim().length > 0) await client.query(q, cargoValues);
    }
  }

  // 3. Bulk insert schedules
  const schArr = Array.isArray(schedules) ? schedules : [];
  if (schArr.length > 0) {
    const schValues = [];
    const schPlaceholders = schArr.map((sc, i) => {
      const offset = i * 7;
      schValues.push(
        jobCardId,
        sc.from_location || null,
        sc.to_location || null,
        sc.vessel_airline || null,
        sc.voyage_flight_no || null,
        sc.etd ? new Date(sc.etd) : null,
        sc.eta ? new Date(sc.eta) : null
      );
      return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7})`;
    }).join(',');
    if (schPlaceholders.length > 0) {
      const q = `INSERT INTO job_card_schedule (job_card_id, from_location, to_location, vessel_airline, voyage_flight_no, etd, eta) 
       VALUES ${schPlaceholders}`;
      if (q.trim().length > 0) await client.query(q, schValues);
    }
  }

  // 4. Bulk insert breakups
  const breakupArr = Array.isArray(breakup) ? breakup : [];
  if (breakupArr.length > 0) {
    const bkValues = [];
    const bkPlaceholders = breakupArr.map((bk, i) => {
      const offset = i * 11;
      bkValues.push(
        jobCardId,
        bk.vendor_booking_no || null,
        bk.basis || null,
        bk.container_no || null,
        bk.pickup_handover_date ? new Date(bk.pickup_handover_date) : null,
        bk.pickup_handover_at || null,
        bk.remarks || null,
        bk.booking_breakup_id || null,
        bk.breakup_type || null,
        bk.booking_id || null,
        bk.booking_no || null
      );
      return `($${offset + 1}, $${offset + 2}, $${offset + 3}, $${offset + 4}, $${offset + 5}, $${offset + 6}, $${offset + 7}, $${offset + 8}, $${offset + 9}, $${offset + 10}, $${offset + 11})`;
    }).join(',');
    if (bkPlaceholders.length > 0) {
      const q = `INSERT INTO job_card_breakup (job_card_id, vendor_booking_no, basis, container_no, pickup_handover_date, pickup_handover_at, remarks, booking_breakup_id, breakup_type, booking_id, booking_no) 
       VALUES ${bkPlaceholders}`;
      if (q.trim().length > 0) await client.query(q, bkValues);
    }
  }
}

/**
 * GET list of Job Cards
 */
router.get('/', async (req, res) => {
  try {
    let { page = 1, limit = 10, search = '', status = '', companyCode, branchCode, departmentCode } = req.query;

    const isBypass = req.user && ADMIN_BYPASS_ROLES.has(req.user.role);
    if (!isBypass) {
      companyCode = companyCode || req.user.company_code;
      branchCode = branchCode || req.user.branch;
      departmentCode = departmentCode || req.user.department;

      if (!companyCode) {
        console.warn(`⚠️ [Context Leakage Prevention] No company context for user: ${req.user?.username}`);
        return res.json({ data: [], total: 0 });
      }
    }

    const offset = (Number(page) - 1) * Number(limit);

    let query = `SELECT id, job_card_no, job_date, company_name, department, service_type, from_location, to_location, status, created_at FROM job_card WHERE is_active = true`;

    const params = [];
    let idx = 1;
    if (status) {
      query += ` AND status = $${idx}`;
      params.push(status);
      idx++;
    }
    if (companyCode) {
      query += ` AND (company_code = $${idx} OR company_code IS NULL)`;
      params.push(companyCode);
      idx++;
      if (branchCode) {
        query += ` AND (branch_code = $${idx} OR branch_code IS NULL)`;
        params.push(branchCode);
        idx++;
        if (departmentCode) {
          query += ` AND (department_code = $${idx} OR department_code IS NULL)`;
          params.push(departmentCode);
          idx++;
        }
      }
    }
    if (search) {
      query += ` AND (job_card_no ILIKE $${idx} OR company_name ILIKE $${idx} OR department ILIKE $${idx} OR service_type ILIKE $${idx})`;
      params.push(`%${search}%`);
      idx++;
    }
    query += ` ORDER BY id DESC LIMIT $${idx} OFFSET $${idx + 1}`;
    params.push(Number(limit), Number(offset));

    let countQuery = `SELECT COUNT(*) FROM job_card WHERE is_active = true`;
    const countParams = [];
    let cIdx = 1;
    if (status) {
      countQuery += ` AND status = $${cIdx}`;
      countParams.push(status);
      cIdx++;
    }
    if (companyCode) {
      countQuery += ` AND (company_code = $${cIdx} OR company_code IS NULL)`;
      countParams.push(companyCode);
      cIdx++;
      if (branchCode) {
        countQuery += ` AND (branch_code = $${cIdx} OR branch_code IS NULL)`;
        countParams.push(branchCode);
        cIdx++;
        if (departmentCode) {
          countQuery += ` AND (department_code = $${cIdx} OR department_code IS NULL)`;
          countParams.push(departmentCode);
          cIdx++;
        }
      }
    }
    if (search) {
      countQuery += ` AND (job_card_no ILIKE $${cIdx} OR company_name ILIKE $${cIdx} OR department ILIKE $${cIdx} OR service_type ILIKE $${cIdx})`;
      countParams.push(`%${search}%`);
      cIdx++;
    }

    const [resRows, resCount] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, countParams)
    ]);

    res.json({ data: resRows.rows, total: Number(resCount.rows[0].count) });
  } catch (error) {
    console.error('Error listing job cards:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * GET - Active allocations for a booking
 */
router.get('/booking/:bookingId/allocations', async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { rows } = await pool.query(
      `SELECT a.booking_breakup_id, a.breakup_type, a.item_no, j.job_card_no, j.id as job_card_id
       FROM job_card_breakup_allocation a
       JOIN job_card j ON a.job_card_id = j.id
       WHERE a.booking_id = $1
         AND a.is_active = true
         AND j.is_active = true`,
      [bookingId]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error fetching booking allocations:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

/**
 * GET Job Card details by jobCardNo
 */
router.get('/:jobCardNo', async (req, res) => {
  try {
    const { jobCardNo } = req.params;
    const { rows } = await pool.query(
      `SELECT * FROM job_card WHERE job_card_no = $1 AND is_active = true`,
      [jobCardNo]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Job Card not found' });

    const jobCard = rows[0];

    // Fetch related child table data
    const [lineItemsRes, cargoRes, scheduleRes, breakupRes] = await Promise.all([
      pool.query('SELECT * FROM job_card_line_items WHERE job_card_id = $1 ORDER BY s_no', [jobCard.id]),
      pool.query('SELECT * FROM job_card_cargo WHERE job_card_id = $1 ORDER BY id', [jobCard.id]),
      pool.query('SELECT * FROM job_card_schedule WHERE job_card_id = $1 ORDER BY id', [jobCard.id]),
      pool.query('SELECT * FROM job_card_breakup WHERE job_card_id = $1 ORDER BY id', [jobCard.id])
    ]);

    jobCard.line_items = lineItemsRes.rows;
    jobCard.cargo = cargoRes.rows;
    jobCard.schedules = scheduleRes.rows;
    jobCard.breakup = breakupRes.rows;

    res.json(jobCard);
  } catch (error) {
    console.error('Get Job Card error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

/**
 * POST - Create manual Job Card
 */
router.post('/', async (req, res) => {
  const username = getUsernameFromToken(req);
  try {
    const {
      job_date,
      enquiry_type,
      company_name,
      sales_person,
      department,
      service_type,
      from_location_type,
      from_location,
      to_location_type,
      to_location,
      job_month,
      general_remarks,
      customer_remarks,
      vendor_remarks,
      job_remarks,
      status = 'Open',
      line_items = [],
      cargo = [],
      schedules = [],
      breakup = [],
      companyCode,
      branchCode,
      departmentCode,
      serviceTypeCode,
      booking_id,
      booking_no,
      linked_bookings = []
    } = req.body || {};

    const userRes = await pool.query('SELECT company_code, branch_code, department_code FROM users WHERE username = $1', [username]);
    const uCtx = userRes.rows[0] || {};
    const effectiveCompany = companyCode || uCtx.company_code;
    const effectiveBranch = branchCode || uCtx.branch_code;
    const effectiveDept = departmentCode || uCtx.department_code;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // 1. Build distinct booking list from request
      const bookingIds = new Set();
      if (booking_id) bookingIds.add(booking_id);
      if (Array.isArray(linked_bookings)) {
        for (const lb of linked_bookings) {
          if (lb.booking_id) bookingIds.add(lb.booking_id);
        }
      }

      // Duplicate Allocation Check (Multi-booking aware)
      if (Array.isArray(breakup) && breakup.length > 0) {
        const requestedAllocations = [];
        for (const bk of breakup) {
          if (bk.booking_breakup_id && bk.breakup_type) {
            const itemNo = bk.container_no || bk.breakup_no || '';
            requestedAllocations.push({ id: bk.booking_breakup_id, type: bk.breakup_type, item_no: itemNo });
            if (bk.booking_id) bookingIds.add(bk.booking_id);
          }
        }

        if (requestedAllocations.length > 0 && bookingIds.size > 0) {
          const { rows: existingAllocations } = await client.query(
            `SELECT a.booking_breakup_id, a.breakup_type, a.item_no, j.job_card_no
             FROM job_card_breakup_allocation a
             JOIN job_card j ON a.job_card_id = j.id
             WHERE a.booking_id = ANY($1)
               AND a.is_active = true
               AND j.is_active = true`,
            [Array.from(bookingIds)]
          );

          for (const reqAlloc of requestedAllocations) {
            const isDup = existingAllocations.find(ea => 
              (Number(ea.booking_breakup_id) === Number(reqAlloc.id) && ea.breakup_type === reqAlloc.type) ||
              (ea.breakup_type === reqAlloc.type && ea.item_no && reqAlloc.item_no && ea.item_no.trim().toLowerCase() === reqAlloc.item_no.trim().toLowerCase())
            );
            if (isDup) {
              throw new Error(`Duplicate Allocation Error: Row ${reqAlloc.item_no ? reqAlloc.item_no + ' ' : ''}(Type: ${reqAlloc.type}) is already allocated to Job Card ${isDup.job_card_no}`);
            }
          }
        }
      }
      
      let jobCardNo;
      let seriesCode;
      
      if (effectiveCompany) {
        let whereConds = ["code_type = $1", "company_code = $2"];
        let params = ["jobcardNo", effectiveCompany];
        let p = 3;
        if (effectiveBranch) {
          whereConds.push(`(branch_code = $${p} OR branch_code IS NULL OR branch_code = '')`);
          params.push(effectiveBranch);
          p++;
        } else {
          whereConds.push("(branch_code IS NULL OR branch_code = '')");
        }
        if (effectiveDept) {
          whereConds.push(`(department_code = $${p} OR department_code IS NULL OR department_code = '')`);
          params.push(effectiveDept);
        } else {
          whereConds.push("(department_code IS NULL OR department_code = '')");
        }
        
        const mapQ = `SELECT mapping FROM mapping_relations WHERE ${whereConds.join(' AND ')} ORDER BY id DESC LIMIT 1`;
        const mapRes = await client.query(mapQ, params);
        if (mapRes.rows.length > 0) {
          seriesCode = mapRes.rows[0].mapping;
        }
      }
      
      if (seriesCode) {
        const seriesRes = await client.query("SELECT * FROM number_series WHERE code = $1 ORDER BY id DESC LIMIT 1", [seriesCode]);
        if (seriesRes.rows.length > 0) {
          const relRes = await client.query("SELECT * FROM number_relation WHERE number_series = $1 ORDER BY id DESC LIMIT 1 FOR UPDATE", [seriesCode]);
          if (relRes.rows.length > 0) {
            const rel = relRes.rows[0];
            let nextNo = rel.last_no_used === 0 ? Number(rel.starting_no) : Number(rel.last_no_used) + Number(rel.increment_by);
            jobCardNo = `${rel.prefix || ''}${nextNo}`;
            await client.query("UPDATE number_relation SET last_no_used = $1 WHERE id = $2", [nextNo, rel.id]);
          }
        }
      }
      
      if (!jobCardNo) {
        const nextNoRes = await client.query(`SELECT COALESCE(MAX(CAST(SUBSTRING(job_card_no FROM '[0-9]+') AS INTEGER)), 0) + 1 as next_no FROM job_card WHERE job_card_no ~ '^JBC[0-9]+$'`);
        jobCardNo = 'JBC' + nextNoRes.rows[0].next_no.toString().padStart(6, '0');
      }

      const insertRes = await client.query(
        `INSERT INTO job_card (
           job_card_no, job_date, enquiry_type, company_name, sales_person, department, service_type,
           from_location_type, from_location, to_location_type, to_location, job_month, general_remarks,
           customer_remarks, vendor_remarks, job_remarks,
           line_items, cargo, schedules, breakup,
           status, company_code, branch_code, department_code, service_type_code, created_by,
           booking_id, booking_no, linked_bookings
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29) RETURNING id`,
        [
          jobCardNo,
          job_date ? new Date(job_date) : new Date(),
          enquiry_type || null,
          company_name || null,
          sales_person || null,
          department || null,
          service_type || null,
          from_location_type || null,
          from_location || null,
          to_location_type || null,
          to_location || null,
          job_month || null,
          general_remarks || null,
          customer_remarks || null,
          vendor_remarks || null,
          job_remarks || null,
          JSON.stringify(line_items),
          JSON.stringify(cargo),
          JSON.stringify(schedules),
          JSON.stringify(breakup),
          status,
          effectiveCompany || null,
          effectiveBranch || null,
          effectiveDept || null,
          serviceTypeCode || null,
          username,
          booking_id || null,
          booking_no || null,
          JSON.stringify(linked_bookings || [])
        ]
      );
      
      const jobCardId = insertRes.rows[0].id;
      
      await insertJobCardRelatedData(client, jobCardId, {
        line_items,
        cargo,
        schedules,
        breakup
      });

      // Insert new allocations into job_card_breakup_allocation (Multi-booking aware)
      if (Array.isArray(breakup) && breakup.length > 0) {
        const allocValues = [];
        let allocIdx = 1;
        const allocRows = [];
        for (const bk of breakup) {
          if (bk.booking_breakup_id && bk.breakup_type && bk.booking_id) {
            const itemNo = bk.container_no || bk.breakup_no || '';
            allocRows.push(`($${allocIdx}, $${allocIdx+1}, $${allocIdx+2}, $${allocIdx+3}, $${allocIdx+4}, $${allocIdx+5}, $${allocIdx+6}, $${allocIdx+7}, $${allocIdx+8}, $${allocIdx+9}, $${allocIdx+10}, $${allocIdx+11})`);
            allocValues.push(
              jobCardId,
              bk.booking_id,
              bk.booking_no || booking_no || null,
              bk.booking_breakup_id,
              bk.breakup_type,
              1, // allocated_qty
              'Allocated',
              effectiveCompany || null,
              effectiveBranch || null,
              effectiveDept || null,
              username,
              itemNo
            );
            allocIdx += 12;
          }
        }
        if (allocRows.length > 0) {
          const allocQuery = `INSERT INTO job_card_breakup_allocation 
             (job_card_id, booking_id, booking_no, booking_breakup_id, breakup_type, allocated_qty, allocation_status, company_code, branch_code, department_code, created_by, item_no) 
             VALUES ${allocRows.join(',')}`;
          if (allocQuery.trim().length > 0) {
            await client.query(allocQuery, allocValues);
          }
        }
      }

      await client.query('COMMIT');
      res.json({ id: jobCardId, job_card_no: jobCardNo, message: 'Job Card created successfully' });
    } catch (e) {
      await client.query('ROLLBACK');
      console.error('Error creating Job Card:', e);
      if (e.message && e.message.startsWith('Duplicate Allocation')) {
        return res.status(400).json({ error: 'Validation Error', details: e.message });
      }
      res.status(500).json({ error: 'Internal server error', message: e.message });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Create Job Card route error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * PUT - Update Job Card fields & child relationships
 */
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const username = getUsernameFromToken(req);
  try {
    const {
      job_date,
      enquiry_type,
      company_name,
      sales_person,
      department,
      service_type,
      from_location_type,
      from_location,
      to_location_type,
      to_location,
      job_month,
      general_remarks,
      customer_remarks,
      vendor_remarks,
      job_remarks,
      status,
      line_items = [],
      cargo = [],
      schedules = [],
      breakup = [],
      companyCode,
      branchCode,
      departmentCode,
      serviceTypeCode,
      booking_id,
      booking_no
    } = req.body || {};

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Duplicate Allocation Check
      if (booking_id && Array.isArray(breakup) && breakup.length > 0) {
        const requestedAllocations = [];
        for (const bk of breakup) {
          if (bk.booking_breakup_id && bk.breakup_type) {
            const itemNo = bk.container_no || bk.breakup_no || '';
            requestedAllocations.push({ id: bk.booking_breakup_id, type: bk.breakup_type, item_no: itemNo });
          }
        }

        if (requestedAllocations.length > 0) {
          const { rows: existingAllocations } = await client.query(
            `SELECT a.booking_breakup_id, a.breakup_type, a.item_no, j.job_card_no
             FROM job_card_breakup_allocation a
             JOIN job_card j ON a.job_card_id = j.id
             WHERE a.booking_id = $1
               AND a.is_active = true
               AND j.is_active = true
               AND j.id <> $2`,
            [booking_id, id]
          );

          for (const reqAlloc of requestedAllocations) {
            const isDup = existingAllocations.find(ea => 
              (Number(ea.booking_breakup_id) === Number(reqAlloc.id) && ea.breakup_type === reqAlloc.type) ||
              (ea.breakup_type === reqAlloc.type && ea.item_no && reqAlloc.item_no && ea.item_no.trim().toLowerCase() === reqAlloc.item_no.trim().toLowerCase())
            );
            if (isDup) {
              throw new Error(`Duplicate Allocation Error: Row ${reqAlloc.item_no ? reqAlloc.item_no + ' ' : ''}(Type: ${reqAlloc.type}) is already allocated to Job Card ${isDup.job_card_no}`);
            }
          }
        }
      }

      await client.query(
        `UPDATE job_card SET 
           job_date = COALESCE($1, job_date),
           enquiry_type = COALESCE($2, enquiry_type),
           company_name = COALESCE($3, company_name),
           sales_person = COALESCE($4, sales_person),
           department = COALESCE($5, department),
           service_type = COALESCE($6, service_type),
           from_location_type = COALESCE($7, from_location_type),
           from_location = COALESCE($8, from_location),
           to_location_type = COALESCE($9, to_location_type),
           to_location = COALESCE($10, to_location),
           job_month = COALESCE($11, job_month),
           general_remarks = COALESCE($12, general_remarks),
           customer_remarks = COALESCE($13, customer_remarks),
           vendor_remarks = COALESCE($14, vendor_remarks),
           job_remarks = COALESCE($15, job_remarks),
           status = COALESCE($16, status),
           line_items = $17,
           cargo = $18,
           schedules = $19,
           breakup = $20,
           company_code = COALESCE($21, company_code),
           branch_code = COALESCE($22, branch_code),
           department_code = COALESCE($23, department_code),
           service_type_code = COALESCE($24, service_type_code),
           updated_by = $25,
           updated_at = NOW(),
           booking_id = $27,
           booking_no = $28
         WHERE id = $26`,
        [
          job_date ? new Date(job_date) : null,
          enquiry_type || null,
          company_name || null,
          sales_person || null,
          department || null,
          service_type || null,
          from_location_type || null,
          from_location || null,
          to_location_type || null,
          to_location || null,
          job_month || null,
          general_remarks || null,
          customer_remarks || null,
          vendor_remarks || null,
          job_remarks || null,
          status || null,
          JSON.stringify(line_items),
          JSON.stringify(cargo),
          JSON.stringify(schedules),
          JSON.stringify(breakup),
          companyCode || null,
          branchCode || null,
          departmentCode || null,
          serviceTypeCode || null,
          username,
          id,
          booking_id || null,
          booking_no || null
        ]
      );

      // Handle Child Tables: Delete and Re-insert
      await client.query('DELETE FROM job_card_line_items WHERE job_card_id = $1', [id]);
      await client.query('DELETE FROM job_card_cargo WHERE job_card_id = $1', [id]);
      await client.query('DELETE FROM job_card_schedule WHERE job_card_id = $1', [id]);
      await client.query('DELETE FROM job_card_breakup WHERE job_card_id = $1', [id]);

      await insertJobCardRelatedData(client, id, {
        line_items,
        cargo,
        schedules,
        breakup
      });

      // Update allocations: Delete old allocations for this Job Card and insert new ones
      await client.query('DELETE FROM job_card_breakup_allocation WHERE job_card_id = $1', [id]);

      if (booking_id && Array.isArray(breakup) && breakup.length > 0) {
        const allocValues = [];
        let allocIdx = 1;
        const allocRows = [];
        for (const bk of breakup) {
          if (bk.booking_breakup_id && bk.breakup_type) {
            const itemNo = bk.container_no || bk.breakup_no || '';
            allocRows.push(`($${allocIdx}, $${allocIdx+1}, $${allocIdx+2}, $${allocIdx+3}, $${allocIdx+4}, $${allocIdx+5}, $${allocIdx+6}, $${allocIdx+7}, $${allocIdx+8}, $${allocIdx+9}, $${allocIdx+10}, $${allocIdx+11})`);
            allocValues.push(
              id,
              booking_id,
              booking_no,
              bk.booking_breakup_id,
              bk.breakup_type,
              1, // allocated_qty
              'Allocated',
              companyCode || null,
              branchCode || null,
              departmentCode || null,
              username,
              itemNo
            );
            allocIdx += 12;
          }
        }
        if (allocRows.length > 0) {
          const allocQuery = `INSERT INTO job_card_breakup_allocation 
             (job_card_id, booking_id, booking_no, booking_breakup_id, breakup_type, allocated_qty, allocation_status, company_code, branch_code, department_code, created_by, item_no) 
             VALUES ${allocRows.join(',')}`;
          if (allocQuery.trim().length > 0) {
            await client.query(allocQuery, allocValues);
          }
        }
      }

      await client.query('COMMIT');
      res.json({ message: 'Job Card updated successfully' });
    } catch (e) {
      await client.query('ROLLBACK');
      console.error('Error updating Job Card:', e);
      if (e.message && e.message.startsWith('Duplicate Allocation')) {
        return res.status(400).json({ error: 'Validation Error', details: e.message });
      }
      res.status(500).json({ error: 'Internal server error', details: e.message });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Update Job Card route error:', error);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

/**
 * PUT - Update Job Card status directly (reopen/close)
 */
router.put('/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    await pool.query(
      `UPDATE job_card SET status = $1, updated_at = NOW() WHERE id = $2`,
      [status, id]
    );
    res.json({ message: `Job Card status updated to ${status}` });
  } catch (error) {
    console.error('Error updating Job Card status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * DELETE - Soft delete/disable Job Card
 */
router.delete('/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    await client.query('BEGIN');
    await client.query(
      `UPDATE job_card SET is_active = false, status = 'Cancelled', updated_at = NOW() WHERE id = $1`,
      [id]
    );
    await client.query(
      `UPDATE job_card_breakup_allocation SET is_active = false, updated_at = NOW() WHERE job_card_id = $1`,
      [id]
    );
    await client.query('COMMIT');
    res.json({ message: 'Job Card disabled successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error disabling Job Card:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
});

module.exports = router;
