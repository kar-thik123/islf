-- Create setup_logs table for tracking setup operations
CREATE TABLE public.setup_logs (
    id SERIAL PRIMARY KEY,
    username text NOT NULL,
    action text NOT NULL,
    setup_type text NOT NULL,
    entity_type text NOT NULL,
    entity_code text NOT NULL,
    entity_name text,
    details text,
    "timestamp" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX idx_setup_logs_username ON public.setup_logs(username);
CREATE INDEX idx_setup_logs_action ON public.setup_logs(action);
CREATE INDEX idx_setup_logs_setup_type ON public.setup_logs(setup_type);
CREATE INDEX idx_setup_logs_entity_type ON public.setup_logs(entity_type);
CREATE INDEX idx_setup_logs_entity_code ON public.setup_logs(entity_code);
CREATE INDEX idx_setup_logs_timestamp ON public.setup_logs(timestamp);

-- Add comments for documentation
COMMENT ON TABLE public.setup_logs IS 'Logs for setup operations like company, branch, department, and service type management';
COMMENT ON COLUMN public.setup_logs.username IS 'Username of the user performing the action';
COMMENT ON COLUMN public.setup_logs.action IS 'Action performed (CREATE, UPDATE, DELETE)';
COMMENT ON COLUMN public.setup_logs.setup_type IS 'Type of setup operation (Company, Branch, Department, ServiceType)';
COMMENT ON COLUMN public.setup_logs.entity_type IS 'Type of entity (company, branch, department, service_type)';
COMMENT ON COLUMN public.setup_logs.entity_code IS 'Code of the entity being managed';
COMMENT ON COLUMN public.setup_logs.entity_name IS 'Name of the entity being managed';
COMMENT ON COLUMN public.setup_logs.details IS 'Additional details about the action';
COMMENT ON COLUMN public.setup_logs.timestamp IS 'Timestamp when the action was performed'; 