-- ============================================================================
-- AUDIT LOG CHANGES TABLE (Field-Level Change Tracking)
-- Stores individual field changes for UPDATE operations
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_log_changes (
    id BIGSERIAL PRIMARY KEY,
    
    -- Link to parent audit log
    audit_log_id BIGINT NOT NULL,
    
    -- Field information
    field_name VARCHAR(100) NOT NULL, -- Technical field name (e.g., freight_amount)
    field_label VARCHAR(200) NOT NULL, -- User-friendly label (e.g., "Freight Amount")
    
    -- Change values
    old_value TEXT, -- Previous value (NULL for CREATE)
    new_value TEXT, -- New value (NULL for DELETE)
    
    -- Change metadata
    change_type VARCHAR(20) NOT NULL, -- INSERT, UPDATE, DELETE
    field_type VARCHAR(50), -- currency, date, text, number, boolean, location, etc.
    
    -- Display formatting hints
    display_format VARCHAR(50), -- For UI rendering (e.g., "currency:USD", "date:DD/MM/YYYY")
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_audit_log_changes_audit_id ON audit_log_changes(audit_log_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_changes_field_name ON audit_log_changes(field_name);

-- ============================================================================
-- FOREIGN KEY
-- ============================================================================

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_audit_log_changes_audit_log') THEN
        ALTER TABLE audit_log_changes 
        ADD CONSTRAINT fk_audit_log_changes_audit_log 
        FOREIGN KEY (audit_log_id) 
        REFERENCES audit_logs(id)
        ON DELETE CASCADE; -- Delete changes when parent log is deleted
    END IF;
END $$;

-- ============================================================================
-- CONSTRAINTS
-- ============================================================================

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_audit_log_changes_type') THEN
        ALTER TABLE audit_log_changes ADD CONSTRAINT chk_audit_log_changes_type 
        CHECK (change_type IN ('INSERT', 'UPDATE', 'DELETE'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_audit_log_changes_values') THEN
        ALTER TABLE audit_log_changes ADD CONSTRAINT chk_audit_log_changes_values
        CHECK (old_value IS NOT NULL OR new_value IS NOT NULL);
    END IF;
END $$;

-- ============================================================================
-- EXAMPLE DATA
-- ============================================================================

/*
Example: Enquiry freight amount changed from 1200 to 1450

audit_logs:
    id: 12345
    username: 'john.doe'
    module_name: 'enquiry'
    module_group: 'Operations'
    action: 'UPDATE'
    record_id: 'ENQ001'
    record_name: 'Enquiry: ENQ001'
    summary: 'Freight Amount updated from 1200 USD to 1450 USD; Port of Loading changed from INMAA to INXAT'

audit_log_changes:
    audit_log_id: 12345
    field_name: 'freight_amount'
    field_label: 'Freight Amount'
    old_value: '1200'
    new_value: '1450'
    change_type: 'UPDATE'
    field_type: 'currency'
    display_format: 'currency:USD'

    audit_log_id: 12345
    field_name: 'port_of_loading'
    field_label: 'Port of Loading'
    old_value: 'INMAA'
    new_value: 'INXAT'
    change_type: 'UPDATE'
    field_type: 'location'
    display_format: 'location'
*/

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE audit_log_changes IS 'Field-level change tracking for audit logs';
COMMENT ON COLUMN audit_log_changes.audit_log_id IS 'Parent audit log entry';
COMMENT ON COLUMN audit_log_changes.field_name IS 'Technical field name from database';
COMMENT ON COLUMN audit_log_changes.field_label IS 'User-friendly field label for UI';
COMMENT ON COLUMN audit_log_changes.old_value IS 'Previous value (NULL for INSERT)';
COMMENT ON COLUMN audit_log_changes.new_value IS 'New value (NULL for DELETE)';
COMMENT ON COLUMN audit_log_changes.change_type IS 'Type of change: INSERT, UPDATE, DELETE';
COMMENT ON COLUMN audit_log_changes.field_type IS 'Data type for proper formatting';
COMMENT ON COLUMN audit_log_changes.display_format IS 'Formatting hint for UI (e.g., currency:USD)';
