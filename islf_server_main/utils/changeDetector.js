const ValueResolver = require('./valueResolver');

/**
 * CHANGE DETECTOR UTILITY
 * Compares old and new data objects to detect field-level changes
 * Returns array of changes with old/new values
 */

/**
 * Detect changes between old and new data objects
 * @param {Object} oldData - Previous state of the record
 * @param {Object} newData - New state of the record
 * @param {Object} fieldSchema - Field metadata (labels, types, formatting)
 * @returns {Promise<Array>} Array of change objects
 */
async function detectChanges(oldData, newData, fieldSchema = {}) {
    const changes = [];

    if (!newData) return changes;

    // For CREATE operations (no oldData)
    if (!oldData) {
        for (const fieldName of Object.keys(newData)) {
            // Skip system fields
            if (isSystemField(fieldName)) continue;

            const value = newData[fieldName];
            if (value === null || value === undefined || value === '') continue;

            const schema = fieldSchema[fieldName] || {};

            // Resolve value asynchronously
            const resolvedValue = await ValueResolver.resolve(value, schema);

            changes.push({
                field_name: fieldName,
                field_label: schema.label || formatFieldName(fieldName),
                old_value: null,
                new_value: resolvedValue,
                change_type: 'INSERT',
                field_type: schema.type || detectType(value),
                display_format: schema.format || null
            });
        }
        return changes;
    }

    // For UPDATE operations - compare fields
    const allFields = new Set([...Object.keys(oldData), ...Object.keys(newData)]);

    for (const fieldName of allFields) {
        // Skip system fields
        if (isSystemField(fieldName)) continue;

        const oldValue = oldData[fieldName];
        const newValue = newData[fieldName];

        // Skip if values are identical
        if (isEqual(oldValue, newValue)) continue;

        const schema = fieldSchema[fieldName] || {};

        // Resolve values asynchronously
        const resolvedOld = await ValueResolver.resolve(oldValue, schema);
        const resolvedNew = await ValueResolver.resolve(newValue, schema);

        changes.push({
            field_name: fieldName,
            field_label: schema.label || formatFieldName(fieldName),
            old_value: resolvedOld,
            new_value: resolvedNew,
            change_type: 'UPDATE',
            field_type: schema.type || detectType(newValue || oldValue),
            display_format: schema.format || null
        });
    }

    return changes;
}

/**
 * Check if two values are equal (handles dates, objects, arrays)
 */
function isEqual(val1, val2) {
    // Handle null/undefined
    if (val1 === val2) return true;
    if (val1 == null && val2 == null) return true;
    if (val1 == null || val2 == null) return false;

    // Handle dates
    if (val1 instanceof Date && val2 instanceof Date) {
        return val1.getTime() === val2.getTime();
    }

    // Handle objects/arrays (shallow comparison for now)
    if (typeof val1 === 'object' && typeof val2 === 'object') {
        return JSON.stringify(val1) === JSON.stringify(val2);
    }

    // Handle numbers (convert strings to numbers for comparison)
    if (!isNaN(val1) && !isNaN(val2)) {
        return Number(val1) === Number(val2);
    }

    return val1 === val2;
}

/**
 * System fields to skip in change detection
 */
function isSystemField(fieldName) {
    const systemFields = [
        'id', 'created_at', 'updated_at', 'created_by', 'updated_by',
        'company_code', 'branch_code', 'department_code',
        'password', 'password_hash', 'token', 'refresh_token'
    ];
    return systemFields.includes(fieldName);
}

/**
 * Format field name to human-readable label
 * Example: freight_amount -> Freight Amount
 */
function formatFieldName(fieldName) {
    return fieldName
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * Detect value type
 */
function detectType(value) {
    if (value instanceof Date) return 'date';
    if (typeof value === 'boolean') return 'boolean';
    if (typeof value === 'number') return 'number';
    if (!isNaN(value) && value !== '') return 'number';
    return 'text';
}

module.exports = {
    detectChanges,
    isEqual,
    formatFieldName
};
