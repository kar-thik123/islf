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

// Get complete configuration
router.get('/config', async (req, res) => {
  try {
    const result = await pool.query("SELECT key, value FROM settings");
    const config = {};
    
    result.rows.forEach(row => {
      config[row.key] = row.value;
    });
    
    // Transform the flat structure to nested config object
    const appConfig = {
      system: {
        maxCompanies: parseInt(config.max_companies || '1'),
        sessionTimeout: parseInt(config.session_timeout || '30'),
        defaultLanguage: config.default_language || 'en',
        defaultCurrency: config.default_currency || 'USD',
        maxFileSize: parseInt(config.max_file_size || '10'),
        dateFormat: config.date_format || 'DD/MM/YYYY',
        timeFormat: config.time_format || '24',
        timezone: config.timezone || 'UTC',
        decimalPlaces: parseInt(config.decimal_places || '2'),
        enableNotifications: config.enable_notifications === 'true',
        enableAuditLog: config.enable_audit_log === 'true',
        enableDataExport: config.enable_data_export === 'true',
        enableBulkOperations: config.enable_bulk_operations === 'true',
        maxRecordsPerPage: parseInt(config.max_records_per_page || '50'),
        enableAutoSave: config.enable_auto_save === 'true',
        autoSaveInterval: parseInt(config.auto_save_interval || '30')
      },
      email: {
        smtpHost: config.smtp_host || '',
        smtpPort: parseInt(config.smtp_port || '587'),
        username: config.smtp_username || '',
        password: config.smtp_password || '',
        fromEmail: config.from_email || '',
        fromName: config.from_name || '',
        passwordResetSubject: config.password_reset_subject || 'Password Reset Request',
        welcomeSubject: config.welcome_subject || 'Welcome to ISLF Logistics',
        notificationSubject: config.notification_subject || 'System Notification'
      },
      security: {
        minPasswordLength: parseInt(config.min_password_length || '8'),
        passwordExpiryDays: parseInt(config.password_expiry_days || '90'),
        requireUppercase: config.require_uppercase === 'true',
        requireLowercase: config.require_lowercase === 'true',
        requireNumbers: config.require_numbers === 'true',
        requireSpecialChars: config.require_special_chars === 'false',
        maxLoginAttempts: parseInt(config.max_login_attempts || '5'),
        lockoutDuration: parseInt(config.lockout_duration || '15'),
        enableTwoFactor: config.enable_two_factor === 'false',
        enableLoginNotifications: config.enable_login_notifications === 'true'
      },
      backup: {
        enableAutoBackup: config.enable_auto_backup === 'true',
        frequency: config.backup_frequency || 'daily',
        backupTime: config.backup_time ? new Date(config.backup_time) : new Date(),
        retentionDays: parseInt(config.backup_retention_days || '30'),
        backupPath: config.backup_path || '/backups/islf'
      },
      maintenance: {
        enableLogRotation: config.enable_log_rotation === 'true',
        logRetentionDays: parseInt(config.log_retention_days || '30'),
        enableSystemMonitoring: config.enable_system_monitoring === 'true',
        diskSpaceThreshold: parseInt(config.disk_space_threshold || '80'),
        dbCleanupInterval: parseInt(config.db_cleanup_interval || '7')
      },
      branding: {
        appName: config.app_name || 'ISLF Logistics',
        companyName: config.company_name || '',
        primaryColor: config.primary_color || '#3B82F6',
        secondaryColor: config.secondary_color || '#1F2937',
        supportEmail: config.support_email || '',
        supportPhone: config.support_phone || '',
        websiteUrl: config.website_url || '',
        address: config.address || '',
        defaultLogo: config.default_logo || null
      },
      logistics: {
        defaultShippingMethod: config.default_shipping_method || 'FCL',
        defaultContainerType: config.default_container_type || '20FT',
        defaultVesselType: config.default_vessel_type || 'Container',
        defaultUOM: config.default_uom || 'PCS',
        invoicePrefix: config.invoice_prefix || 'INV-',
        billOfLadingPrefix: config.bill_of_lading_prefix || 'BL-',
        containerPrefix: config.container_prefix || 'CONT-',
        vesselPrefix: config.vessel_prefix || 'VSL-',
        enableShipmentNotifications: config.enable_shipment_notifications === 'true',
        enableContainerAlerts: config.enable_container_alerts === 'true',
        enableVesselAlerts: config.enable_vessel_alerts === 'true',
        enableCustomsAlerts: config.enable_customs_alerts === 'true',
        alertEmailRecipients: config.alert_email_recipients || '',
        enableAPIIntegration: config.enable_api_integration === 'false',
        apiBaseUrl: config.api_base_url || '',
        apiKey: config.api_key || '',
        apiSecret: config.api_secret || ''
      },
      documentPaths: {
        customer: config.document_upload_path_customer || '/uploads/documents/customer',
        vendor: config.document_upload_path_vendor || '/uploads/documents/vendor',
        company: config.document_upload_path_company || '/uploads/documents/company',
        branch: config.document_upload_path_branch || '/uploads/documents/branch',
        department: config.document_upload_path_department || '/uploads/documents/department',
        user: config.document_upload_path_user || '/uploads/documents/user'
      }
    };
    
    res.json(appConfig);
  } catch (err) {
    console.error('Error fetching configuration:', err);
    res.status(500).json({ error: 'Failed to fetch configuration' });
  }
});

