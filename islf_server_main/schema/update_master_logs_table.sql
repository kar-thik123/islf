-- Update master_logs table to match frontend requirements
-- First, backup existing data if needed
CREATE TABLE IF NOT EXISTS master_logs_backup AS SELECT * FROM master_logs;

-- Drop existing table and recreate with new structure
DROP TABLE IF EXISTS master_logs CASCADE;

-- Create new master_logs table with updated structure
CREATE TABLE public.master_logs (
    id SERIAL PRIMARY KEY,
    username text NOT NULL,
    action text NOT NULL,
    master_type text NOT NULL,
    record_id text NOT NULL,
    record_name text,
    details text,
    "timestamp" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX idx_master_logs_username ON public.master_logs(username);
CREATE INDEX idx_master_logs_action ON public.master_logs(action);
CREATE INDEX idx_master_logs_master_type ON public.master_logs(master_type);
CREATE INDEX idx_master_logs_record_id ON public.master_logs(record_id);
CREATE INDEX idx_master_logs_timestamp ON public.master_logs(timestamp);

-- Add comments for documentation
COMMENT ON TABLE public.master_logs IS 'Logs for master data operations like customer, vendor, item, etc.';
COMMENT ON COLUMN public.master_logs.username IS 'Username of the user performing the action';
COMMENT ON COLUMN public.master_logs.action IS 'Action performed (CREATE, UPDATE, DELETE)';
COMMENT ON COLUMN public.master_logs.master_type IS 'Type of master data (Customer, Vendor, Item, etc.)';
COMMENT ON COLUMN public.master_logs.record_id IS 'Unique identifier of the master record';
COMMENT ON COLUMN public.master_logs.record_name IS 'Name/description of the master record';
COMMENT ON COLUMN public.master_logs.details IS 'Additional details about the action';
COMMENT ON COLUMN public.master_logs.timestamp IS 'Timestamp when the action was performed'; 