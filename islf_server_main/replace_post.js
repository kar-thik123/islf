const fs = require('fs');

let content = fs.readFileSync('routes/job_card.js', 'utf8');

// --- Replace POST ---
const postTarget = `
      booking_id,
      booking_no
    } = req.body || {};

    const userRes = await pool.query('SELECT company_code, branch_code, department_code FROM users WHERE username = $1', [username]);
    const uCtx = userRes.rows[0] || {};
    const effectiveCompany = companyCode || uCtx.company_code;
    const effectiveBranch = branchCode || uCtx.branch_code;
    const effectiveDept = departmentCode || uCtx.department_code;

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
            \`SELECT a.booking_breakup_id, a.breakup_type, a.item_no, j.job_card_no
             FROM job_card_breakup_allocation a
             JOIN job_card j ON a.job_card_id = j.id
             WHERE a.booking_id = $1
               AND a.is_active = true
               AND j.is_active = true\`,
            [booking_id]
          );

          for (const reqAlloc of requestedAllocations) {
            const isDup = existingAllocations.find(ea => 
              (Number(ea.booking_breakup_id) === Number(reqAlloc.id) && ea.breakup_type === reqAlloc.type) ||
              (ea.breakup_type === reqAlloc.type && ea.item_no && reqAlloc.item_no && ea.item_no.trim().toLowerCase() === reqAlloc.item_no.trim().toLowerCase())
            );
            if (isDup) {
              throw new Error(\`Duplicate Allocation Error: Row \${reqAlloc.item_no ? reqAlloc.item_no + ' ' : ''}(Type: \${reqAlloc.type}) is already allocated to Job Card \${isDup.job_card_no}\`);
            }
          }
        }
      }
`;

const postReplacement = `
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
            \`SELECT a.booking_breakup_id, a.breakup_type, a.item_no, j.job_card_no
             FROM job_card_breakup_allocation a
             JOIN job_card j ON a.job_card_id = j.id
             WHERE a.booking_id = ANY($1)
               AND a.is_active = true
               AND j.is_active = true\`,
            [Array.from(bookingIds)]
          );

          for (const reqAlloc of requestedAllocations) {
            const isDup = existingAllocations.find(ea => 
              (Number(ea.booking_breakup_id) === Number(reqAlloc.id) && ea.breakup_type === reqAlloc.type) ||
              (ea.breakup_type === reqAlloc.type && ea.item_no && reqAlloc.item_no && ea.item_no.trim().toLowerCase() === reqAlloc.item_no.trim().toLowerCase())
            );
            if (isDup) {
              throw new Error(\`Duplicate Allocation Error: Row \${reqAlloc.item_no ? reqAlloc.item_no + ' ' : ''}(Type: \${reqAlloc.type}) is already allocated to Job Card \${isDup.job_card_no}\`);
            }
          }
        }
      }
`;

content = content.replace(postTarget, postReplacement);


const postInsertTarget = `
           booking_id, booking_no
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28) RETURNING id\`,
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
          booking_no || null
        ]
      );
      
      const jobCardId = insertRes.rows[0].id;
      
      await insertJobCardRelatedData(client, jobCardId, {
        line_items,
        cargo,
        schedules,
        breakup
      });

      // Insert new allocations into job_card_breakup_allocation
      if (booking_id && Array.isArray(breakup) && breakup.length > 0) {
        const allocValues = [];
        let allocIdx = 1;
        const allocRows = [];
        for (const bk of breakup) {
          if (bk.booking_breakup_id && bk.breakup_type) {
            const itemNo = bk.container_no || bk.breakup_no || '';
            allocRows.push(\`($\${allocIdx}, $\${allocIdx+1}, $\${allocIdx+2}, $\${allocIdx+3}, $\${allocIdx+4}, $\${allocIdx+5}, $\${allocIdx+6}, $\${allocIdx+7}, $\${allocIdx+8}, $\${allocIdx+9}, $\${allocIdx+10}, $\${allocIdx+11})\`);
            allocValues.push(
              jobCardId,
              booking_id,
              booking_no,
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
          await client.query(
            \`INSERT INTO job_card_breakup_allocation 
             (job_card_id, booking_id, booking_no, booking_breakup_id, breakup_type, allocated_qty, allocation_status, company_code, branch_code, department_code, created_by, item_no) 
             VALUES \${allocRows.join(',')}\`,
            allocValues
          );
        }
      }
`;