// Save complete configuration
router.post('/config', async (req, res) => {
  try {
    const config = req.body;
    
    // Debug: Log the backup time to see what we're receiving
    console.log('Received backup time:', config.backup?.backupTime, 'Type:', typeof config.backup?.backupTime);
    
    // Validate that config object exists and has required properties
    if (!config || !config.system || !config.email || !config.security || 
        !config.backup || !config.maintenance || !config.branding || 
        !config.logistics || !config.documentPaths) {
      return res.status(400).json({ error: 'Invalid configuration object' });
    }
    
    // Flatten the nested config object for database storage
    const settings = [
      { key: 'max_companies', value: config.system.maxCompanies.toString() },
      { key: 'session_timeout', value: config.system.sessionTimeout.toString() },
      { key: 'default_language', value: config.system.defaultLanguage },
      { key: 'default_currency', value: config.system.defaultCurrency },
      { key: 'max_file_size', value: config.system.maxFileSize.toString() },
      { key: 'date_format', value: config.system.dateFormat },
      { key: 'time_format', value: config.system.timeFormat },
      { key: 'timezone', value: config.system.timezone },
      { key: 'decimal_places', value: config.system.decimalPlaces.toString() },
      { key: 'enable_notifications', value: config.system.enableNotifications.toString() },
      { key: 'enable_audit_log', value: config.system.enableAuditLog.toString() },
      { key: 'enable_data_export', value: config.system.enableDataExport.toString() },
      { key: 'enable_bulk_operations', value: config.system.enableBulkOperations.toString() },
      { key: 'max_records_per_page', value: config.system.maxRecordsPerPage.toString() },
      { key: 'enable_auto_save', value: config.system.enableAutoSave.toString() },
      { key: 'auto_save_interval', value: config.system.autoSaveInterval.toString() },
      
      // Email settings
      { key: 'smtp_host', value: config.email.smtpHost },
      { key: 'smtp_port', value: config.email.smtpPort.toString() },
      { key: 'smtp_username', value: config.email.username },
      { key: 'smtp_password', value: config.email.password },
      { key: 'from_email', value: config.email.fromEmail },
      { key: 'from_name', value: config.email.fromName },
      { key: 'password_reset_subject', value: config.email.passwordResetSubject },
      { key: 'welcome_subject', value: config.email.welcomeSubject },
      { key: 'notification_subject', value: config.email.notificationSubject },
      
      // Security settings
      { key: 'min_password_length', value: config.security.minPasswordLength.toString() },
      { key: 'password_expiry_days', value: config.security.passwordExpiryDays.toString() },
      { key: 'require_uppercase', value: config.security.requireUppercase.toString() },
      { key: 'require_lowercase', value: config.security.requireLowercase.toString() },
      { key: 'require_numbers', value: config.security.requireNumbers.toString() },
      { key: 'require_special_chars', value: config.security.requireSpecialChars.toString() },
      { key: 'max_login_attempts', value: config.security.maxLoginAttempts.toString() },
      { key: 'lockout_duration', value: config.security.lockoutDuration.toString() },
      { key: 'enable_two_factor', value: config.security.enableTwoFactor.toString() },
      { key: 'enable_login_notifications', value: config.security.enableLoginNotifications.toString() },
      
      // Backup settings
      { key: 'enable_auto_backup', value: config.backup.enableAutoBackup.toString() },
      { key: 'backup_frequency', value: config.backup.frequency },
      { key: 'backup_time', value: (() => {
        try {
          return new Date(config.backup.backupTime).toISOString();
        } catch (error) {
          console.warn('Invalid backup time, using current date:', error);
          return new Date().toISOString();
        }
      })() },
      { key: 'backup_retention_days', value: config.backup.retentionDays.toString() },
      { key: 'backup_path', value: config.backup.backupPath },
      
      // Maintenance settings
      { key: 'enable_log_rotation', value: config.maintenance.enableLogRotation.toString() },
      { key: 'log_retention_days', value: config.maintenance.logRetentionDays.toString() },
      { key: 'enable_system_monitoring', value: config.maintenance.enableSystemMonitoring.toString() },
      { key: 'disk_space_threshold', value: config.maintenance.diskSpaceThreshold.toString() },
      { key: 'db_cleanup_interval', value: config.maintenance.dbCleanupInterval.toString() },
      
      // Branding settings
      { key: 'app_name', value: config.branding.appName },
      { key: 'company_name', value: config.branding.companyName },
      { key: 'primary_color', value: config.branding.primaryColor },
      { key: 'secondary_color', value: config.branding.secondaryColor },
      { key: 'support_email', value: config.branding.supportEmail },
      { key: 'support_phone', value: config.branding.supportPhone },
      { key: 'website_url', value: config.branding.websiteUrl },
      { key: 'address', value: config.branding.address },
      { key: 'default_logo', value: config.branding.defaultLogo || '' },
      
      // Logistics settings
      { key: 'default_shipping_method', value: config.logistics.defaultShippingMethod },
      { key: 'default_container_type', value: config.logistics.defaultContainerType },
      { key: 'default_vessel_type', value: config.logistics.defaultVesselType },
      { key: 'default_uom', value: config.logistics.defaultUOM },
      { key: 'invoice_prefix', value: config.logistics.invoicePrefix },
      { key: 'bill_of_lading_prefix', value: config.logistics.billOfLadingPrefix },
      { key: 'container_prefix', value: config.logistics.containerPrefix },
      { key: 'vessel_prefix', value: config.logistics.vesselPrefix },
      { key: 'enable_shipment_notifications', value: config.logistics.enableShipmentNotifications.toString() },
      { key: 'enable_container_alerts', value: config.logistics.enableContainerAlerts.toString() },
      { key: 'enable_vessel_alerts', value: config.logistics.enableVesselAlerts.toString() },
      { key: 'enable_customs_alerts', value: config.logistics.enableCustomsAlerts.toString() },
      { key: 'alert_email_recipients', value: config.logistics.alertEmailRecipients },
      { key: 'enable_api_integration', value: config.logistics.enableAPIIntegration.toString() },
      { key: 'api_base_url', value: config.logistics.apiBaseUrl },
      { key: 'api_key', value: config.logistics.apiKey },
      { key: 'api_secret', value: config.logistics.apiSecret },
      
      // Document paths
      { key: 'document_upload_path_customer', value: config.documentPaths.customer },
      { key: 'document_upload_path_vendor', value: config.documentPaths.vendor },
      { key: 'document_upload_path_company', value: config.documentPaths.company },
      { key: 'document_upload_path_branch', value: config.documentPaths.branch },
      { key: 'document_upload_path_department', value: config.documentPaths.department },
      { key: 'document_upload_path_user', value: config.documentPaths.user }
    ];
    
    // Save all settings
    for (const setting of settings) {
      await pool.query(
        `INSERT INTO settings (key, value) VALUES ($1, $2)
         ON CONFLICT (key) DO UPDATE SET value = $2`,
        [setting.key, setting.value]
      );
    }
    
    res.json({ success: true });
  } catch (err) {
    console.error('Error saving configuration:', err);
    res.status(500).json({ error: 'Failed to save configuration' });
  }
});

module.exports = router; 