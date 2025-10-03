const express = require('express');
const pool = require('../db');
const router = express.Router();
const { getUsernameFromToken } = require('../utils/context-helper');

// Get account details by entity
router.get('/:entityType/:entityCode', async (req, res) => {
  try {
    const { entityType, entityCode } = req.params;
    const result = await pool.query(
      'SELECT * FROM account_details WHERE entity_type = $1 AND entity_code = $2 ORDER BY created_at DESC',
      [entityType, entityCode]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching account details:', err);
    res.status(500).json({ error: 'Failed to fetch account details' });
  }
});

// Create account detail
router.post('/', async (req, res) => {
  const {
    entity_type,
    entity_code,
    beneficiary,
    bank_address,
    bank_name,
    account_number,
    bank_branch_code,
    rtgs_neft_code,
    account_type,
    swift_code,
    is_primary
  } = req.body;

  try {
    const created_by = getUsernameFromToken(req);
    const result = await pool.query(
      `INSERT INTO account_details 
       (entity_type, entity_code, beneficiary, bank_address, bank_name, account_number, 
        bank_branch_code, rtgs_neft_code, account_type, swift_code, is_primary, created_by) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11,$12) RETURNING *`,
      [entity_type, entity_code, beneficiary, bank_address, bank_name, account_number,
       bank_branch_code, rtgs_neft_code, account_type, swift_code, is_primary,created_by]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating account detail:', err);
    res.status(500).json({ error: 'Failed to create account detail' });
  }
});

// Update account detail
// Update account detail
// Update account detail
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const {
    beneficiary,
    bank_address,
    bank_name,
    account_number,
    bank_branch_code,
    rtgs_neft_code,
    account_type,
    swift_code,
    is_primary
  } = req.body;

  try {
    const result = await pool.query(
      `UPDATE account_details SET 
       beneficiary = $1, bank_address = $2, bank_name = $3, account_number = $4,
       bank_branch_code = $5, rtgs_neft_code = $6, account_type = $7, swift_code = $8,
       is_primary = $9, updated_at = CURRENT_TIMESTAMP
       WHERE id = $10 RETURNING *`,
      [beneficiary, bank_address, bank_name, account_number, bank_branch_code,
       rtgs_neft_code, account_type, swift_code, is_primary, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Account detail not found' });
    }
    
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating account detail:', err);
    res.status(500).json({ error: 'Failed to update account detail' });
  }
});

// Delete account detail
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM account_details WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Account detail not found' });
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting account detail:', err);
    res.status(500).json({ error: 'Failed to delete account detail' });
  }
});

module.exports = router;