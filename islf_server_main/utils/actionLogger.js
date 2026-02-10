const pool = require('../db');

/**
 * Log an action to the database asynchronously.
 * This function is non-blocking and handles its own errors to avoid disrupting the main request flow.
 * 
 * @param {Object} logData - The data to log.
 * @param {string} logData.username - The user performing the action.
 * @param {string} logData.module - The module being accessed (e.g., 'enquiry', 'booking').
 * @param {string} logData.action - The action performed (e.g., 'CREATE', 'UPDATE').
 * @param {string} logData.table_name - The database table affected.
 * @param {string} logData.endpoint - The API endpoint URL.
 * @param {string} logData.method - The HTTP method (GET, POST, etc.).
 * @param {string} logData.status - The status (SUCCESS, ERROR).
 * @param {number} logData.status_code - The HTTP status code.
 * @param {number} logData.duration_ms - Duration of the request in milliseconds.
 * @param {Object} logData.payload - The request payload.
 * @param {Object} logData.response - The response body (optional).
 * @param {string} logData.error_message - Error message if applicable.
 * @param {string} logData.ip_address - Client IP address.
 */
async function logAction(logData) {
    try {
        const {
            username,
            module,
            action,
            table_name,
            endpoint,
            method,
            status,
            status_code,
            duration_ms,
            payload,
            response,
            error_message,
            ip_address
        } = logData;

        // Execute in background (non-blocking)
        pool.query(
            `INSERT INTO action_logs (
                username, module, action, table_name, endpoint, 
                method, status, status_code, duration_ms, 
                payload, response, error_message, ip_address
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
            [
                username, module, action, table_name, endpoint,
                method, status, status_code, duration_ms,
                payload ? JSON.stringify(payload) : null,
                response ? JSON.stringify(response) : null,
                error_message, ip_address
            ]
        ).catch(err => {
            console.error('Failed to save action log to DB:', err);
        });

    } catch (err) {
        console.error('Error in actionLogger:', err);
    }
}

module.exports = {
    logAction
};
