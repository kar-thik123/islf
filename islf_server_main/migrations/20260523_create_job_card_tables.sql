-- CREATE TABLES FOR JOB CARD FOUNDATION MODULE

-- 1. Main Header Table
CREATE TABLE IF NOT EXISTS job_card (
    id SERIAL PRIMARY KEY,
    job_card_no VARCHAR(50) UNIQUE NOT NULL,
    job_date DATE NOT NULL,
    enquiry_type VARCHAR(100),
    company_name VARCHAR(255),
    sales_person VARCHAR(255),
    department VARCHAR(100),
    service_type VARCHAR(100),
    from_location_type VARCHAR(50),
    from_location VARCHAR(255),
    to_location_type VARCHAR(50),
    to_location VARCHAR(255),
    job_month VARCHAR(20),
    general_remarks TEXT,
    
    -- Remarks section
    customer_remarks TEXT,
    vendor_remarks TEXT,
    job_remarks TEXT,
    
    -- Snapshot storage (following booking pattern)
    line_items JSONB,
    cargo JSONB,
    schedules JSONB,
    breakup JSONB,
    
    -- ERP metadata standards
    status VARCHAR(50) DEFAULT 'Open',
    is_active BOOLEAN DEFAULT true,
    company_code VARCHAR(10),
    branch_code VARCHAR(10),
    department_code VARCHAR(10),
    service_type_code VARCHAR(10),
    
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indices for context filtering and search performance
CREATE INDEX IF NOT EXISTS idx_job_card_no ON job_card(job_card_no);
CREATE INDEX IF NOT EXISTS idx_job_card_context ON job_card(company_code, branch_code, department_code);
CREATE INDEX IF NOT EXISTS idx_job_card_active ON job_card(is_active);

-- 2. Line Items (Scope Section)
CREATE TABLE IF NOT EXISTS job_card_line_items (
    id SERIAL PRIMARY KEY,
    job_card_id INT NOT NULL REFERENCES job_card(id) ON DELETE CASCADE,
    s_no INT NOT NULL,
    type VARCHAR(100),
    service_area VARCHAR(255),
    vendor VARCHAR(255),
    vendor_booking_no VARCHAR(255),
    basis VARCHAR(100),
    qty NUMERIC,
    status VARCHAR(50) DEFAULT 'Active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_job_card_li_parent ON job_card_line_items(job_card_id);

-- 3. Cargo Details
CREATE TABLE IF NOT EXISTS job_card_cargo (
    id SERIAL PRIMARY KEY,
    job_card_id INT NOT NULL REFERENCES job_card(id) ON DELETE CASCADE,
    cargo_type VARCHAR(100),
    cargo_name VARCHAR(255),
    hs_code VARCHAR(50),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_job_card_cargo_parent ON job_card_cargo(job_card_id);

-- 4. Schedules
CREATE TABLE IF NOT EXISTS job_card_schedule (
    id SERIAL PRIMARY KEY,
    job_card_id INT NOT NULL REFERENCES job_card(id) ON DELETE CASCADE,
    from_location VARCHAR(255),
    to_location VARCHAR(255),
    vessel_airline VARCHAR(255),
    voyage_flight_no VARCHAR(255),
    etd TIMESTAMP,
    eta TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_job_card_schedule_parent ON job_card_schedule(job_card_id);

-- 5. Breakups
CREATE TABLE IF NOT EXISTS job_card_breakup (
    id SERIAL PRIMARY KEY,
    job_card_id INT NOT NULL REFERENCES job_card(id) ON DELETE CASCADE,
    vendor_booking_no VARCHAR(255),
    basis VARCHAR(100),
    container_no VARCHAR(100),
    pickup_handover_date DATE,
    pickup_handover_at VARCHAR(255),
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_job_card_breakup_parent ON job_card_breakup(job_card_id);

-- Register Job Card module in module_registry
INSERT INTO module_registry (module_name, module_group, display_name, description, sort_order)
VALUES ('job_card', 'Operations', 'Job Card', 'Job Card management', 54)
ON CONFLICT (module_name) DO NOTHING;
