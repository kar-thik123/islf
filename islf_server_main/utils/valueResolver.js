const pool = require('../db');

/**
 * VALUE RESOLVER UTILITY
 * Resolves technical database values into UI-friendly display values.
 * Supports:
 * - Lookup: Fetches names/codes for IDs from other tables.
 * - MasterType: Fetches descriptions from master_type table.
 * - Boolean: Maps to Yes/No, Active/Inactive, etc.
 * - Enum: Maps internal codes to labels.
 * - Object/Array: Flattens into readable strings.
 */

const ValueResolver = {
    /**
     * Resolve a value based on field metadata
     * @param {any} value - The raw value to resolve
     * @param {Object} metadata - Field metadata from fieldSchemas
     * @returns {Promise<string>} Resolved display value
     */
    async resolve(value, metadata = {}) {
        if (value === null || value === undefined || value === '') {
            return '(empty)';
        }

        const { resolution } = metadata;
        if (!resolution) {
            return this.formatBasicValue(value, metadata.type);
        }

        try {
            switch (resolution.type) {
                case 'lookup':
                    return await this.resolveLookup(value, resolution);
                case 'masterType':
                    return await this.resolveMasterType(value, resolution);
                case 'enum':
                    return this.resolveEnum(value, resolution);
                case 'boolean':
                    return this.resolveBoolean(value, resolution);
                case 'object':
                    return this.resolveObject(value, resolution);
                default:
                    return this.formatBasicValue(value, metadata.type);
            }
        } catch (error) {
            console.error(`ValueResolver Error for ${JSON.stringify(resolution)}:`, error);
            return String(value); // Fallback to raw value on error
        }
    },

    /**
     * Resolve a foreign key lookup (e.g., customer_id -> Customer Name)
     */
    async resolveLookup(value, resolution) {
        const { table, displayField, keyField = 'id' } = resolution;
        const query = `SELECT ${displayField} FROM ${table} WHERE ${keyField} = $1`;
        const result = await pool.query(query, [value]);

        if (result.rows.length > 0) {
            return String(result.rows[0][displayField]);
        }
        return `ID: ${value} (Not Found)`;
    },

    /**
     * Resolve from master_type table
     */
    async resolveMasterType(value, resolution) {
        const { masterKey } = resolution;
        const query = `SELECT value, description FROM master_type WHERE key = $1 AND value = $2`;
        const result = await pool.query(query, [masterKey, value]);

        if (result.rows.length > 0) {
            return result.rows[0].description || result.rows[0].value;
        }
        return value;
    },

    /**
     * Resolve from local enum mapping
     */
    resolveEnum(value, resolution) {
        const { mapping } = resolution;
        return mapping[value] || String(value);
    },

    /**
     * Resolve boolean values
     */
    resolveBoolean(value, resolution) {
        const { trueLabel = 'Yes', falseLabel = 'No' } = resolution;
        const isTrue = value === true || value === 'true' || value === 1 || value === '1' || value === 't' || value === 'T' || value === 'Yes';
        return isTrue ? trueLabel : falseLabel;
    },

    /**
     * Resolve/Flatten objects or arrays
     */
    resolveObject(value, resolution) {
        if (typeof value === 'string') {
            try {
                value = JSON.parse(value);
            } catch (e) {
                return value;
            }
        }

        if (Array.isArray(value)) {
            if (value.length === 0) return '(empty list)';
            // If it's an array of simple values
            if (typeof value[0] !== 'object') return value.join(', ');
            // If it's an array of objects, try to find a meaningful summary field
            const summaryField = resolution.summaryField || 'name' || 'code';
            return value.map(item => item[summaryField] || JSON.stringify(item)).join(', ');
        }

        if (typeof value === 'object' && value !== null) {
            const summaryField = resolution.summaryField;
            if (summaryField && value[summaryField]) return String(value[summaryField]);
            return JSON.stringify(value);
        }

        return String(value);
    },

    /**
     * Basic formatting for non-resolved fields
     */
    formatBasicValue(value, type) {
        if (type === 'date') {
            try {
                const date = new Date(value);
                return isNaN(date.getTime()) ? String(value) : date.toISOString().split('T')[0];
            } catch (e) {
                return String(value);
            }
        }
        if (type === 'boolean') {
            return (value === true || value === 'true' || value === 1 || value === '1') ? 'Yes' : 'No';
        }
        return String(value);
    }
};

module.exports = ValueResolver;
