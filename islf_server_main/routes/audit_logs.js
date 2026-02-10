/**
 * AUDIT LOGS API ROUTES
 * Business-friendly audit log endpoints
 */

const express = require('express');
const router = express.Router();
const pool = require('../db');
const ExcelJS = require('exceljs');

/**
 * GET /api/audit_logs
 * List audit logs with filtering
 */
router.get('/', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 50,
            dateFrom,
            dateTo,
            moduleGroup,
            moduleName,
            username,
            action,
            status
        } = req.query;

        const offset = (Number(page) - 1) * Number(limit);

        let query = `
            SELECT 
                al.id, al.timestamp, al.username, al.module_name, al.module_group,
                al.action, al.status, al.record_id, al.record_name, al.summary
            FROM audit_logs al
            WHERE 1=1
        `;

        const params = [];
        let paramIndex = 1;

        // Date range filter
        if (dateFrom) {
            query += ` AND al.timestamp >= $${paramIndex}`;
            params.push(dateFrom);
            paramIndex++;
        }

        if (dateTo) {
            query += ` AND al.timestamp <= $${paramIndex}`;
            params.push(dateTo + ' 23:59:59');
            paramIndex++;
        }

        // Module group filter
        if (moduleGroup) {
            query += ` AND al.module_group = $${paramIndex}`;
            params.push(moduleGroup);
            paramIndex++;
        }

        // Module name filter
        if (moduleName) {
            query += ` AND al.module_name = $${paramIndex}`;
            params.push(moduleName);
            paramIndex++;
        }

        // Username filter
        if (username) {
            query += ` AND al.username ILIKE $${paramIndex}`;
            params.push(`%${username}%`);
            paramIndex++;
        }

        // Action filter
        if (action) {
            query += ` AND al.action = $${paramIndex}`;
            params.push(action);
            paramIndex++;
        }

        // Status filter
        if (status) {
            query += ` AND al.status = $${paramIndex}`;
            params.push(status);
            paramIndex++;
        }

        // Get total count
        const countQuery = `SELECT COUNT(*) FROM (${query}) AS total`;
        const countResult = await pool.query(countQuery, params);
        const total = parseInt(countResult.rows[0].count, 10);

        // Add ordering and pagination
        query += ` ORDER BY al.timestamp DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(Number(limit), offset);

        const result = await pool.query(query, params);

        res.json({
            data: result.rows,
            total,
            page: Number(page),
            limit: Number(limit)
        });
    } catch (error) {
        console.error('Error fetching audit logs:', error);
        res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
});

/**
 * GET /api/audit_logs/:id
 * Get audit log detail with field changes
 */
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;

        // Get audit log
        const logResult = await pool.query(
            'SELECT * FROM audit_logs WHERE id = $1',
            [id]
        );

        if (logResult.rows.length === 0) {
            return res.status(404).json({ error: 'Audit log not found' });
        }

        const auditLog = logResult.rows[0];

        // Get field changes
        const changesResult = await pool.query(
            `SELECT * FROM audit_log_changes 
             WHERE audit_log_id = $1 
             ORDER BY id`,
            [id]
        );

        auditLog.changes = changesResult.rows;

        res.json(auditLog);
    } catch (error) {
        console.error('Error fetching audit log detail:', error);
        res.status(500).json({ error: 'Failed to fetch audit log detail' });
    }
});

/**
 * GET /api/audit_logs/export/excel
 * Export audit logs to Excel
 */
router.get('/export/excel', async (req, res) => {
    try {
        const {
            dateFrom,
            dateTo,
            moduleGroup,
            moduleName,
            username,
            action,
            status
        } = req.query;

        // Build query (same as list, but no pagination)
        let query = `
            SELECT 
                al.timestamp, al.username, al.module_group, al.module_name,
                al.action, al.record_name, al.summary, al.status
            FROM audit_logs al
            WHERE 1=1
        `;

        const params = [];
        let paramIndex = 1;

        if (dateFrom) {
            query += ` AND al.timestamp >= $${paramIndex}`;
            params.push(dateFrom);
            paramIndex++;
        }

        if (dateTo) {
            query += ` AND al.timestamp <= $${paramIndex}`;
            params.push(dateTo + ' 23:59:59');
            paramIndex++;
        }

        if (moduleGroup) {
            query += ` AND al.module_group = $${paramIndex}`;
            params.push(moduleGroup);
            paramIndex++;
        }

        if (moduleName) {
            query += ` AND al.module_name = $${paramIndex}`;
            params.push(moduleName);
            paramIndex++;
        }

        if (username) {
            query += ` AND al.username ILIKE $${paramIndex}`;
            params.push(`%${username}%`);
            paramIndex++;
        }

        if (action) {
            query += ` AND al.action = $${paramIndex}`;
            params.push(action);
            paramIndex++;
        }

        if (status) {
            query += ` AND al.status = $${paramIndex}`;
            params.push(status);
            paramIndex++;
        }

        query += ` ORDER BY al.timestamp DESC LIMIT 10000`; // Max 10k records

        const result = await pool.query(query, params);

        // Create Excel workbook
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Audit Logs');

        // Define columns
        worksheet.columns = [
            { header: 'Timestamp', key: 'timestamp', width: 20 },
            { header: 'User', key: 'username', width: 15 },
            { header: 'Module Group', key: 'module_group', width: 15 },
            { header: 'Module', key: 'module_name', width: 20 },
            { header: 'Action', key: 'action', width: 12 },
            { header: 'Record Name', key: 'record_name', width: 30 },
            { header: 'Summary', key: 'summary', width: 50 },
            { header: 'Status', key: 'status', width: 10 }
        ];

        // Add rows
        result.rows.forEach(row => {
            worksheet.addRow({
                timestamp: new Date(row.timestamp).toLocaleString(),
                username: row.username,
                module_group: row.module_group,
                module_name: row.module_name,
                action: row.action,
                record_name: row.record_name,
                summary: row.summary,
                status: row.status
            });
        });

        // Style header row
        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
        };

        // Set response headers
        res.setHeader(
            'Content-Type',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        );
        res.setHeader(
            'Content-Disposition',
            `attachment; filename=audit_logs_${Date.now()}.xlsx`
        );

        // Write to response
        await workbook.xlsx.write(res);
        res.end();
    } catch (error) {
        console.error('Error exporting audit logs:', error);
        res.status(500).json({ error: 'Failed to export audit logs' });
    }
});

/**
 * GET /api/audit_logs/filters/module_groups
 * Get distinct module groups for filter dropdown
 */
router.get('/filters/module_groups', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT DISTINCT module_group 
             FROM module_registry 
             WHERE is_active = true 
             ORDER BY module_group`
        );

        res.json(result.rows.map(r => r.module_group));
    } catch (error) {
        console.error('Error fetching module groups:', error);
        res.status(500).json({ error: 'Failed to fetch module groups' });
    }
});

