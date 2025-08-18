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
    from, to, partyType, partyName, charges, freightChargeType, effectiveDate, periodStartDate, periodEndDate,company_code,branch_code,department_code

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
  const cleanPartyType = partyType === '' ? null : partyType;
  const cleanPartyName = partyName === '' ? null : partyName;
  const cleanCharges = charges === '' || charges === null ? null : parseFloat(charges);
  const cleanFreightChargeType = freightChargeType === '' ? null : freightChargeType;
  const cleanEffectiveDate = effectiveDate === '' ? null : effectiveDate;
  const cleanPeriodStartDate = periodStartDate === '' ? null : periodStartDate;
  const cleanPeriodEndDate = periodEndDate === '' ? null : periodEndDate;
  
  try {
    const result = await pool.query(
      `INSERT INTO tariff (
        code, mode, shipping_type, cargo_type, tariff_type, basis, container_type, item_name, currency,
        from_location, to_location, party_type, party_name, charges, freight_charge_type, effective_date, period_start_date, period_end_date,company_code,branch_code,department_code

      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19 , $20 , $21
      ) RETURNING *`,
      [
        code, mode, cleanShippingType, cleanCargoType, cleanTariffType, cleanBasis, cleanContainerType, cleanItemName, cleanCurrency,
        cleanFrom, cleanTo, cleanPartyType, cleanPartyName, cleanCharges, cleanFreightChargeType, cleanEffectiveDate, cleanPeriodStartDate, cleanPeriodEndDate,company_code,branch_code,department_code
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
    from, to, partyType, partyName, charges, freightChargeType, effectiveDate, periodStartDate, periodEndDate
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
  const cleanPartyType = partyType === '' ? null : partyType;
  const cleanPartyName = partyName === '' ? null : partyName;
  const cleanCharges = charges === '' || charges === null ? null : parseFloat(charges);
  const cleanFreightChargeType = freightChargeType === '' ? null : freightChargeType;
  const cleanEffectiveDate = effectiveDate === '' ? null : effectiveDate;
  const cleanPeriodStartDate = periodStartDate === '' ? null : periodStartDate;
  const cleanPeriodEndDate = periodEndDate === '' ? null : periodEndDate;
  
  try {
    const result = await pool.query(
      `UPDATE tariff SET
        code = $1, mode = $2, shipping_type = $3, cargo_type = $4, tariff_type = $5, basis = $6, container_type = $7, item_name = $8, currency = $9,
        from_location = $10, to_location = $11, party_type = $12, party_name = $13, charges = $14, freight_charge_type = $15, effective_date = $16, period_start_date = $17, period_end_date = $18
      WHERE id = $19 RETURNING *`,
      [
        code, mode, cleanShippingType, cleanCargoType, cleanTariffType, cleanBasis, cleanContainerType, cleanItemName, cleanCurrency,
        cleanFrom, cleanTo, cleanPartyType, cleanPartyName, cleanCharges, cleanFreightChargeType, cleanEffectiveDate, cleanPeriodStartDate, cleanPeriodEndDate, id
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