-- Migration script to add code field to enquiry table
-- Run this script if the enquiry table already exists without the code field

-- Add code column to enquiry table if it doesn't exist
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'enquiry' 
        AND column_name = 'code'
    ) THEN
        ALTER TABLE enquiry ADD COLUMN code VARCHAR(50);
        RAISE NOTICE 'Added code column to enquiry table';
    ELSE
        RAISE NOTICE 'Code column already exists in enquiry table';
    END IF;
END $$;

-- Optional: Create an index on the code field for better performance
CREATE INDEX IF NOT EXISTS idx_enquiry_code ON enquiry(code);

-- Log the migration
INSERT INTO master_logs (table_name, operation, record_id, username, details) 
VALUES ('enquiry', 'ALTER_TABLE', NULL, 'system', 'Added code field to enquiry table')
ON CONFLICT DO NOTHING;