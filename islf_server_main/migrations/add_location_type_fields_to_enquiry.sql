-- Add location type fields to enquiry table
ALTER TABLE enquiry 
ADD COLUMN location_type_from VARCHAR(255),
ADD COLUMN location_type_to VARCHAR(255);

-- Add comments for the new columns
COMMENT ON COLUMN enquiry.location_type_from IS 'Type of the from location (e.g., Port, Airport, Warehouse)';
COMMENT ON COLUMN enquiry.location_type_to IS 'Type of the to location (e.g., Port, Airport, Warehouse)';