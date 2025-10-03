const express = require('express');
const pool = require('../db');
const { logSetupEvent } = require('../log');
const router = express.Router();
const { getUsernameFromToken } = require('../utils/context-helper');

// Get all incharge records for an entity
router.get('/:entityType/:entityCode', async (req, res) => {
  try {
    const { entityType, entityCode } = req.params;
    const result = await pool.query(
      'SELECT * FROM incharge WHERE entity_type = $1 AND entity_code = $2 ORDER BY from_date DESC',
      [entityType, entityCode]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching incharge records:', err);
    res.status(500).json({ error: 'Failed to fetch incharge records' });
  }
});

// Get active incharge for an entity
router.get('/:entityType/:entityCode/active', async (req, res) => {
  try {
    const { entityType, entityCode } = req.params;
    const result = await pool.query(
      'SELECT * FROM incharge WHERE entity_type = $1 AND entity_code = $2 AND status = $3 ORDER BY from_date DESC LIMIT 1',
      [entityType, entityCode, 'active']
    );
    res.json(result.rows[0] || null);
  } catch (err) {
    console.error('Error fetching active incharge:', err);
    res.status(500).json({ error: 'Failed to fetch active incharge' });
  }
});

// Create new incharge record
router.post('/', async (req, res) => {
  
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { entity_type, entity_code, incharge_name, phone_number, email, status, from_date, to_date,din_pan, designation,appointment_date,cessation_date,signatory } = req.body;
    
    // If creating an active incharge, deactivate existing active ones
    if (status === 'active') {
      await client.query(
        'UPDATE incharge SET status = $1, to_date = CURRENT_DATE WHERE entity_type = $2 AND entity_code = $3 AND status = $4',
        ['inactive', entity_type, entity_code, 'active']
      );
    }
    const created_by = getUsernameFromToken(req);
    const result = await client.query(
      'INSERT INTO incharge (entity_type, entity_code, incharge_name, phone_number, email, status, from_date, to_date,din_pan, designation,appointment_date,cessation_date,signatory,created_by) VALUES ($1, $2, $3, $4, $5, $6, $7, $8,$9,$10,$11,$12,$13,$14) RETURNING *',
      [entity_type, entity_code, incharge_name, phone_number, email, status, from_date, to_date,din_pan, designation,appointment_date,cessation_date,signatory,created_by]
    );
    
    await client.query('COMMIT');
    
    // Log the setup event
    await logSetupEvent({
      username: getUsernameFromToken(req) ,
      action: 'CREATE',
      setupType: 'Incharge',
      entityType: entity_type,
      entityCode: entity_code,
      entityName: incharge_name,
      details: `Incharge created: ${incharge_name} for ${entity_type} ${entity_code}`
    });
    
    res.status(201).json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error creating incharge:', err);
    res.status(500).json({ error: 'Failed to create incharge' });
  } finally {
    client.release();
  }
});
router.get('/directors-partners/:entityCode', async (req, res) => {
  const client = await pool.connect();
  try {
    const { entityCode } = req.params;
    
    const result = await client.query(
      `SELECT * FROM incharge 
       WHERE entity_type = 'directors_partners' AND entity_code = $1 
       ORDER BY appointment_date DESC, created_at DESC`,
      [entityCode]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching directors-partners:', err);
    res.status(500).json({ error: 'Failed to fetch directors-partners' });
  } finally {
    client.release();
  }
});

// Update incharge record
router.put('/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    
    const { incharge_name, phone_number, email, status, from_date, to_date,din_pan, designation,appointment_date,cessation_date,signatory } = req.body;
    const { id } = req.params;
    
    // Get current record
    const currentResult = await client.query('SELECT * FROM incharge WHERE id = $1', [id]);
    if (currentResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Incharge record not found' });
    }
    
    const currentRecord = currentResult.rows[0];
    
    // If setting to active, deactivate other active records for the same entity
    if (status === 'active' && currentRecord.status !== 'active') {
      await client.query(
        'UPDATE incharge SET status = $1, to_date = CURRENT_DATE WHERE entity_type = $2 AND entity_code = $3 AND status = $4 AND id != $5',
        ['inactive', currentRecord.entity_type, currentRecord.entity_code, 'active', id]
      );
    }
    
    const result = await client.query(
      'UPDATE incharge SET incharge_name = $1, phone_number = $2, email = $3, status = $4, from_date = $5, to_date = $6, din_pan = $7, designation = $8, appointment_date = $9, cessation_date = $10, signatory = $11, updated_at = CURRENT_TIMESTAMP WHERE id = $12 RETURNING *',
      [incharge_name, phone_number, email, status, from_date, to_date, din_pan, designation, appointment_date, cessation_date, signatory, id]
    );
    
    await client.query('COMMIT');
    
    // Log the setup event
    await logSetupEvent({
      username: req.user?.username || 'system',
      action: 'UPDATE',
      setupType: 'Incharge',
      entityType: currentRecord.entity_type,
      entityCode: currentRecord.entity_code,
      entityName: incharge_name,
      details: `Incharge updated: ${incharge_name} for ${currentRecord.entity_type} ${currentRecord.entity_code}`
    });
    
    res.json(result.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error updating incharge:', err);
    res.status(500).json({ error: 'Failed to update incharge' });
  } finally {
    client.release();
  }
});

// Delete incharge record
router.delete('/:id', async (req, res) => {
  try {
    const result = await pool.query('DELETE FROM incharge WHERE id = $1 RETURNING *', [req.params.id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Incharge record not found' });
    }
    
    const deletedRecord = result.rows[0];
    
    // Log the setup event
    await logSetupEvent({
      username: req.user?.username || 'system',
      action: 'DELETE',
      setupType: 'Incharge',
      entityType: deletedRecord.entity_type,
      entityCode: deletedRecord.entity_code,
      entityName: deletedRecord.incharge_name,
      details: `Incharge deleted: ${deletedRecord.incharge_name} for ${deletedRecord.entity_type} ${deletedRecord.entity_code}`
    });
    
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting incharge:', err);
    res.status(500).json({ error: 'Failed to delete incharge' });
  }
});

module.exports = router;