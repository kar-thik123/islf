/**
 * SUMMARY GENERATOR UTILITY
 * Generates human-readable summaries from field changes
 * Example: "Freight Amount updated from 1200 USD to 1450 USD"
 */

/**
 * Generate summary from changes array
 * @param {Array} changes - Array of change objects from changeDetector
 * @param {String} action - CREATE, UPDATE, DELETE
 * @param {String} moduleName - Module name for context
 * @param {String} recordName - Record identifier
 * @returns {String} Human-readable summary
 */
function generateSummary(changes, action, moduleName, recordName) {
    if (!changes || changes.length === 0) {
        return generateDefaultSummary(action, moduleName, recordName);
    }

    // For CREATE - list new values
    if (action === 'CREATE') {
        return generateCreateSummary(changes, moduleName, recordName);
    }

    // For UPDATE - show old -> new
    if (action === 'UPDATE') {
        return generateUpdateSummary(changes, moduleName, recordName);
    }

    // For DELETE
    if (action === 'DELETE') {
        return `${moduleName} record "${recordName}" deleted`;
    }

    return generateDefaultSummary(action, moduleName, recordName);
}

/**
 * Generate summary for CREATE action
 */
function generateCreateSummary(changes, moduleName, recordName) {
    const keyFields = changes.slice(0, 3); // Show first 3 fields
    const fieldSummaries = keyFields.map(change =>
        `${change.field_label}: ${formatDisplayValue(change.new_value, change.field_type, change.display_format)}`
    );

    let summary = `New ${moduleName} created`;
    if (recordName) {
        summary += ` (${recordName})`;
    }

    if (fieldSummaries.length > 0) {
        summary += ` - ${fieldSummaries.join(', ')}`;
    }

    return summary;
}

/**
 * Generate summary for UPDATE action
 */
function generateUpdateSummary(changes, moduleName, recordName) {
    // Prioritize important fields
    const prioritizedChanges = prioritizeChanges(changes);

    // Show up to 3 most important changes
    const topChanges = prioritizedChanges.slice(0, 3);

    const changeSummaries = topChanges.map(change => {
        const oldVal = formatDisplayValue(change.old_value, change.field_type, change.display_format);
        const newVal = formatDisplayValue(change.new_value, change.field_type, change.display_format);
        return `${change.field_label} updated from ${oldVal} to ${newVal}`;
    });

    let summary = changeSummaries.join('; ');

    // Add count if more changes exist
    if (changes.length > 3) {
        summary += ` (and ${changes.length - 3} more changes)`;
    }

    return summary;
}

/**
 * Prioritize changes by importance
 * Business-critical fields appear first
 */
function prioritizeChanges(changes) {
    const priorityFields = [
        // Financial fields
        'amount', 'freight_amount', 'total_amount', 'price', 'rate', 'charges',
        // Status fields
        'status', 'approval_status', 'payment_status',
        // Key identifiers
        'customer_name', 'vendor_name', 'code', 'name',
        // Locations
        'from_location', 'to_location', 'port_of_loading', 'port_of_discharge',
        // Dates
        'date', 'effective_date', 'expiry_date', 'delivery_date'
    ];

    return changes.sort((a, b) => {
        const aPriority = priorityFields.findIndex(field =>
            a.field_name.toLowerCase().includes(field)
        );
        const bPriority = priorityFields.findIndex(field =>
            b.field_name.toLowerCase().includes(field)
        );

        // If both found, sort by priority
        if (aPriority !== -1 && bPriority !== -1) {
            return aPriority - bPriority;
        }

        // Priority fields come first
        if (aPriority !== -1) return -1;
        if (bPriority !== -1) return 1;

        // Otherwise maintain order
        return 0;
    });
}

/**
 * Format value for display with type-specific formatting
 */
function formatDisplayValue(value, fieldType, displayFormat) {
    if (value === null || value === undefined || value === '') {
        return '(empty)';
    }

    // Handle currency
    if (fieldType === 'currency' || displayFormat?.startsWith('currency:')) {
        const currency = displayFormat?.split(':')[1] || 'USD';
        return `${value} ${currency}`;
    }

    // Handle dates
    if (fieldType === 'date') {
        return formatDate(value);
    }

    // Handle booleans
    if (fieldType === 'boolean') {
        return value === 'Yes' || value === true ? 'Yes' : 'No';
    }

    // Handle numbers
    if (fieldType === 'number') {
        return Number(value).toLocaleString();
    }

    return String(value);
}

/**
 * Format date for display
 */
function formatDate(dateValue) {
    if (!dateValue) return '(empty)';

    try {
        const date = new Date(dateValue);
        return date.toLocaleDateString('en-GB'); // DD/MM/YYYY
    } catch (e) {
        return String(dateValue);
    }
}

/**
 * Generate default summary when no changes available
 */
function generateDefaultSummary(action, moduleName, recordName) {
    const actionText = {
        'CREATE': 'created',
        'UPDATE': 'updated',
        'DELETE': 'deleted',
        'FETCH_BY_ID': 'viewed'
    }[action] || action.toLowerCase();

    if (recordName) {
        return `${moduleName} "${recordName}" ${actionText}`;
    }

    return `${moduleName} record ${actionText}`;
}

module.exports = {
    generateSummary,
    generateCreateSummary,
    generateUpdateSummary,
    formatDisplayValue,
    prioritizeChanges
};
