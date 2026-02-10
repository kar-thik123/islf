-- migration: add_performance_indexes.sql
-- Description: Adds indexes to major transaction tables for company/branch/department context filtering

-- Enquiry Table Indexes
CREATE INDEX IF NOT EXISTS idx_enquiry_context ON enquiry (company_code, branch_code, department_code);
CREATE INDEX IF NOT EXISTS idx_enquiry_status ON enquiry (status);
CREATE INDEX IF NOT EXISTS idx_enquiry_created_at ON enquiry (created_at DESC);

-- Booking Table Indexes
CREATE INDEX IF NOT EXISTS idx_booking_context ON booking (company_code, branch_code, department_code);
CREATE INDEX IF NOT EXISTS idx_booking_status ON booking (status);
CREATE INDEX IF NOT EXISTS idx_booking_created_at ON booking (created_at DESC);

-- Tariff Table Indexes
CREATE INDEX IF NOT EXISTS idx_tariff_context ON tariff (company_code, branch_code, department_code);
CREATE INDEX IF NOT EXISTS idx_tariff_status ON tariff (status);

-- Master Item Tables (Frequent lookups)
CREATE INDEX IF NOT EXISTS idx_customer_context ON customer (company_code, branch_code, department_code);
CREATE INDEX IF NOT EXISTS idx_vendor_context ON vendor (company_code, branch_code, department_code);
CREATE INDEX IF NOT EXISTS idx_master_location_active ON master_location (active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_vendor_status ON vendor (status) WHERE status = 'Active';
