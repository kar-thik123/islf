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
    const { entity_type, entity_code, entity_name, doc_type, document_number, valid_from, valid_till } = req.body;
    const file = req.file;
    if (!entity_type || !entity_code || !doc_type || !file) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if entity exists based on entity_type and get entity name
    let entityExists = false;
    let entityName = '';
    
    // Use entity_name from request body if provided, otherwise fetch from database
    if (entity_name && entity_name.trim() !== '') {
      entityName = entity_name.trim();
    }
    
    switch (entity_type) {
      case 'customer':
        const customerResult = await pool.query('SELECT customer_no, name FROM customer WHERE customer_no = $1', [entity_code]);
        entityExists = customerResult.rows.length > 0;
        if (entityExists && !entityName) {
          entityName = customerResult.rows[0].name || entity_code;
        }
        break;
      case 'vendor':
        const vendorResult = await pool.query('SELECT vendor_no, name FROM vendor WHERE vendor_no = $1', [entity_code]);
        entityExists = vendorResult.rows.length > 0;
        if (entityExists && !entityName) {
          entityName = vendorResult.rows[0].name || entity_code;
        }
        break;
      case 'user':
        console.log('=== USER UPLOAD DEBUG ===');
        console.log('Entity code received:', entity_code);
        console.log('Entity name received:', entity_name);
        
        const userResult = await pool.query('SELECT employee_id, full_name FROM users WHERE employee_id = $1', [entity_code]);
        console.log('User query result:', userResult.rows);
        
        entityExists = userResult.rows.length > 0;
        if (entityExists && !entityName) {
          entityName = userResult.rows[0].full_name || entity_code;
        }
        console.log('Entity exists:', entityExists);
        console.log('Entity name after processing:', entityName);
        break;
      case 'company':
        const companyResult = await pool.query('SELECT code, name FROM companies WHERE code = $1', [entity_code]);
        entityExists = companyResult.rows.length > 0;
        if (entityExists && !entityName) {
          entityName = companyResult.rows[0].name || entity_code;
        }
        break;
      case 'branch':
        const branchResult = await pool.query('SELECT code, name FROM branches WHERE code = $1', [entity_code]);
        entityExists = branchResult.rows.length > 0;
        if (entityExists && !entityName) {
          entityName = branchResult.rows[0].name || entity_code;
        }
        break;
      case 'department':
        const departmentResult = await pool.query('SELECT code, name FROM departments WHERE code = $1', [entity_code]);
        entityExists = departmentResult.rows.length > 0;
        if (entityExists && !entityName) {
          entityName = departmentResult.rows[0].name || entity_code;
        }
        break;
      default:
        return res.status(400).json({ error: 'Invalid entity type' });
    }
    
    if (!entityExists) {
      return res.status(404).json({ error: `${entity_type} not found` });
    }

    // Fetch configured upload path from settings table
    console.log('=== UPLOAD PATH DEBUG ===');
    console.log('Entity type:', entity_type);
    
    let baseUploadDir;
    try {
      const settingsKey = `document_upload_path_${entity_type}`;
      console.log('Looking for settings key:', settingsKey);
      
      const settingsResult = await pool.query(
        "SELECT value FROM settings WHERE key = $1", 
        [settingsKey]
      );
      
      console.log('Settings query result:', settingsResult.rows);
      
      if (settingsResult.rows.length > 0 && settingsResult.rows[0].value) {
        baseUploadDir = settingsResult.rows[0].value;
        console.log('✅ Using configured path from settings:', baseUploadDir);
      } else {
        // Fallback to default path
        baseUploadDir = path.join('uploads', 'documents', entity_type);
        console.log('⚠️ No configured path found, using default path:', baseUploadDir);
      }
    } catch (settingsErr) {
      console.error('❌ Error fetching settings:', settingsErr);
      // Fallback to default path
      baseUploadDir = path.join('uploads', 'documents', entity_type);
      console.log('⚠️ Using default path due to settings error:', baseUploadDir);
    }
    
    console.log('Base upload dir before absolute check:', baseUploadDir);
    
    if (!path.isAbsolute(baseUploadDir)) {
      baseUploadDir = path.join(process.cwd(), baseUploadDir);
    }
    console.log('Final base upload dir:', baseUploadDir);
    
    // Create base directory if it doesn't exist
    if (!fs.existsSync(baseUploadDir)) {
      fs.mkdirSync(baseUploadDir, { recursive: true });
    }

    // Create entity-specific folder using entity name (sanitized for filesystem)
    const sanitizedEntityName = entityName.replace(/[^a-zA-Z0-9\s\-_]/g, '').replace(/\s+/g, '_');
    const entityFolder = path.join(baseUploadDir, sanitizedEntityName);
    
    // Create entity folder if it doesn't exist
    if (!fs.existsSync(entityFolder)) {
      fs.mkdirSync(entityFolder, { recursive: true });
    }

    // Use original filename, but ensure uniqueness
    const baseName = path.basename(file.originalname, path.extname(file.originalname));
    const ext = path.extname(file.originalname);
    const uniqueName = `${baseName}-${Date.now()}${ext}`;
    const finalPath = path.join(entityFolder, uniqueName);

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
    
    console.log(`Document uploaded successfully for ${entity_type} ${entity_code} (${entityName}) to: ${finalPath}`);
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

// Debug route to check document upload paths
router.get('/debug/upload-paths', async (req, res) => {
  try {
    const result = await pool.query("SELECT key, value FROM settings WHERE key LIKE 'document_upload_path_%' ORDER BY key");
    res.json({
      message: 'Document upload paths from database',
      paths: result.rows,
      count: result.rows.length
    });
  } catch (err) {
    console.error('Error fetching upload paths:', err);
    res.status(500).json({ error: 'Failed to fetch upload paths' });
  }
});

// Debug route to check document types
router.get('/debug/document-types/:entity_type', async (req, res) => {
  try {
    const { entity_type } = req.params;
    let docTypeKey;
    
    switch (entity_type) {
      case 'company':
      case 'branch':
      case 'department':
        docTypeKey = 'DOC_TYPE';
        break;
      case 'customer':
        docTypeKey = 'CUS_DOC_TYPE';
        break;
      case 'vendor':
        docTypeKey = 'VENDOR_DOC_TYPE';
        break;
      case 'user':
        docTypeKey = 'USER_DOC_TYPE';
        break;
      default:
        return res.status(400).json({ error: 'Invalid entity type' });
    }
    
    const result = await pool.query(
      "SELECT value, description FROM master_type WHERE key = $1 AND status = 'Active' ORDER BY value",
      [docTypeKey]
    );
    
    res.json({
      message: `Document types for ${entity_type}`,
      entity_type,
      docTypeKey,
      types: result.rows,
      count: result.rows.length
    });
  } catch (err) {
    console.error('Error fetching document types:', err);
    res.status(500).json({ error: 'Failed to fetch document types' });
  }
});

module.exports = router; 