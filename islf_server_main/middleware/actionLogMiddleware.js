const { logAction } = require('../utils/actionLogger');
const { getUsernameFromToken } = require('../utils/context-helper');

/**
 * Middleware to automatically log all API actions.
 * Captures request details, response status, duration, and payloads.
 */
function actionLogMiddleware(req, res, next) {
    const startTime = Date.now();

    // Capture the original res.send and res.json to intersect the response
    const originalSend = res.send;
    const originalJson = res.json;

    let responseBody;

    // Override res.send
    res.send = function (body) {
        responseBody = body;
        return originalSend.apply(res, arguments);
    };

    // Override res.json
    res.json = function (body) {
        responseBody = body;
        return originalJson.apply(res, arguments);
    };

    // Record information when the response is finished
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const username = getUsernameFromToken(req) || 'Anonymous';

        // Extract module and action from URL
        // Example: /api/enquiry -> module: enquiry
        const pathParts = req.baseUrl ? req.baseUrl.split('/') : req.path.split('/');
        let moduleName = pathParts.find(p => p && p !== 'api') || 'root';

        // Refine module name for Master definitions
        if (moduleName === 'master_type' && req.body && req.body.key) {
            moduleName = req.body.key; // e.g., 'BASIS', 'CONTAINER_TYPE'
        } else if (moduleName === 'master_code' && req.body && req.body.code) {
            // For master_code, the 'code' is the ID, not the type. 
            // If we have a 'type' field in the future we can use it, but for now master_code is generic.
            // We can check if it's a specific known flow if needed.
        }

        // Determine action based on HTTP method and path
        let action = req.method;
        if (req.method === 'POST') action = 'CREATE';
        if (req.method === 'PUT' || req.method === 'PATCH') action = 'UPDATE';
        if (req.method === 'DELETE') action = 'DELETE';
        if (req.method === 'GET') {
            action = req.params.id ? 'FETCH_BY_ID' : 'LIST';
        }

        // NOISE REDUCTION: Skip logging completely for generic LIST actions
        // Business users only care about Changes (CUD) or specific views (FETCH_BY_ID)
        if (action === 'LIST') {
            return;
        }

        // Determine table name (approximation based on module)
        const table_name = moduleName;

        // Prepare log data
        const logData = {
            username,
            module: moduleName, // Use refined name
            action,
            table_name,
            endpoint: req.originalUrl || req.url,
            method: req.method,
            status: res.statusCode >= 400 ? 'ERROR' : 'SUCCESS',
            status_code: res.statusCode,
            duration_ms: duration,
            payload: req.method !== 'GET' ? req.body : req.query,
            response: res.statusCode < 400 ? responseBody : null,
            error_message: res.statusCode >= 400 ? (typeof responseBody === 'string' ? responseBody : JSON.stringify(responseBody)) : null,
            ip_address: req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress
        };

        // Log asynchronously
        logAction(logData);
    });

    next();
}

module.exports = actionLogMiddleware;