/**
 * GET /api/audit_logs/filters/modules
 * Get modules for a specific group
 */
router.get('/filters/modules', async (req, res) => {
    try {
        const { moduleGroup } = req.query;

        let query = 'SELECT module_name, display_name FROM module_registry WHERE is_active = true';
        const params = [];

        if (moduleGroup) {
            query += ' AND module_group = $1';
            params.push(moduleGroup);
        }

        query += ' ORDER BY display_name';

        const result = await pool.query(query, params);

        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching modules:', error);
        res.status(500).json({ error: 'Failed to fetch modules' });
    }
});

/**
 * GET /api/audit_logs/system_logs
 * List technical system logs (Super Admin only)
 */
router.get('/system_logs', async (req, res) => {
    try {
        const {
            page = 1,
            limit = 50,
            dateFrom,
            dateTo,
            method,
            status,
            search
        } = req.query;

        const offset = (Number(page) - 1) * Number(limit);

        let query = `
            SELECT 
                id, timestamp, username, module_name, action, endpoint, 
                method, status, status_code, duration_ms, ip_address, 
                user_agent, payload, response, error_message
            FROM system_logs
            WHERE 1=1
        `;

        const params = [];
        let paramIndex = 1;

        if (dateFrom) {
            query += ` AND timestamp >= $${paramIndex}`;
            params.push(dateFrom);
            paramIndex++;
        }

        if (dateTo) {
            query += ` AND timestamp <= $${paramIndex}`;
            params.push(dateTo + ' 23:59:59');
            paramIndex++;
        }

        if (method) {
            query += ` AND method = $${paramIndex}`;
            params.push(method);
            paramIndex++;
        }

        if (status) {
            query += ` AND status = $${paramIndex}`;
            params.push(status);
            paramIndex++;
        }

        if (search) {
            query += ` AND (endpoint ILIKE $${paramIndex} OR username ILIKE $${paramIndex})`;
            params.push(`%${search}%`);
            paramIndex++;
        }

        // Get total count
        const countQuery = `SELECT COUNT(*) FROM (${query}) AS total`;
        const countResult = await pool.query(countQuery, params);
        const total = parseInt(countResult.rows[0].count, 10);

        // Add ordering and pagination
        query += ` ORDER BY timestamp DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
        params.push(Number(limit), offset);

        const result = await pool.query(query, params);

        res.json({
            data: result.rows,
            total,
            page: Number(page),
            limit: Number(limit)
        });
    } catch (error) {
        console.error('Error fetching system logs:', error);
        res.status(500).json({ error: 'Failed to fetch system logs' });
    }
});

module.exports = router;
