-- Create entity_documents table
CREATE TABLE IF NOT EXISTS entity_documents (
    id SERIAL PRIMARY KEY,
    entity_type VARCHAR(50) NOT NULL, -- 'customer', 'vendor', 'company', etc.
    entity_code VARCHAR(100) NOT NULL, -- e.g., customer_no, vendor_code
    doc_type VARCHAR(255) NOT NULL,
    document_number VARCHAR(100),
    valid_from DATE,
    valid_till DATE,
    file_path TEXT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_size INTEGER NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_entity_documents_entity_type ON entity_documents(entity_type);
CREATE INDEX IF NOT EXISTS idx_entity_documents_entity_id ON entity_documents(entity_id);
CREATE INDEX IF NOT EXISTS idx_entity_documents_entity_type_id ON entity_documents(entity_type, entity_id);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_entity_documents_updated_at 
    BEFORE UPDATE ON entity_documents 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column(); 