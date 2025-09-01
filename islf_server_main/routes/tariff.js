const express = require('express');
const pool = require('../db');
const router = express.Router();

// GET all tariffs
router.get('/', async (req, res) => {
  try {
    const { companyCode, branchCode, departmentCode } = req.query;
    
    let query = `
      SELECT *
      FROM tariff
      WHERE 1=1
    `;
    
    const params = [];
    let paramIndex = 1;
    
    // Hierarchical filtering: if only company is selected, show all records for that company
    // If company + branch, show all records for that company and branch
    // If company + branch + department, show exact matches
    
    if (companyCode) {
      query += ` AND company_code = $${paramIndex}`;
      params.push(companyCode);
      paramIndex++;
      
      // Only filter by branch if branch is provided
      if (branchCode) {
        query += ` AND branch_code = $${paramIndex}`;
        params.push(branchCode);
        paramIndex++;
        
        // Only filter by department if department is provided
        if (departmentCode) {
          query += ` AND department_code = $${paramIndex}`;
          params.push(departmentCode);
          paramIndex++;
        }
      }
    }
    
    query += ` ORDER BY id ASC`;
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching tariffs:', err);
    res.status(500).json({ error: 'Failed to fetch tariffs' });
  }
});

// CREATE new tariff
router.post('/', async (req, res) => {
  const {
    code, mode, shippingType, cargoType, tariffType, basis, containerType, itemName, currency,
    locationTypeFrom, locationTypeTo, from, to, vendorType, vendorName, charges, freightChargeType, 
    effectiveDate, periodStartDate, periodEndDate, isMandatory, company_code, branch_code, department_code
  } = req.body;
  
  // Convert empty strings to null for optional fields
  const cleanShippingType = shippingType === '' ? null : shippingType;
  const cleanCargoType = cargoType === '' ? null : cargoType;
  const cleanTariffType = tariffType === '' ? null : tariffType;
  const cleanBasis = basis === '' ? null : basis;
  const cleanContainerType = containerType === '' ? null : containerType;
  const cleanItemName = itemName === '' ? null : itemName;
  const cleanCurrency = currency === '' ? null : currency;
  const cleanFrom = from === '' ? null : from;
  const cleanTo = to === '' ? null : to;
  const cleanVendorType = vendorType === '' ? null : vendorType;
  const cleanVendorName = vendorName === '' ? null : vendorName;
  const cleanCharges = charges === '' || charges === null ? null : parseFloat(charges);
  const cleanFreightChargeType = freightChargeType === '' ? null : freightChargeType;
  const cleanEffectiveDate = effectiveDate === '' ? null : effectiveDate;
  const cleanPeriodStartDate = periodStartDate === '' ? null : periodStartDate;
  const cleanPeriodEndDate = periodEndDate === '' ? null : periodEndDate;
  const cleanLocationTypeFrom = locationTypeFrom === '' ? null : locationTypeFrom;
  const cleanLocationTypeTo = locationTypeTo === '' ? null : locationTypeTo;
  
  try {
    // **ADD DUPLICATE CHECKING HERE**
    // Check for duplicate tariff based on key business fields
    const duplicateCheckQuery = `
      SELECT id, code FROM tariff 
      WHERE mode = $1 
        AND (shipping_type = $2 OR (shipping_type IS NULL AND $2 IS NULL))
        AND (cargo_type = $3 OR (cargo_type IS NULL AND $3 IS NULL))
        AND (tariff_type = $4 OR (tariff_type IS NULL AND $4 IS NULL))
        AND (basis = $5 OR (basis IS NULL AND $5 IS NULL))
        AND (container_type = $6 OR (container_type IS NULL AND $6 IS NULL))
        AND (item_name = $7 OR (item_name IS NULL AND $7 IS NULL))
        AND (currency = $8 OR (currency IS NULL AND $8 IS NULL))
        AND (location_type_from = $9 OR (location_type_from IS NULL AND $9 IS NULL))
        AND (from_location = $10 OR (from_location IS NULL AND $10 IS NULL))
        AND (location_type_to = $11 OR (location_type_to IS NULL AND $11 IS NULL))
        AND (to_location = $12 OR (to_location IS NULL AND $12 IS NULL))
        AND (vendor_type = $13 OR (vendor_type IS NULL AND $13 IS NULL))
        AND (vendor_name = $14 OR (vendor_name IS NULL AND $14 IS NULL))
        AND (effective_date = $15 OR (effective_date IS NULL AND $15 IS NULL))
        AND (period_start_date = $16 OR (period_start_date IS NULL AND $16 IS NULL))
        AND (period_end_date = $17 OR (period_end_date IS NULL AND $17 IS NULL))
        AND (charges = $18 OR (charges IS NULL AND $18 IS NULL))
        AND (freight_charge_type = $19 OR (freight_charge_type IS NULL AND $19 IS NULL))
        AND (is_mandatory = $20 OR (is_mandatory IS NULL AND $20 IS NULL))
        AND company_code = $21
        AND (branch_code = $22 OR (branch_code IS NULL AND $22 IS NULL))
        AND (department_code = $23 OR (department_code IS NULL AND $23 IS NULL))
      LIMIT 1
    `;
    
    const duplicateResult = await pool.query(duplicateCheckQuery, [
      mode, cleanShippingType, cleanCargoType, cleanTariffType, cleanBasis, 
      cleanContainerType, cleanItemName, cleanCurrency, cleanLocationTypeFrom, cleanFrom,
      cleanLocationTypeTo, cleanTo, cleanVendorType, cleanVendorName, cleanEffectiveDate,
      cleanPeriodStartDate, cleanPeriodEndDate, cleanCharges, cleanFreightChargeType,
      isMandatory || false, company_code, branch_code, department_code
    ]);
    
    if (duplicateResult.rows.length > 0) {
      return res.status(400).json({ 
        error: 'Duplicate tariff found', 
        message: `A tariff with the same combination of fields already exists (Code: ${duplicateResult.rows[0].code})`,
        duplicateCode: duplicateResult.rows[0].code
      });
    }
    
    let finalCode = code;
    let seriesCode;

    // Automatic series code lookup using context
    if ((!code || code === '') && company_code) {
      // Build dynamic query based on available context
      let whereConditions = ['code_type = $1', 'company_code = $2'];
      let queryParams = ['tariffCode', company_code];
      let paramIndex = 3;
      
      if (branch_code) {
        whereConditions.push(`branch_code = $${paramIndex}`);
        queryParams.push(branch_code);
        paramIndex++;
      } else {
        whereConditions.push('(branch_code IS NULL OR branch_code = \'\')'); 
      }
      
      if (department_code) {
        whereConditions.push(`department_code = $${paramIndex}`);
        queryParams.push(department_code);
      } else {
        whereConditions.push('(department_code IS NULL OR department_code = \'\')'); 
      }
      
      const mappingQuery = `SELECT mapping FROM mapping_relations
                       WHERE ${whereConditions.join(' AND ')}
                       ORDER BY id DESC
                       LIMIT 1`;
      
      const mappingRes = await pool.query(mappingQuery, queryParams);
      
      console.log('TARIFF MAPPING RESULT:', mappingRes.rows);
      if (mappingRes.rows.length > 0) {
        seriesCode = mappingRes.rows[0].mapping;
        console.log('TARIFF SERIES CODE FROM MAPPING:', seriesCode);
      }
    }

    // Generate tariff code if series code found
    if (seriesCode) {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        
        const seriesResult = await client.query(
          'SELECT * FROM number_series WHERE code = $1 ORDER BY id DESC LIMIT 1',
          [seriesCode]
        );
        
        console.log('TARIFF NUMBER SERIES RESULT:', seriesResult.rows);
        if (seriesResult.rows.length === 0) {
          await client.query('ROLLBACK');
          client.release();
          return res.status(400).json({ error: 'Number series not found' });
        }
        
        const series = seriesResult.rows[0];
        if (series.is_manual) {
          // Manual: require code from user
          if (!finalCode || finalCode.trim() === '') {
            await client.query('ROLLBACK');
            client.release();
            return res.status(400).json({ error: 'Manual code entry required for this series' });
          }
          // Check for duplicate code
          const exists = await client.query('SELECT 1 FROM tariff WHERE code = $1', [finalCode]);
          if (exists.rows.length > 0) {
            await client.query('ROLLBACK');
            client.release();
            return res.status(400).json({ error: 'Tariff code already exists' });
          }
        } else {
          // Generate automatic tariff code with row locking
          const relResult = await client.query(
            'SELECT * FROM number_relation WHERE number_series = $1 ORDER BY id DESC LIMIT 1 FOR UPDATE',
            [seriesCode]
          );
          
          console.log('TARIFF NUMBER RELATION RESULT:', relResult.rows);
          if (relResult.rows.length === 0) {
            await client.query('ROLLBACK');
            client.release();
            return res.status(400).json({ error: 'Number series relation not found' });
          }
          
          const rel = relResult.rows[0];
          let nextNo;
          if (rel.last_no_used === 0) {
            nextNo = Number(rel.starting_no);
          } else {
            nextNo = Number(rel.last_no_used) + Number(rel.increment_by);
          }
          
          finalCode = `${rel.prefix || ''}${nextNo}`;
          console.log('Generated tariff code:', finalCode);
          
          // Update the last_no_used within the same transaction
          await client.query(
            'UPDATE number_relation SET last_no_used = $1 WHERE id = $2',
            [nextNo, rel.id]
          );
        }
        
        await client.query('COMMIT');
        client.release();
      } catch (error) {
        await client.query('ROLLBACK');
        client.release();
        throw error;
      }
    } else if (!code || code === '') {
      // Fallback if no series found
      finalCode = 'TAR-' + Date.now();
    }
    
    const result = await pool.query(
      `INSERT INTO tariff (
        code, mode, shipping_type, cargo_type, tariff_type, basis, container_type, item_name, currency,
        location_type_from, location_type_to, from_location, to_location, vendor_type, vendor_name, 
        charges, freight_charge_type, effective_date, period_start_date, period_end_date, is_mandatory,
        company_code, branch_code, department_code
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24
      ) RETURNING *`,
      [
        finalCode, mode, cleanShippingType, cleanCargoType, cleanTariffType, cleanBasis, 
        cleanContainerType, cleanItemName, cleanCurrency, cleanLocationTypeFrom, cleanLocationTypeTo,
        cleanFrom, cleanTo, cleanVendorType, cleanVendorName, cleanCharges, cleanFreightChargeType, 
        cleanEffectiveDate, cleanPeriodStartDate, cleanPeriodEndDate, isMandatory || false, company_code, branch_code, department_code
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating tariff:', err);
    res.status(500).json({ error: 'Failed to create tariff' });
  }
});

// UPDATE tariff by ID
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  const {
    code, mode, shippingType, cargoType, tariffType, basis, containerType, itemName, currency,
    locationTypeFrom, locationTypeTo, from, to, vendorType, vendorName, charges, freightChargeType, 
    effectiveDate, periodStartDate, periodEndDate, isMandatory
  } = req.body;
  
  // Convert empty strings to null for optional fields
  const cleanShippingType = shippingType === '' ? null : shippingType;
  const cleanCargoType = cargoType === '' ? null : cargoType;
  const cleanTariffType = tariffType === '' ? null : tariffType;
  const cleanBasis = basis === '' ? null : basis;
  const cleanContainerType = containerType === '' ? null : containerType;
  const cleanItemName = itemName === '' ? null : itemName;
  const cleanCurrency = currency === '' ? null : currency;
  const cleanLocationTypeFrom = locationTypeFrom === '' ? null : locationTypeFrom;
  const cleanLocationTypeTo = locationTypeTo === '' ? null : locationTypeTo;
  const cleanFrom = from === '' ? null : from;
  const cleanTo = to === '' ? null : to;
  const cleanVendorType = vendorType === '' ? null : vendorType;
  const cleanVendorName = vendorName === '' ? null : vendorName;
  const cleanCharges = charges === '' || charges === null ? null : parseFloat(charges);
  const cleanFreightChargeType = freightChargeType === '' ? null : freightChargeType;
  const cleanEffectiveDate = effectiveDate === '' ? null : effectiveDate;
  const cleanPeriodStartDate = periodStartDate === '' ? null : periodStartDate;
  const cleanPeriodEndDate = periodEndDate === '' ? null : periodEndDate;
  
  try {
    const result = await pool.query(
      `UPDATE tariff SET
        code = $1, mode = $2, shipping_type = $3, cargo_type = $4, tariff_type = $5, basis = $6, container_type = $7, item_name = $8, currency = $9,
        location_type_from = $10, location_type_to = $11, from_location = $12, to_location = $13, vendor_type = $14, vendor_name = $15, charges = $16, freight_charge_type = $17, effective_date = $18, period_start_date = $19, period_end_date = $20, is_mandatory = $21
      WHERE id = $22 RETURNING *`,
      [
        code, mode, cleanShippingType, cleanCargoType, cleanTariffType, cleanBasis, cleanContainerType, cleanItemName, cleanCurrency,
        cleanLocationTypeFrom, cleanLocationTypeTo, cleanFrom, cleanTo, cleanVendorType, cleanVendorName, cleanCharges, cleanFreightChargeType, cleanEffectiveDate, cleanPeriodStartDate, cleanPeriodEndDate, isMandatory || false, id
      ]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Tariff not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating tariff:', err);
    res.status(500).json({ error: 'Failed to update tariff' });
  }
});

module.exports = router;