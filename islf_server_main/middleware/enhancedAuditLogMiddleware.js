/**
 * ENHANCED AUDIT LOG MIDDLEWARE
 * Captures field-level changes and routes to appropriate log tables
 * - Business logs -> audit_logs + audit_log_changes
 * - Technical logs -> system_logs
 */

const pool = require('../db');
const { getUsernameFromToken } = require('../utils/context-helper');
const { detectChanges } = require('../utils/changeDetector');
const { generateSummary } = require('../utils/summaryGenerator');
const { getFieldSchema } = require('../config/fieldSchemas');

/**
 * Enhanced middleware for audit logging with field-level change tracking
 */
function enhancedAuditLogMiddleware(req, res, next) {
    const startTime = Date.now();

    // Store original data for UPDATE operations
    let oldData = null;

    // Capture original methods
    const originalSend = res.send;
    const originalJson = res.json;
    let responseBody;

    // Override response methods
    res.send = function (body) {
        responseBody = body;
        return originalSend.apply(res, arguments);
    };

    res.json = function (body) {
        responseBody = body;
        return originalJson.apply(res, arguments);
    };

    // For UPDATE operations, capture old data before proceeding
    if (req.method === 'PUT' || req.method === 'PATCH') {
        captureOldData(req).then(data => {
            oldData = data;
            proceedWithRequest();
        }).catch(err => {
            console.error('Error capturing old data:', err);
            proceedWithRequest();
        });
    } else {
        proceedWithRequest();
    }

    function proceedWithRequest() {
        // Continue with request
        res.on('finish', async () => {
            try {
                await logAuditData();
            } catch (error) {
                console.error('Error logging audit data:', error);
            }
        });

        next();
    }

    async function logAuditData() {
        const duration = Date.now() - startTime;
        const username = getUsernameFromToken(req) || 'Anonymous';

        // Extract module and action
        const pathParts = req.baseUrl ? req.baseUrl.split('/') : req.path.split('/');
        let moduleName = pathParts.find(p => p && p !== 'api') || 'root';

        // Determine action
        let action = determineAction(req);

        // Skip LIST operations (noise reduction)
        if (action === 'LIST') return;

        // Get module group from registry
        const moduleGroup = await getModuleGroup(moduleName);

        // Extract record ID and name
        const recordInfo = extractRecordInfo(req, responseBody, moduleName);

        // Detect changes for UPDATE/CREATE
        const newData = req.method !== 'GET' ? req.body : null;
        const fieldSchema = getFieldSchema(moduleName);
        const changes = await detectChanges(oldData, newData, fieldSchema);

        // Generate summary
        const summary = generateSummary(changes, action, moduleName, recordInfo.recordName);

        // Get context
        const context = extractContext(req);

        // Log to audit_logs (business) - Only if module is registered
        if (moduleGroup !== 'Unknown') {
            await logBusinessAudit({
                username,
                moduleName,
                moduleGroup,
                action,
                status: res.statusCode >= 400 ? 'ERROR' : 'SUCCESS',
                recordId: recordInfo.recordId,
                recordName: recordInfo.recordName,
                summary,
                changes,
                ipAddress: req.ip || req.headers['x-forwarded-for'],
                ...context
            });
        }

        // Log to system_logs (technical) - Super Admin only
        await logSystemLog({
            username,
            moduleName,
            action,
            endpoint: req.originalUrl || req.url,
            method: req.method,
            payload: req.method !== 'GET' ? req.body : req.query,
            response: res.statusCode < 400 ? responseBody : null,
            status: res.statusCode >= 400 ? 'ERROR' : 'SUCCESS',
            statusCode: res.statusCode,
            errorMessage: res.statusCode >= 400 ? JSON.stringify(responseBody) : null,
            durationMs: duration,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'],
            ...context
        });
    }
}

/**
 * Capture old data before UPDATE
 */
async function captureOldData(req) {
    const pathParts = req.baseUrl ? req.baseUrl.split('/') : req.path.split('/');
    const moduleName = pathParts.find(p => p && p !== 'api');
    const recordId = req.params.code || req.params.id || req.body.code || req.body.id;

    if (!moduleName || !recordId) return null;

    try {
        // Attempt to fetch old data from database
        const tableName = moduleName;
        const idField = req.params.code ? 'code' : 'id';

        const result = await pool.query(
            `SELECT * FROM ${tableName} WHERE ${idField} = $1 LIMIT 1`,
            [recordId]
        );

        return result.rows[0] || null;
    } catch (error) {
        console.error('Error fetching old data:', error);
        return null;
    }
}