const postInsertReplacement = `
           booking_id, booking_no, linked_bookings
         ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29) RETURNING id\`,
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
            allocRows.push(\`($\${allocIdx}, $\${allocIdx+1}, $\${allocIdx+2}, $\${allocIdx+3}, $\${allocIdx+4}, $\${allocIdx+5}, $\${allocIdx+6}, $\${allocIdx+7}, $\${allocIdx+8}, $\${allocIdx+9}, $\${allocIdx+10}, $\${allocIdx+11})\`);
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
          await client.query(
            \`INSERT INTO job_card_breakup_allocation 
             (job_card_id, booking_id, booking_no, booking_breakup_id, breakup_type, allocated_qty, allocation_status, company_code, branch_code, department_code, created_by, item_no) 
             VALUES \${allocRows.join(',')}\`,
            allocValues
          );
        }
      }
`;

content = content.replace(postInsertTarget, postInsertReplacement);


// --- Replace PUT ---
const putTarget = `
      booking_id,
      booking_no
    } = req.body || {};

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Duplicate Allocation Check (exclude current job card)
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
            \`SELECT a.booking_breakup_id, a.breakup_type, a.item_no, j.job_card_no
             FROM job_card_breakup_allocation a
             JOIN job_card j ON a.job_card_id = j.id
             WHERE a.booking_id = $1
               AND a.is_active = true
               AND j.is_active = true
               AND j.id <> $2\`,
            [booking_id, id]
          );

          for (const reqAlloc of requestedAllocations) {
            const isDup = existingAllocations.find(ea => 
              (Number(ea.booking_breakup_id) === Number(reqAlloc.id) && ea.breakup_type === reqAlloc.type) ||
              (ea.breakup_type === reqAlloc.type && ea.item_no && reqAlloc.item_no && ea.item_no.trim().toLowerCase() === reqAlloc.item_no.trim().toLowerCase())
            );
            if (isDup) {
              throw new Error(\`Duplicate Allocation Error: Row \${reqAlloc.item_no ? reqAlloc.item_no + ' ' : ''}(Type: \${reqAlloc.type}) is already allocated to Job Card \${isDup.job_card_no}\`);
            }
          }
        }
      }
`;

const putReplacement = `
      booking_id,
      booking_no,
      linked_bookings = []
    } = req.body || {};

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const bookingIds = new Set();
      if (booking_id) bookingIds.add(booking_id);
      if (Array.isArray(linked_bookings)) {
        for (const lb of linked_bookings) {
          if (lb.booking_id) bookingIds.add(lb.booking_id);
        }
      }

      // Duplicate Allocation Check (exclude current job card)
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
            \`SELECT a.booking_breakup_id, a.breakup_type, a.item_no, j.job_card_no
             FROM job_card_breakup_allocation a
             JOIN job_card j ON a.job_card_id = j.id
             WHERE a.booking_id = ANY($1)
               AND a.is_active = true
               AND j.is_active = true
               AND j.id <> $2\`,
            [Array.from(bookingIds), id]
          );

          for (const reqAlloc of requestedAllocations) {
            const isDup = existingAllocations.find(ea => 
              (Number(ea.booking_breakup_id) === Number(reqAlloc.id) && ea.breakup_type === reqAlloc.type) ||
              (ea.breakup_type === reqAlloc.type && ea.item_no && reqAlloc.item_no && ea.item_no.trim().toLowerCase() === reqAlloc.item_no.trim().toLowerCase())
            );
            if (isDup) {
              throw new Error(\`Duplicate Allocation Error: Row \${reqAlloc.item_no ? reqAlloc.item_no + ' ' : ''}(Type: \${reqAlloc.type}) is already allocated to Job Card \${isDup.job_card_no}\`);
            }
          }
        }
      }
`;

content = content.replace(putTarget, putReplacement);


