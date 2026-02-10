-- Create action_logs table for system-wide action logging
CREATE TABLE IF NOT EXISTS action_logs (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255),
    module VARCHAR(100),
    action VARCHAR(50),
    table_name VARCHAR(100),
    endpoint VARCHAR(255),
    method VARCHAR(10),
    status VARCHAR(20),
    status_code INTEGER,
    duration_ms INTEGER,
    payload JSONB,
    response JSONB,
    error_message TEXT,
    ip_address VARCHAR(45),
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_action_logs_username ON action_logs(username);
CREATE INDEX IF NOT EXISTS idx_action_logs_timestamp ON action_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_action_logs_module ON action_logs(module);
