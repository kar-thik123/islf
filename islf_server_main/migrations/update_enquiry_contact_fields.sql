-- Migration: Update enquiry table contact field names
-- This migration renames the contact fields in the enquiry table to match the new schema

-- Check if old columns exist and rename them
DO $$
BEGIN
    -- Rename mail_id to email if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'enquiry' AND column_name = 'mail_id') THEN
        ALTER TABLE enquiry RENAME COLUMN mail_id TO email;
    END IF;
    
    -- Rename phone_no1 to mobile if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'enquiry' AND column_name = 'phone_no1') THEN
        ALTER TABLE enquiry RENAME COLUMN phone_no1 TO mobile;
    END IF;
    
    -- Rename phone_no2 to landline if it exists
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'enquiry' AND column_name = 'phone_no2') THEN
        ALTER TABLE enquiry RENAME COLUMN phone_no2 TO landline;
    END IF;
    
    -- Add contact_department column if it doesn't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'enquiry' AND column_name = 'contact_department') THEN
        ALTER TABLE enquiry ADD COLUMN contact_department VARCHAR(255);
    END IF;
END $$;

-- Update column comments for documentation
COMMENT ON COLUMN enquiry.email IS 'Email address of the contact person';
COMMENT ON COLUMN enquiry.mobile IS 'Mobile number of the contact person';
COMMENT ON COLUMN enquiry.landline IS 'Landline number of the contact person';
COMMENT ON COLUMN enquiry.contact_department IS 'Department of the contact person';