const express = require('express');
const router = express.Router();
const pool = require('../db');

/**
 * @route GET /api/public/bootstrap-config
 * @desc Explicitly exposes non-sensitive app configuration for frontend bootstrap.
 * @access Public
 */
router.get('/bootstrap-config', async (req, res) => {
    try {
        const keys = ['max_companies', 'default_logo', 'app_name', 'primary_color', 'secondary_color'];
        const result = await pool.query("SELECT key, value FROM settings WHERE key = ANY($1)", [keys]);

        const config = {};
        result.rows.forEach(row => {
            config[row.key] = row.value;
        });

        res.json({
            success: true,
            config: {
                maxCompanies: parseInt(config.max_companies || '1'),
                defaultLogo: config.default_logo || null,
                appName: config.app_name || 'ISLF Logistics',
                theme: {
                    primary: config.primary_color || '#3B82F6',
                    secondary: config.secondary_color || '#1F2937'
                }
            }
        });
    } catch (err) {
        console.error('Error fetching bootstrap config:', err);
        res.status(500).json({ error: 'Failed to initialize application' });
    }
});

module.exports = router;
