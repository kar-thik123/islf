-- Migration: Add sourcing details to enquiry_vendor_cards table
-- Date: 2024-01-22
-- Description: Add columns to store sourcing selection details in vendor cards

-- Add sourcing detail columns to enquiry_vendor_cards table
ALTER TABLE enquiry_vendor_cards 
ADD COLUMN IF NOT EXISTS mode VARCHAR(100),
ADD COLUMN IF NOT EXISTS from_location VARCHAR(255),
ADD COLUMN IF NOT EXISTS to_location VARCHAR(255),
ADD COLUMN IF NOT EXISTS basis VARCHAR(100),
ADD COLUMN IF NOT EXISTS vendor_code VARCHAR(100),
ADD COLUMN IF NOT EXISTS effective_date DATE,
ADD COLUMN IF NOT EXISTS expiry_date DATE;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_enquiry_vendor_cards_mode ON enquiry_vendor_cards(mode);
CREATE INDEX IF NOT EXISTS idx_enquiry_vendor_cards_vendor_code ON enquiry_vendor_cards(vendor_code);
CREATE INDEX IF NOT EXISTS idx_enquiry_vendor_cards_effective_date ON enquiry_vendor_cards(effective_date);

-- Add comments to document the new columns
COMMENT ON COLUMN enquiry_vendor_cards.mode IS 'Transportation mode from sourcing selection';
COMMENT ON COLUMN enquiry_vendor_cards.from_location IS 'Origin location from sourcing selection';
COMMENT ON COLUMN enquiry_vendor_cards.to_location IS 'Destination location from sourcing selection';
COMMENT ON COLUMN enquiry_vendor_cards.basis IS 'Pricing basis from sourcing selection';
COMMENT ON COLUMN enquiry_vendor_cards.vendor_code IS 'Vendor code from sourcing selection';
COMMENT ON COLUMN enquiry_vendor_cards.effective_date IS 'Effective date from sourcing selection';
COMMENT ON COLUMN enquiry_vendor_cards.expiry_date IS 'Expiry date from sourcing selection';