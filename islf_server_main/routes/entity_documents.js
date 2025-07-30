const express = require('express');
const pool = require('../db');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Test route to verify the router is working
router.get('/test', (req, res) => {
  console.log('=== BASIC TEST ROUTE HIT ===');
  res.json({ message: 'Entity documents route is working' });
});

// Test route for debugging
router.get('/debug', (req, res) => {
  console.log('=== DEBUG ROUTE HIT ===');
  console.log('Request URL:', req.url);
  console.log('Request method:', req.method);
  console.log('Request headers:', req.headers);
  res.json({
    message: 'Debug route working',
    url: req.url,
    method: req.method,
    timestamp: new Date().toISOString()
  });
});

// Test route for root path
router.get('/', (req, res) => {
  console.log('=== ROOT PATH HIT ===');
  res.json({ message: 'Entity documents root route is working' });
});



// Test download route
router.get('/test-download', (req, res) => {
  console.log('=== TEST DOWNLOAD ROUTE HIT ===');
  res.json({ message: 'Test download route is working' });
});

// Test download with ID
router.get('/test-download/:id', (req, res) => {
  console.log('=== TEST DOWNLOAD WITH ID ===');
  console.log('ID:', req.params.id);
  res.json({ message: 'Test download with ID is working', id: req.params.id });
});

// Test view with ID
router.get('/test-view/:id', (req, res) => {
  console.log('=== TEST VIEW WITH ID ===');
  console.log('ID:', req.params.id);
  res.json({ message: 'Test view with ID is working', id: req.params.id });
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Always save to a temp folder first
    const tempDir = path.join(process.cwd(), 'uploads', 'tmp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    cb(null, tempDir);
  },
  filename: function (req, file, cb) {
    // Use a unique name to avoid collisions
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'image/jpeg',
      'image/png',
      'image/gif',
      'text/plain'
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, Word, Excel, images, and text files are allowed.'), false);
    }
  }
});

// DOWNLOAD document
router.get('/download/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  console.log('Download route hit for ID:', id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID format' });
  try {
    const result = await pool.query('SELECT * FROM entity_documents WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Document not found' });
    const document = result.rows[0];
    if (!document.file_path) {
      console.error('File path missing in DB for document ID:', id);
      return res.status(500).json({ error: 'File path missing in database' });
    }
    console.log('Trying to serve file:', document.file_path);
    if (!fs.existsSync(document.file_path)) {
      console.log('File not found:', document.file_path);
      return res.status(404).json({ error: 'File not found on server' });
    }
    res.sendFile(document.file_path);
  } catch (err) {
    console.error('Error downloading document:', err);
    res.status(500).json({ error: 'Failed to download document' });
  }
});

// VIEW document (for viewing in browser, not downloading)
router.get('/view/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  console.log('View route hit for ID:', id);
  if (isNaN(id)) return res.status(400).json({ error: 'Invalid ID format' });
  try {
    const result = await pool.query('SELECT * FROM entity_documents WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Document not found' });
    const document = result.rows[0];
    if (!document.file_path) {
      console.error('File path missing in DB for document ID:', id);
      return res.status(500).json({ error: 'File path missing in database' });
    }
    console.log('Trying to serve file:', document.file_path);
    if (!fs.existsSync(document.file_path)) {
      console.log('File not found:', document.file_path);
      return res.status(404).json({ error: 'File not found on server' });
    }
    res.sendFile(document.file_path);
  } catch (err) {
    console.error('Error viewing document:', err);
    res.status(500).json({ error: 'Failed to view document' });
  }
});

// GET all documents for an entity (by code)
router.get('/:entityType/:entityCode', async (req, res) => {
  const { entityType, entityCode } = req.params;
  try {
    const result = await pool.query(
      'SELECT * FROM entity_documents WHERE entity_type = $1 AND entity_code = $2 ORDER BY created_at DESC',
      [entityType, entityCode]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch entity documents' });
  }
});

// UPLOAD new document (use entity_code)
router.post('/upload', upload.single('document'), async (req, res) => {
  try {
    const { entity_type, entity_code, doc_type, document_number, valid_from, valid_till, uploadPath } = req.body;
    const file = req.file;
    if (!entity_type || !entity_code || !doc_type || !file) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if entity exists based on entity_type
    let entityExists = false;
    switch (entity_type) {
      case 'customer':
        entityExists = (await pool.query('SELECT customer_no FROM customer WHERE customer_no = $1', [entity_code])).rows.length > 0;
        break;
      case 'vendor':
        entityExists = (await pool.query('SELECT vendor_no FROM vendor WHERE vendor_no = $1', [entity_code])).rows.length > 0;
        break;
      case 'company':
        entityExists = (await pool.query('SELECT code FROM company WHERE code = $1', [entity_code])).rows.length > 0;
        break;
      default:
        return res.status(400).json({ error: 'Invalid entity type' });
    }
    if (!entityExists) {
      return res.status(404).json({ error: `${entity_type} not found` });
    }

    // Determine final destination
    let finalDir = uploadPath && uploadPath.trim() !== '' ? uploadPath : path.join('uploads', 'documents', entity_type);
    if (!path.isAbsolute(finalDir)) {
      finalDir = path.join(process.cwd(), finalDir);
    }
    if (!fs.existsSync(finalDir)) {
      fs.mkdirSync(finalDir, { recursive: true });
    }

    // Use original filename, but ensure uniqueness
    const baseName = path.basename(file.originalname, path.extname(file.originalname));
    const ext = path.extname(file.originalname);
    const uniqueName = `${baseName}-${Date.now()}${ext}`;
    const finalPath = path.join(finalDir, uniqueName);

    // Move file from temp to final destination
    fs.renameSync(file.path, finalPath);

    // Insert into DB
    const result = await pool.query(
      `INSERT INTO entity_documents (
        entity_type, entity_code, doc_type, document_number, valid_from, valid_till,
        file_path, file_name, file_size, mime_type
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [
        entity_type,
        entity_code,
        doc_type,
        document_number || null,
        valid_from || null,
        valid_till || null,
        finalPath,
        file.originalname,
        file.size,
        file.mimetype
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error('Error uploading document:', err);
    res.status(500).json({ error: 'Failed to upload document', details: err.message });
  }
});

// UPDATE document
router.put('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  const { doc_type, document_number, valid_from, valid_till } = req.body;
  try {
    const result = await pool.query(
      `UPDATE entity_documents SET
        doc_type = $1, document_number = $2, valid_from = $3, valid_till = $4
      WHERE id = $5 RETURNING *`,
      [doc_type, document_number, valid_from, valid_till, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error updating document:', err);
    res.status(500).json({ error: 'Failed to update document' });
  }
});

// DELETE document (moved to end to avoid conflicts)
router.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: 'Invalid ID format' });
  }
  try {
    const docResult = await pool.query('SELECT file_path FROM entity_documents WHERE id = $1', [id]);
    if (docResult.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }
    const filePath = docResult.rows[0].file_path;
    await pool.query('DELETE FROM entity_documents WHERE id = $1', [id]);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    res.json({ success: true });
  } catch (err) {
    console.error('Error deleting document:', err);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

module.exports = router; 