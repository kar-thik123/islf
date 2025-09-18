-- Contact Management System Database Schema
-- Separate tables for customer and vendor contacts

-- Customer Contacts Table
CREATE TABLE IF NOT EXISTS customer_contacts (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL, -- Contact person name
    department VARCHAR(255), -- Department of the contact person
    mobile VARCHAR(50), -- Mobile number
    landline VARCHAR(50), -- Landline number
    email VARCHAR(255), -- Email address
    remarks TEXT, -- Additional remarks/notes
    is_primary BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT customer_contacts_customer_fkey FOREIGN KEY (customer_id) REFERENCES customer(id) ON DELETE CASCADE
);

-- Vendor Contacts Table
CREATE TABLE IF NOT EXISTS vendor_contacts (
    id SERIAL PRIMARY KEY,
    vendor_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL, -- Contact person name
    department VARCHAR(255), -- Department of the contact person
    mobile VARCHAR(50), -- Mobile number
    landline VARCHAR(50), -- Landline number
    email VARCHAR(255), -- Email address
    remarks TEXT, -- Additional remarks/notes
    is_primary BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT vendor_contacts_vendor_fkey FOREIGN KEY (vendor_id) REFERENCES vendor(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_customer_contacts_customer_id ON customer_contacts(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_contacts_type ON customer_contacts(contact_type);
CREATE INDEX IF NOT EXISTS idx_customer_contacts_primary ON customer_contacts(is_primary) WHERE is_primary = true;
CREATE INDEX IF NOT EXISTS idx_customer_contacts_active ON customer_contacts(is_active) WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_vendor_contacts_vendor_id ON vendor_contacts(vendor_id);
CREATE INDEX IF NOT EXISTS idx_vendor_contacts_type ON vendor_contacts(contact_type);
CREATE INDEX IF NOT EXISTS idx_vendor_contacts_primary ON vendor_contacts(is_primary) WHERE is_primary = true;
CREATE INDEX IF NOT EXISTS idx_vendor_contacts_active ON vendor_contacts(is_active) WHERE is_active = true;

-- Create triggers for updated_at columns
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_customer_contacts_updated_at 
    BEFORE UPDATE ON customer_contacts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendor_contacts_updated_at 
    BEFORE UPDATE ON vendor_contacts 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE customer_contacts IS 'Stores contact information for customers in a normalized format';
COMMENT ON TABLE vendor_contacts IS 'Stores contact information for vendors in a normalized format';

COMMENT ON COLUMN customer_contacts.contact_type IS 'Type of contact: phone, email, fax, mobile, whatsapp';
COMMENT ON COLUMN customer_contacts.contact_value IS 'The actual contact value (phone number, email address, etc.)';
COMMENT ON COLUMN customer_contacts.contact_label IS 'Optional label for the contact (Primary, Secondary, Office, Personal)';
COMMENT ON COLUMN customer_contacts.is_primary IS 'Indicates if this is the primary contact of this type';

COMMENT ON COLUMN vendor_contacts.contact_type IS 'Type of contact: phone, email, fax, mobile, whatsapp';
COMMENT ON COLUMN vendor_contacts.contact_value IS 'The actual contact value (phone number, email address, etc.)';
COMMENT ON COLUMN vendor_contacts.contact_label IS 'Optional label for the contact (Primary, Secondary, Office, Personal)';
COMMENT ON COLUMN vendor_contacts.is_primary IS 'Indicates if this is the primary contact of this type';