const express = require('express');
const pool = require('../db');
const router = express.Router();

// Get max_companies setting
router.get('/max_companies', async (req, res) => {
  try {
    const result = await pool.query("SELECT value FROM settings WHERE key = 'max_companies'");
    if (result.rows.length === 0) {
      return res.json({ value: 1 }); // default to 1 if not set
    }
    res.json({ value: parseInt(result.rows[0].value, 10) });
  } catch (err) {
    console.error('Error fetching max_companies:', err);
    res.status(500).json({ error: 'Failed to fetch max_companies' });
  }
});

// Update max_companies setting
router.post('/max_companies', async (req, res) => {
  const { value } = req.body;
  if (!value || isNaN(value)) {
    return res.status(400).json({ error: 'Invalid value' });
  }
  try {
    await pool.query(
      `INSERT INTO settings (key, value) VALUES ('max_companies', $1)
       ON CONFLICT (key) DO UPDATE SET value = $1`,
      [value.toString()]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error updating max_companies:', err);
    res.status(500).json({ error: 'Failed to update max_companies' });
  }
});

// Get default_logo setting
router.get('/default_logo', async (req, res) => {
  try {
    const result = await pool.query("SELECT value FROM settings WHERE key = 'default_logo'");
    if (result.rows.length === 0) {
      return res.json({ value: null }); // default to null if not set
    }
    res.json({ value: result.rows[0].value });
  } catch (err) {
    console.error('Error fetching default_logo:', err);
    res.status(500).json({ error: 'Failed to fetch default_logo' });
  }
});

// Update default_logo setting
router.post('/default_logo', async (req, res) => {
  const { value } = req.body;
  if (!value) {
    return res.status(400).json({ error: 'Invalid value' });
  }
  try {
    await pool.query(
      `INSERT INTO settings (key, value) VALUES ('default_logo', $1)
       ON CONFLICT (key) DO UPDATE SET value = $1`,
      [value]
    );
    res.json({ success: true });
  } catch (err) {
    console.error('Error updating default_logo:', err);
    res.status(500).json({ error: 'Failed to update default_logo' });
  }
});

// Generic function to get document upload path for entity type
const getDocumentUploadPath = async (entityType) => {
  const result = await pool.query("SELECT value FROM settings WHERE key = $1", [`document_upload_path_${entityType}`]);
  if (result.rows.length === 0) {
    return `/uploads/documents/${entityType}`; // default path
  }
  return result.rows[0].value;
};

// Generic function to update document upload path for entity type
const updateDocumentUploadPath = async (entityType, value) => {
  await pool.query(
    `INSERT INTO settings (key, value) VALUES ($1, $2)
     ON CONFLICT (key) DO UPDATE SET value = $2`,
    [`document_upload_path_${entityType}`, value]
  );
};

// Get document upload path for specific entity type
router.get('/document_upload_path_:entityType', async (req, res) => {
  const { entityType } = req.params;
  try {
    const value = await getDocumentUploadPath(entityType);
    res.json({ value });
  } catch (err) {
    console.error(`Error fetching document_upload_path_${entityType}:`, err);
    res.status(500).json({ error: `Failed to fetch document_upload_path_${entityType}` });
  }
});

// Update document upload path for specific entity type
router.post('/document_upload_path_:entityType', async (req, res) => {
  const { entityType } = req.params;
  const { value } = req.body;
  if (!value) {
    return res.status(400).json({ error: 'Invalid value' });
  }
  try {
    await updateDocumentUploadPath(entityType, value);
    res.json({ success: true });
  } catch (err) {
    console.error(`Error updating document_upload_path_${entityType}:`, err);
    res.status(500).json({ error: `Failed to update document_upload_path_${entityType}` });
  }
});

module.exports = router; 