const putUpdateTarget = `
           service_type_code = COALESCE($23, service_type_code),
           updated_by = $24,
           updated_at = NOW(),
           booking_id = $25,
           booking_no = $26
         WHERE id = $27\`,
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
          serviceTypeCode || null,
          username,
          booking_id || null,
          booking_no || null,
          id
        ]
      );

      // Replace child tables
      await client.query('DELETE FROM job_card_line_items WHERE job_card_id = $1', [id]);
      await client.query('DELETE FROM job_card_cargo WHERE job_card_id = $1', [id]);
      await client.query('DELETE FROM job_card_schedule WHERE job_card_id = $1', [id]);
      await client.query('DELETE FROM job_card_breakup WHERE job_card_id = $1', [id]);
      await client.query('DELETE FROM job_card_breakup_allocation WHERE job_card_id = $1', [id]);

      await insertJobCardRelatedData(client, id, {
        line_items,
        cargo,
        schedules,
        breakup
      });

      // Insert new allocations
      if (booking_id && Array.isArray(breakup) && breakup.length > 0) {
        const allocValues = [];
        let allocIdx = 1;
        const allocRows = [];
        for (const bk of breakup) {
          if (bk.booking_breakup_id && bk.breakup_type) {
            const itemNo = bk.container_no || bk.breakup_no || '';
            allocRows.push(\`($\${allocIdx}, $\${allocIdx+1}, $\${allocIdx+2}, $\${allocIdx+3}, $\${allocIdx+4}, $\${allocIdx+5}, $\${allocIdx+6}, $\${allocIdx+7}, $\${allocIdx+8}, $\${allocIdx+9}, $\${allocIdx+10}, $\${allocIdx+11})\`);
            allocValues.push(
              id,
              booking_id,
              booking_no,
              bk.booking_breakup_id,
              bk.breakup_type,
              1, 
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
          await client.query(
            \`INSERT INTO job_card_breakup_allocation 
             (job_card_id, booking_id, booking_no, booking_breakup_id, breakup_type, allocated_qty, allocation_status, company_code, branch_code, department_code, created_by, item_no) 
             VALUES \${allocRows.join(',')}\`,
            allocValues
          );
        }
      }
`;

const putUpdateReplacement = `
           service_type_code = COALESCE($23, service_type_code),
           updated_by = $24,
           updated_at = NOW(),
           booking_id = $25,
           booking_no = $26,
           linked_bookings = $27
         WHERE id = $28\`,
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
          serviceTypeCode || null,
          username,
          booking_id || null,
          booking_no || null,
          JSON.stringify(linked_bookings || []),
          id
        ]
      );

      // Replace child tables
      await client.query('DELETE FROM job_card_line_items WHERE job_card_id = $1', [id]);
      await client.query('DELETE FROM job_card_cargo WHERE job_card_id = $1', [id]);
      await client.query('DELETE FROM job_card_schedule WHERE job_card_id = $1', [id]);
      await client.query('DELETE FROM job_card_breakup WHERE job_card_id = $1', [id]);
      
      // SOFT DELETE old allocations instead of hard delete
      await client.query('UPDATE job_card_breakup_allocation SET is_active = false, allocation_status = \\'Released\\' WHERE job_card_id = $1', [id]);

      await insertJobCardRelatedData(client, id, {
        line_items,
        cargo,
        schedules,
        breakup
      });

      // Insert/Re-activate allocations
      if (Array.isArray(breakup) && breakup.length > 0) {
        for (const bk of breakup) {
          if (bk.booking_breakup_id && bk.breakup_type && bk.booking_id) {
            const itemNo = bk.container_no || bk.breakup_no || '';
            
            // Check if allocation already exists for this job and breakup
            const { rows: existing } = await client.query(
              \`SELECT id FROM job_card_breakup_allocation 
               WHERE job_card_id = $1 AND booking_breakup_id = $2 AND breakup_type = $3\`,
              [id, bk.booking_breakup_id, bk.breakup_type]
            );

            if (existing.length > 0) {
              // Reactivate
              await client.query(
                \`UPDATE job_card_breakup_allocation 
                 SET is_active = true, allocation_status = 'Allocated', item_no = $1, updated_at = NOW() 
                 WHERE id = $2\`,
                [itemNo, existing[0].id]
              );
            } else {
              // Insert new
              await client.query(
                \`INSERT INTO job_card_breakup_allocation 
                 (job_card_id, booking_id, booking_no, booking_breakup_id, breakup_type, allocated_qty, allocation_status, company_code, branch_code, department_code, created_by, item_no) 
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)\`,
                [
                  id,
                  bk.booking_id,
                  bk.booking_no || booking_no || null,
                  bk.booking_breakup_id,
                  bk.breakup_type,
                  1, 
                  'Allocated',
                  companyCode || null,
                  branchCode || null,
                  departmentCode || null,
                  username,
                  itemNo
                ]
              );
            }
          }
        }
      }
`;

content = content.replace(putUpdateTarget, putUpdateReplacement);

fs.writeFileSync('routes/job_card.js', content, 'utf8');
console.log('Replacements applied successfully');
