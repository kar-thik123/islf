-- Migration to add sourcing_sub_charges table
CREATE TABLE IF NOT EXISTS sourcing_sub_charges (
    id SERIAL PRIMARY KEY,
    sourcing_id INTEGER NOT NULL REFERENCES sourcing(id) ON DELETE CASCADE,
    charge_name VARCHAR(255) NOT NULL,
    currency VARCHAR(10),
    charges DECIMAL(15, 2),
    gst_vat DECIMAL(10, 2),
    date_time TIMESTAMP,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_sourcing_sub_charges_sourcing_id ON sourcing_sub_charges(sourcing_id);

CREATE TRIGGER update_sourcing_sub_charges_updated_at
    BEFORE UPDATE ON sourcing_sub_charges
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE sourcing_sub_charges IS 'Stores sub-charges related to a sourcing entry';