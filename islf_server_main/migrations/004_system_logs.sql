-- ============================================================================
-- SYSTEM LOGS TABLE (Developer/Technical Logs)
-- Stores technical details for debugging and system monitoring
-- ONLY visible to Super Admin role
-- ============================================================================

CREATE TABLE IF NOT EXISTS system_logs (
    id BIGSERIAL PRIMARY KEY,
    
    -- Core fields
    timestamp TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    username VARCHAR(100) NOT NULL,
    
    -- Module and action
    module_name VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    
    -- Technical details
    endpoint VARCHAR(500) NOT NULL, -- Full API endpoint
    method VARCHAR(10) NOT NULL, -- GET, POST, PUT, DELETE
    
    -- Request/Response data
    payload JSONB, -- Request body/query params
    response JSONB, -- Response body
    
    -- Status and error tracking
    status VARCHAR(20) NOT NULL, -- SUCCESS, ERROR
    status_code INTEGER, -- HTTP status code (200, 400, 500, etc.)
    error_message TEXT, -- Error details if status = ERROR
    stack_trace TEXT, -- Full stack trace for errors
    
    -- Performance metrics
    duration_ms INTEGER, -- Request duration in milliseconds
    memory_usage_mb DECIMAL(10,2), -- Memory usage at time of request
    cpu_usage_percent DECIMAL(5,2), -- CPU usage percentage
    
    -- Network and context
    ip_address VARCHAR(50),
    user_agent TEXT,
    company_code VARCHAR(20),
    branch_code VARCHAR(20),
    department_code VARCHAR(20),
    
    -- Metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- INDEXES for Performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_system_logs_timestamp_desc ON system_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_system_logs_module ON system_logs(module_name);
CREATE INDEX IF NOT EXISTS idx_system_logs_status ON system_logs(status);
CREATE INDEX IF NOT EXISTS idx_system_logs_endpoint ON system_logs(endpoint);
CREATE INDEX IF NOT EXISTS idx_system_logs_username ON system_logs(username);

-- Performance analysis indexes
CREATE INDEX IF NOT EXISTS idx_system_logs_slow_queries ON system_logs(duration_ms DESC) WHERE duration_ms > 1000;
CREATE INDEX IF NOT EXISTS idx_system_logs_errors ON system_logs(timestamp DESC) WHERE status = 'ERROR';

-- JSONB indexes for payload/response queries
CREATE INDEX IF NOT EXISTS idx_system_logs_payload_gin ON system_logs USING GIN (payload);
CREATE INDEX IF NOT EXISTS idx_system_logs_response_gin ON system_logs USING GIN (response);

-- ============================================================================
-- PARTITIONING (Recommended for high-volume systems)
-- ============================================================================

-- System logs can grow very large - partition by month
-- Uncomment if expecting >10M logs per month

/*
CREATE TABLE system_logs_partitioned (
    LIKE system_logs INCLUDING ALL
) PARTITION BY RANGE (timestamp);

CREATE TABLE system_logs_2026_02 PARTITION OF system_logs_partitioned
    FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');

CREATE TABLE system_logs_2026_03 PARTITION OF system_logs_partitioned
    FOR VALUES FROM ('2026-03-01') TO ('2026-04-01');
*/

-- ============================================================================
-- ROW-LEVEL SECURITY
-- ============================================================================

ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM pg_policy WHERE polname = 'system_logs_super_admin_only') THEN
        CREATE POLICY system_logs_super_admin_only ON system_logs
            FOR ALL
            USING (current_setting('app.user_role', true) = 'SUPER_ADMIN');
    END IF;
END $$;

-- ============================================================================
-- ARCHIVING STRATEGY
-- ============================================================================

-- Create archive table for old system logs (>90 days)
CREATE TABLE IF NOT EXISTS system_logs_archive (
    LIKE system_logs INCLUDING ALL
);

-- Archive function (to be called by scheduled job)
CREATE OR REPLACE FUNCTION archive_old_system_logs()
RETURNS INTEGER AS $$
DECLARE
    archived_count INTEGER;
BEGIN
    -- Move logs older than 90 days to archive
    WITH moved_rows AS (
        DELETE FROM system_logs
        WHERE timestamp < CURRENT_DATE - INTERVAL '90 days'
        RETURNING *
    )
    INSERT INTO system_logs_archive
    SELECT * FROM moved_rows;
    
    GET DIAGNOSTICS archived_count = ROW_COUNT;
    RETURN archived_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE system_logs IS 'Technical logs for developers and system administrators (Super Admin only)';
COMMENT ON COLUMN system_logs.endpoint IS 'Full API endpoint path';
COMMENT ON COLUMN system_logs.payload IS 'Request body or query parameters as JSON';
COMMENT ON COLUMN system_logs.response IS 'Response body as JSON';
COMMENT ON COLUMN system_logs.stack_trace IS 'Full error stack trace for debugging';
COMMENT ON COLUMN system_logs.duration_ms IS 'Request processing time in milliseconds';
