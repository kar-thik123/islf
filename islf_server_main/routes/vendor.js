const express = require('express');
const pool = require('../db');
const router = express.Router();

// GET all vendors
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM vendor ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching vendors:', err);
    res.status(500).json({ error: 'Failed to fetch vendors' });
  }
});

// CREATE new vendor (with number series logic and manual/default check)
router.post('/', async (req, res) => {
  let {
    seriesCode, vendor_no, type, name, name2, blocked, address, address1, country, state, city, postal_code, website,
    bill_to_vendor_name, vat_gst_no, place_of_supply, pan_no, tan_no, contacts
  } = req.body;
  try {
    if (seriesCode) {
      const seriesResult = await pool.query(
        'SELECT * FROM number_series WHERE code = $1 ORDER BY id DESC LIMIT 1',
        [seriesCode]
      );
      if (seriesResult.rows.length === 0) {
        return res.status(400).json({ error: 'Number series not found' });
      }
      const series = seriesResult.rows[0];
      if (series.is_manual) {
        if (!vendor_no || vendor_no.trim() === '') {
          return res.status(400).json({ error: 'Manual code entry required for this series' });
        }
        // Check for duplicate code
        const exists = await pool.query('SELECT 1 FROM vendor WHERE vendor_no = $1', [vendor_no]);
        if (exists.rows.length > 0) {
          return res.status(400).json({ error: 'Vendor No already exists' });
        }
      } else {
        // Not manual: generate code using relation
        const relResult = await pool.query(
          'SELECT * FROM number_relation WHERE number_series = $1 ORDER BY id DESC LIMIT 1',
          [seriesCode]
        );
        if (relResult.rows.length === 0) {
          return res.status(400).json({ error: 'Number series relation not found' });
        }
        const rel = relResult.rows[0];
        const nextNo = Number(rel.last_no_used) + Number(rel.increment_by);
        vendor_no = `${rel.prefix || ''}${nextNo}`;
        await pool.query(
          'UPDATE number_relation SET last_no_used = $1 WHERE id = $2',
          [nextNo, rel.id]
        );
      }
    } else if (!vendor_no || vendor_no === 'AUTO') {
      vendor_no = 'CUSTOMER-' + Date.now();
    }
    const result = await pool.query(
      `INSERT INTO vendor (
        vendor_no, type, name, name2, blocked, address, address1, country, state, city, postal_code, website,
        bill_to_vendor_name, vat_gst_no, place_of_supply, pan_no, tan_no, contacts
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
      ) RETURNING *`,
      [
        vendor_no, type, name, name2, blocked, address, address1, country, state, city, postal_code, website,
        bill_to_vendor_name, vat_gst_no, place_of_supply, pan_no, tan_no, JSON.stringify(contacts || [])
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error creating vendor:', err);
    res.status(500).json({ error: 'Failed to create vendor' });
  }
});

// UPDATE vendor by ID
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  const {
    vendor_no, type, name, name2, blocked, address, address1, country, state, city, postal_code, website,
    bill_to_vendor_name, vat_gst_no, place_of_supply, pan_no, tan_no, contacts
  } = req.body;
  try {
    const result = await pool.query(
      `UPDATE vendor SET
        vendor_no = $1, type = $2, name = $3, name2 = $4, blocked = $5, address = $6, address1 = $7, country = $8, state = $9, city = $10, postal_code = $11, website = $12,
        bill_to_vendor_name = $13, vat_gst_no = $14, place_of_supply = $15, pan_no = $16, tan_no = $17, contacts = $18
      WHERE id = $19 RETURNING *`,
      [
        vendor_no, type, name, name2, blocked, address, address1, country, state, city, postal_code, website,
        bill_to_vendor_name, vat_gst_no, place_of_supply, pan_no, tan_no, JSON.stringify(contacts || []), id
      ]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating vendor:', err);
    res.status(500).json({ error: 'Failed to update vendor' });
  }
});

// DELETE vendor by ID
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  try {
    const result = await pool.query(
      `DELETE FROM vendor WHERE id = $1 RETURNING *`,
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Vendor not found' });
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting vendor:', err);
    res.status(500).json({ error: 'Failed to delete vendor' });
  }
});

module.exports = router; 