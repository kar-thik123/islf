-- ============================================================================
-- AUDIT LOGS TABLE (Business-Friendly)
-- Stores high-level audit information visible to business users
-- NO technical details (endpoint, payload, response)
-- ============================================================================

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    
    -- Core audit fields
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    username VARCHAR(100) NOT NULL,
    
    -- Module information (from registry)
    module_name VARCHAR(100) NOT NULL,
    module_group VARCHAR(50) NOT NULL,
    
    -- Action and status
    action VARCHAR(50) NOT NULL, -- CREATE, UPDATE, DELETE, FETCH_BY_ID
    status VARCHAR(20) NOT NULL, -- SUCCESS, ERROR
    
    -- Record identification
    record_id VARCHAR(100), -- ID of the affected record (e.g., ENQ001, CUST123)
    record_name VARCHAR(500), -- Human-readable identifier (e.g., "Customer: ABC Corp", "Enquiry: ENQ001")
    
    -- Auto-generated summary
    summary TEXT, -- "Freight Amount updated from 1200 USD to 1450 USD"
    
    -- Additional context
    ip_address VARCHAR(50),
    company_code VARCHAR(20),
    branch_code VARCHAR(20),
    department_code VARCHAR(20),
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES for Performance
-- ============================================================================

-- Primary query patterns
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp_desc ON audit_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_username ON audit_logs(username);
CREATE INDEX IF NOT EXISTS idx_audit_logs_module_group ON audit_logs(module_group);
CREATE INDEX IF NOT EXISTS idx_audit_logs_module_name ON audit_logs(module_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_status ON audit_logs(status);

-- Composite indexes for common filter combinations
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp_module ON audit_logs(timestamp DESC, module_group, module_name);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_timestamp ON audit_logs(username, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_module_action ON audit_logs(module_name, action, timestamp DESC);

-- Context-based filtering
CREATE INDEX IF NOT EXISTS idx_audit_logs_company ON audit_logs(company_code, timestamp DESC);

-- ============================================================================
-- FOREIGN KEY to Module Registry
-- ============================================================================

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_audit_logs_module') THEN
        ALTER TABLE audit_logs 
        ADD CONSTRAINT fk_audit_logs_module 
        FOREIGN KEY (module_name) 
        REFERENCES module_registry(module_name)
        ON DELETE RESTRICT;
    END IF;
END $$;

-- ============================================================================
-- CONSTRAINTS
-- ============================================================================

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_audit_logs_action') THEN
        ALTER TABLE audit_logs ADD CONSTRAINT chk_audit_logs_action 
        CHECK (action IN ('CREATE', 'UPDATE', 'DELETE', 'FETCH_BY_ID', 'EXPORT', 'IMPORT'));
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'chk_audit_logs_status') THEN
        ALTER TABLE audit_logs ADD CONSTRAINT chk_audit_logs_status 
        CHECK (status IN ('SUCCESS', 'ERROR', 'WARNING'));
    END IF;
END $$;

-- ============================================================================
-- ROW-LEVEL SECURITY (Optional - for multi-tenant)
-- ============================================================================

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'audit_logs_company_isolation') THEN
        CREATE POLICY audit_logs_company_isolation ON audit_logs
            FOR SELECT
            USING (company_code = current_setting('app.current_company', true));
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'audit_logs_super_admin') THEN
        CREATE POLICY audit_logs_super_admin ON audit_logs
            FOR ALL
            USING (current_setting('app.user_role', true) = 'SUPER_ADMIN');
    END IF;
END $$;

-- ============================================================================
-- PARTITIONING for Large-Scale Performance (Optional)
-- ============================================================================

-- Convert to partitioned table by month (for high-volume systems)
-- Uncomment if expecting >1M logs per month

/*
CREATE TABLE audit_logs_partitioned (
    LIKE audit_logs INCLUDING ALL
) PARTITION BY RANGE (timestamp);

-- Create monthly partitions
CREATE TABLE audit_logs_2026_02 PARTITION OF audit_logs_partitioned
    FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');

CREATE TABLE audit_logs_2026_03 PARTITION OF audit_logs_partitioned
    FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');

-- Add more partitions as needed
*/

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE audit_logs IS 'Business-friendly audit logs visible to all users';
COMMENT ON COLUMN audit_logs.timestamp IS 'When the action occurred';
COMMENT ON COLUMN audit_logs.username IS 'Who performed the action';
COMMENT ON COLUMN audit_logs.module_name IS 'Technical module identifier (links to module_registry)';
COMMENT ON COLUMN audit_logs.module_group IS 'Business category for filtering';
COMMENT ON COLUMN audit_logs.action IS 'Type of operation performed';
COMMENT ON COLUMN audit_logs.record_id IS 'ID of the affected record (e.g., ENQ001)';
COMMENT ON COLUMN audit_logs.record_name IS 'Human-readable record identifier';
COMMENT ON COLUMN audit_logs.summary IS 'Auto-generated change summary for business users';
