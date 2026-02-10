/**
 * FIELD SCHEMAS CONFIGURATION
 * Defines field metadata for each module to enable:
 * - Human-readable field labels
 * - Type-aware formatting
 * - Display hints for UI
 */

const fieldSchemas = {
    // ============================================================================
    // ENQUIRY MODULE
    // ============================================================================
    enquiry: {
        code: { label: 'Enquiry Code', type: 'text' },
        date: { label: 'Enquiry Date', type: 'date' },
        customer_id: {
            label: 'Customer',
            type: 'lookup',
            resolution: { type: 'lookup', table: 'customer', displayField: 'name' }
        },
        customer_name: { label: 'Customer Name', type: 'text' },
        company_name: { label: 'Company Name', type: 'text' },
        email: { label: 'Email', type: 'text' },
        mobile: { label: 'Mobile', type: 'text' },
        cargo_type: {
            label: 'Cargo Type',
            type: 'text',
            resolution: { type: 'masterType', masterKey: 'CARGO_TYPE' }
        },
        from_location: { label: 'From Location', type: 'location' },
        to_location: { label: 'To Location', type: 'location' },
        effective_date_from: { label: 'Effective From', type: 'date' },
        effective_date_to: { label: 'Effective To', type: 'date' },
        department: {
            label: 'Department',
            type: 'text',
            resolution: { type: 'masterType', masterKey: 'DEPARTMENT' }
        },
        department_code: {
            label: 'Department',
            type: 'text',
            resolution: { type: 'masterType', masterKey: 'DEPARTMENT' }
        },
        service_type: {
            label: 'Service Type',
            type: 'text',
            resolution: { type: 'masterType', masterKey: 'SERVICE_TYPE' }
        },
        service_type_code: {
            label: 'Service Type',
            type: 'text',
            resolution: { type: 'masterType', masterKey: 'SERVICE_TYPE' }
        },
        status: { label: 'Status', type: 'text' },
        remarks: { label: 'Remarks', type: 'text' }
    },

    // ============================================================================
    // BOOKING MODULE
    // ============================================================================
    booking: {
        code: { label: 'Booking Code', type: 'text' },
        booking_no: { label: 'Booking Number', type: 'text' },
        enquiry_id: {
            label: 'Enquiry',
            type: 'lookup',
            resolution: { type: 'lookup', table: 'enquiry', displayField: 'code' }
        },
        enquiry_code: { label: 'Enquiry Reference', type: 'text' },
        booking_date: { label: 'Booking Date', type: 'date' },
        customer_id: {
            label: 'Customer',
            type: 'lookup',
            resolution: { type: 'lookup', table: 'customer', displayField: 'name' }
        },
        customer_name: { label: 'Customer', type: 'text' },
        freight_amount: { label: 'Freight Amount', type: 'currency', format: 'currency:USD' },
        total_amount: { label: 'Total Amount', type: 'currency', format: 'currency:USD' },
        port_of_loading: { label: 'Port of Loading', type: 'location' },
        port_of_discharge: { label: 'Port of Discharge', type: 'location' },
        vessel_name: { label: 'Vessel', type: 'text' },
        voyage_no: { label: 'Voyage Number', type: 'text' },
        status: { label: 'Status', type: 'text' }
    },

    // ============================================================================
    // CUSTOMER MODULE
    // ============================================================================
    customer: {
        code: { label: 'Customer Code', type: 'text' },
        customer_no: { label: 'Customer Number', type: 'text' },
        name: { label: 'Customer Name', type: 'text' },
        name2: { label: 'Alternate Name', type: 'text' },
        type: {
            label: 'Customer Type',
            type: 'text',
            resolution: { type: 'masterType', masterKey: 'CUSTOMER_TYPE' }
        },
        email: { label: 'Email', type: 'text' },
        mobile: { label: 'Mobile', type: 'text' },
        address: { label: 'Address', type: 'text' },
        city: { label: 'City', type: 'text' },
        country: { label: 'Country', type: 'text' },
        credit_limit: { label: 'Credit Limit', type: 'currency', format: 'currency:USD' },
        payment_terms: { label: 'Payment Terms', type: 'text' },
        active: {
            label: 'Active',
            type: 'boolean',
            resolution: { type: 'boolean', trueLabel: 'Active', falseLabel: 'Inactive' }
        }
    },

    // ============================================================================
    // VENDOR MODULE
    // ============================================================================
    vendor: {
        vendor_no: { label: 'Vendor Number', type: 'text' },
        name: { label: 'Vendor Name', type: 'text' },
        name2: { label: 'Alternate Name', type: 'text' },
        type: {
            label: 'Vendor Type',
            type: 'text',
            resolution: { type: 'masterType', masterKey: 'VENDOR_TYPE' }
        },
        email: { label: 'Email', type: 'text' },
        mobile: { label: 'Mobile', type: 'text' },
        address: { label: 'Address', type: 'text' },
        city: { label: 'City', type: 'text' },
        country: { label: 'Country', type: 'text' },
        payment_terms: { label: 'Payment Terms', type: 'text' },
        active: {
            label: 'Active',
            type: 'boolean',
            resolution: { type: 'boolean', trueLabel: 'Active', falseLabel: 'Inactive' }
        }
    },

    // ============================================================================
    // LOCATION MODULE
    // ============================================================================
    master_location: {
        code: { label: 'Location Code', type: 'text' },
        name: { label: 'Location Name', type: 'text' },
        type: { label: 'Location Type', type: 'text' },
        country: { label: 'Country', type: 'text' },
        state: { label: 'State', type: 'text' },
        city: { label: 'City', type: 'text' },
        gst_state_code: { label: 'GST State Code', type: 'text' },
        pin_code: { label: 'PIN Code', type: 'text' },
        active: {
            label: 'Active',
            type: 'boolean',
            resolution: { type: 'boolean', trueLabel: 'Active', falseLabel: 'Inactive' }
        }
    },

    // ============================================================================
    // MASTER TYPE MODULE
    // ============================================================================
    master_type: {
        key: { label: 'Type Category', type: 'text' },
        value: { label: 'Code', type: 'text' },
        description: { label: 'Display Name', type: 'text' },
        status: { label: 'Status', type: 'text' }
    }
};

/**
 * Get field schema for a module
 * @param {String} moduleName - Module name
 * @returns {Object} Field schema object
 */
function getFieldSchema(moduleName) {
    return fieldSchemas[moduleName] || {};
}

/**
 * Get field metadata for a specific field
 * @param {String} moduleName - Module name
 * @param {String} fieldName - Field name
 * @returns {Object} Field metadata
 */
function getFieldMetadata(moduleName, fieldName) {
    const schema = getFieldSchema(moduleName);
    return schema[fieldName] || {
        label: formatFieldName(fieldName),
        type: 'text'
    };
}

/**
 * Format field name to human-readable label (fallback)
 */
function formatFieldName(fieldName) {
    return fieldName
        .split('_')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

module.exports = {
    fieldSchemas,
    getFieldSchema,
    getFieldMetadata
};