/**
 * Determine action from request
 */
function determineAction(req) {
    if (req.method === 'POST') return 'CREATE';
    if (req.method === 'PUT' || req.method === 'PATCH') return 'UPDATE';
    if (req.method === 'DELETE') return 'DELETE';
    if (req.method === 'GET') {
        return req.params.id || req.params.code ? 'FETCH_BY_ID' : 'LIST';
    }
    return req.method;
}

/**
 * Get module group from registry
 */
async function getModuleGroup(moduleName) {
    try {
        const result = await pool.query(
            'SELECT module_group FROM module_registry WHERE module_name = $1',
            [moduleName]
        );
        return result.rows[0]?.module_group || 'Unknown';
    } catch (error) {
        console.error('Error fetching module group:', error);
        return 'Unknown';
    }
}

/**
 * Extract record ID and name from request/response
 */
function extractRecordInfo(req, responseBody, moduleName) {
    let recordId = req.params.code || req.params.id || req.body.code || req.body.id;
    let recordName = null;

    // Try to extract from response
    if (responseBody && typeof responseBody === 'object') {
        recordId = recordId || responseBody.code || responseBody.id;
        recordName = responseBody.name || responseBody.code || responseBody.id;
    }

    // Module-specific record name extraction
    if (moduleName === 'enquiry') {
        recordName = `Enquiry: ${recordId}`;
    } else if (moduleName === 'customer') {
        recordName = `Customer: ${responseBody?.name || recordId}`;
    } else if (moduleName === 'vendor') {
        recordName = `Vendor: ${responseBody?.name || recordId}`;
    }

    return { recordId, recordName };
}

/**
 * Extract context from request
 */
function extractContext(req) {
    return {
        companyCode: req.body?.company_code || req.headers['x-company-code'],
        branchCode: req.body?.branch_code || req.headers['x-branch-code'],
        departmentCode: req.body?.department_code || req.headers['x-department-code']
    };
}

/**
 * Log to audit_logs table (business)
 */
async function logBusinessAudit(data) {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // Insert audit log
        const auditResult = await client.query(
            `INSERT INTO audit_logs (
                username, module_name, module_group, action, status,
                record_id, record_name, summary, ip_address,
                company_code, branch_code, department_code
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING id`,
            [
                data.username, data.moduleName, data.moduleGroup, data.action, data.status,
                data.recordId, data.recordName, data.summary, data.ipAddress,
                data.companyCode, data.branchCode, data.departmentCode
            ]
        );

        const auditLogId = auditResult.rows[0].id;

        // Insert field changes
        if (data.changes && data.changes.length > 0) {
            for (const change of data.changes) {
                await client.query(
                    `INSERT INTO audit_log_changes (
                        audit_log_id, field_name, field_label, old_value, new_value,
                        change_type, field_type, display_format
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
                    [
                        auditLogId, change.field_name, change.field_label,
                        change.old_value, change.new_value, change.change_type,
                        change.field_type, change.display_format
                    ]
                );
            }
        }

        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error logging business audit:', error);
    } finally {
        client.release();
    }
}

/**
 * Log to system_logs table (technical)
 */
async function logSystemLog(data) {
    try {
        await pool.query(
            `INSERT INTO system_logs (
                username, module_name, action, endpoint, method,
                payload, response, status, status_code, error_message,
                duration_ms, ip_address, user_agent,
                company_code, branch_code, department_code
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)`,
            [
                data.username, data.moduleName, data.action, data.endpoint, data.method,
                JSON.stringify(data.payload), JSON.stringify(data.response),
                data.status, data.statusCode, data.errorMessage,
                data.durationMs, data.ipAddress, data.userAgent,
                data.companyCode, data.branchCode, data.departmentCode
            ]
        );
    } catch (error) {
        console.error('Error logging system log:', error);
    }
}

module.exports = enhancedAuditLogMiddleware;
