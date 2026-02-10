-- ============================================================================
-- MODULE REGISTRY TABLE
-- Maps technical module names to business-friendly groups and display names
-- ============================================================================

CREATE TABLE IF NOT EXISTS module_registry (
    id SERIAL PRIMARY KEY,
    module_name VARCHAR(100) NOT NULL UNIQUE,
    module_group VARCHAR(50) NOT NULL,
    display_name VARCHAR(200) NOT NULL,
    description TEXT,
    icon VARCHAR(50),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for fast lookups
CREATE INDEX IF NOT EXISTS idx_module_registry_group ON module_registry(module_group);
CREATE INDEX IF NOT EXISTS idx_module_registry_name ON module_registry(module_name);

-- ============================================================================
-- SEED DATA - Module Registry
-- ============================================================================

INSERT INTO module_registry (module_name, module_group, display_name, description, sort_order) VALUES
-- Auth Logs
('login', 'Auth', 'User Login', 'User authentication events', 1),
('logout', 'Auth', 'User Logout', 'User logout events', 2),
('password_reset', 'Auth', 'Password Reset', 'Password reset requests', 3),

-- Setup Logs
('company', 'Setup', 'Company Management', 'Company master data', 10),
('number_series', 'Setup', 'Number Series', 'Number series configuration', 11),
('number_series_relation', 'Setup', 'Number Series Relation', 'Number series relationships', 12),
('number_series_mapping', 'Setup', 'Number Series Mapping', 'Number series mappings', 13),
('it_setup', 'Setup', 'IT Setup', 'System configuration', 14),
('user_management', 'Setup', 'User Management', 'User accounts and roles', 15),
('carriage_direction', 'Setup', 'Carriage Direction', 'Carriage direction settings', 16),

-- Masters Logs
('master_code', 'Masters', 'Master Code', 'Master code definitions', 20),
('customer', 'Masters', 'Customer', 'Customer master data', 21),
('vendor', 'Masters', 'Vendor', 'Vendor master data', 22),
('master_location', 'Masters', 'Location', 'Location master data', 23),
('vessel', 'Masters', 'Vessel', 'Vessel master data', 24),
('airline', 'Masters', 'Airline', 'Airline master data', 25),
('master_uom', 'Masters', 'Unit of Measure', 'UOM definitions', 26),
('basis', 'Masters', 'Basis', 'Basis master data', 27),
('master_item', 'Masters', 'Master Item', 'Item master data', 28),
('cargo', 'Masters', 'Cargo', 'Cargo definitions', 29),
('charges', 'Masters', 'Charges', 'Charge master data', 30),
('currency_code', 'Masters', 'Currency Code', 'Currency definitions', 31),
('container', 'Masters', 'Container', 'Container types', 32),
('gst_setup', 'Masters', 'GST Setup', 'GST configuration', 33),
('local_tariff', 'Masters', 'Local Tariff', 'Local tariff rates', 34),
('sourcing', 'Masters', 'Sourcing', 'Sourcing master data', 35),
('service_area', 'Masters', 'Service Area', 'Service area definitions', 36),
('source_sales', 'Masters', 'Source Sales', 'Sales source data', 37),

-- Master Type Logs (SEPARATE from Masters)
('user_status', 'Master Types', 'User Status', 'User status types', 40),
('tariff_type', 'Master Types', 'Tariff Type', 'Tariff type definitions', 41),
('customer_type', 'Master Types', 'Customer Type', 'Customer type definitions', 42),
('vendor_type', 'Master Types', 'Vendor Type', 'Vendor type definitions', 43),
('cargo_type', 'Master Types', 'Cargo Type', 'Cargo type definitions', 44),
('charge_type', 'Master Types', 'Charge Type', 'Charge type definitions', 45),
('basis_type', 'Master Types', 'Basis Type', 'Basis type definitions', 46),
('service_area_type', 'Master Types', 'Service Area Type', 'Service area type definitions', 47),
('item_type', 'Master Types', 'Item Type', 'Item type definitions', 48),
('location_type', 'Master Types', 'Location Type', 'Location type definitions', 49),

-- Operations Logs
('enquiry', 'Operations', 'Enquiry', 'Enquiry management', 50),
('booking', 'Operations', 'Booking', 'Booking management', 51),
('tariff', 'Operations', 'Tariff', 'Tariff management', 52),
('sales_person', 'Operations', 'Sales Person', 'Sales person management', 53)
ON CONFLICT (module_name) DO NOTHING;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE module_registry IS 'Registry mapping technical module names to business groups';
COMMENT ON COLUMN module_registry.module_name IS 'Technical identifier used in code (e.g., master_location)';
COMMENT ON COLUMN module_registry.module_group IS 'Business category: Auth, Setup, Masters, Master Types, Operations';
COMMENT ON COLUMN module_registry.display_name IS 'User-friendly name shown in UI';
