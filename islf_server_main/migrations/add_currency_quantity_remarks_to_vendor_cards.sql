-- Migration: Add currency, quantity, and remarks to enquiry_vendor_cards table
-- Date: 2024-01-23
-- Description: Add missing columns for currency, quantity, and remarks in vendor cards

-- Add missing columns to enquiry_vendor_cards table
ALTER TABLE enquiry_vendor_cards 
ADD COLUMN IF NOT EXISTS currency VARCHAR(10),
ADD COLUMN IF NOT EXISTS quantity DECIMAL(10,2),
ADD COLUMN IF NOT EXISTS remarks TEXT;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_enquiry_vendor_cards_currency ON enquiry_vendor_cards(currency);

-- Add comments to document the new columns
COMMENT ON COLUMN enquiry_vendor_cards.currency IS 'Currency code from sourcing selection';
COMMENT ON COLUMN enquiry_vendor_cards.quantity IS 'Mapped quantity from line items based on basis';
COMMENT ON COLUMN enquiry_vendor_cards.remarks IS 'Additional remarks for the vendor card';