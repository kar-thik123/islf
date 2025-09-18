-- =====================================================
-- ENQUIRY MANAGEMENT SCHEMA
-- =====================================================
-- This schema defines the complete enquiry management system
-- including enquiries, line items, and vendor cards

-- =====================================================
-- MAIN ENQUIRY TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS enquiry (
    id SERIAL PRIMARY KEY,
    enquiry_no VARCHAR(50) UNIQUE NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    date DATE NOT NULL,
    
    -- Customer Information
    customer_id INTEGER REFERENCES customer(id) ON DELETE SET NULL,
    customer_name VARCHAR(255),
    email VARCHAR(255),
    mobile VARCHAR(50),
    landline VARCHAR(50),
    company_name VARCHAR(255),
    contact_department VARCHAR(255), -- Department of the contact person
    
    -- Location Information
    from_location VARCHAR(255),
    to_location VARCHAR(255),
    
    -- Date Range
    effective_date_from DATE,
    effective_date_to DATE,
    
    -- Additional Information
    department VARCHAR(100),
    status VARCHAR(50) DEFAULT 'Open',
    remarks TEXT,
    
    -- Context Fields (Multi-company/branch/department support)
    company_code VARCHAR(10),
    branch_code VARCHAR(10),
    department_code VARCHAR(10),
    service_type_code VARCHAR(10),
    
    -- Audit Fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

-- =====================================================
-- ENQUIRY LINE ITEMS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS enquiry_line_items (
    id SERIAL PRIMARY KEY,
    enquiry_id INTEGER NOT NULL REFERENCES enquiry(id) ON DELETE CASCADE,
    s_no INTEGER NOT NULL,
    quantity DECIMAL(10,2),
    basis VARCHAR(100),
    remarks TEXT,
    status VARCHAR(50) DEFAULT 'Active',
    
    -- Audit Fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Ensure unique serial number per enquiry
    UNIQUE(enquiry_id, s_no)
);

-- =====================================================
-- ENQUIRY VENDOR CARDS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS enquiry_vendor_cards (
    id SERIAL PRIMARY KEY,
    enquiry_id INTEGER NOT NULL REFERENCES enquiry(id) ON DELETE CASCADE,
    vendor_id INTEGER REFERENCES vendor(id) ON DELETE SET NULL,
    vendor_name VARCHAR(255),
    
    -- Quotation Information
    quotation_no VARCHAR(100),
    quotation_date DATE,
    quoted_amount DECIMAL(15,2),
    currency_code VARCHAR(10),
    
    -- Terms and Conditions
    payment_terms TEXT,
    delivery_terms TEXT,
    validity_date DATE,
    
    -- Negotiation Information
    negotiated_amount DECIMAL(15,2),
    negotiation_remarks TEXT,
    negotiation_status VARCHAR(50) DEFAULT 'Pending',
    
    -- Selection Status
    is_selected BOOLEAN DEFAULT FALSE,
    selection_remarks TEXT,
    
    -- Status
    status VARCHAR(50) DEFAULT 'Active',
    
    -- Audit Fields
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100),
    updated_by VARCHAR(100)
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Main enquiry table indexes
CREATE INDEX IF NOT EXISTS idx_enquiry_enquiry_no ON enquiry(enquiry_no);
CREATE INDEX IF NOT EXISTS idx_enquiry_code ON enquiry(code);
CREATE INDEX IF NOT EXISTS idx_enquiry_customer_id ON enquiry(customer_id);
CREATE INDEX IF NOT EXISTS idx_enquiry_date ON enquiry(date);
CREATE INDEX IF NOT EXISTS idx_enquiry_status ON enquiry(status);
CREATE INDEX IF NOT EXISTS idx_enquiry_company_code ON enquiry(company_code);
CREATE INDEX IF NOT EXISTS idx_enquiry_branch_code ON enquiry(branch_code);
CREATE INDEX IF NOT EXISTS idx_enquiry_department_code ON enquiry(department_code);
CREATE INDEX IF NOT EXISTS idx_enquiry_service_type_code ON enquiry(service_type_code);
CREATE INDEX IF NOT EXISTS idx_enquiry_created_at ON enquiry(created_at);

-- Composite indexes for common queries
CREATE INDEX IF NOT EXISTS idx_enquiry_context ON enquiry(company_code, branch_code, department_code, service_type_code);
CREATE INDEX IF NOT EXISTS idx_enquiry_customer_status ON enquiry(customer_id, status);

-- Line items indexes
CREATE INDEX IF NOT EXISTS idx_enquiry_line_items_enquiry_id ON enquiry_line_items(enquiry_id);
CREATE INDEX IF NOT EXISTS idx_enquiry_line_items_status ON enquiry_line_items(status);

-- Vendor cards indexes
CREATE INDEX IF NOT EXISTS idx_enquiry_vendor_cards_enquiry_id ON enquiry_vendor_cards(enquiry_id);
CREATE INDEX IF NOT EXISTS idx_enquiry_vendor_cards_vendor_id ON enquiry_vendor_cards(vendor_id);
CREATE INDEX IF NOT EXISTS idx_enquiry_vendor_cards_status ON enquiry_vendor_cards(status);
CREATE INDEX IF NOT EXISTS idx_enquiry_vendor_cards_selected ON enquiry_vendor_cards(is_selected);

-- =====================================================
-- TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_enquiry_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers to tables
CREATE TRIGGER trigger_enquiry_updated_at
    BEFORE UPDATE ON enquiry
    FOR EACH ROW
    EXECUTE FUNCTION update_enquiry_updated_at();

CREATE TRIGGER trigger_enquiry_line_items_updated_at
    BEFORE UPDATE ON enquiry_line_items
    FOR EACH ROW
    EXECUTE FUNCTION update_enquiry_updated_at();

CREATE TRIGGER trigger_enquiry_vendor_cards_updated_at
    BEFORE UPDATE ON enquiry_vendor_cards
    FOR EACH ROW
    EXECUTE FUNCTION update_enquiry_updated_at();

-- =====================================================
-- CONSTRAINTS AND VALIDATIONS
-- =====================================================

-- Status constraints
ALTER TABLE enquiry ADD CONSTRAINT chk_enquiry_status 
    CHECK (status IN ('Open', 'In Progress', 'Quoted', 'Confirmed', 'Cancelled', 'Closed'));

ALTER TABLE enquiry_line_items ADD CONSTRAINT chk_line_items_status 
    CHECK (status IN ('Active', 'Inactive', 'Cancelled'));

ALTER TABLE enquiry_vendor_cards ADD CONSTRAINT chk_vendor_cards_status 
    CHECK (status IN ('Active', 'Inactive', 'Cancelled'));

ALTER TABLE enquiry_vendor_cards ADD CONSTRAINT chk_negotiation_status 
    CHECK (negotiation_status IN ('Pending', 'In Progress', 'Accepted', 'Rejected', 'Counter Offered'));

-- Ensure positive amounts
ALTER TABLE enquiry_vendor_cards ADD CONSTRAINT chk_quoted_amount_positive 
    CHECK (quoted_amount >= 0);

ALTER TABLE enquiry_vendor_cards ADD CONSTRAINT chk_negotiated_amount_positive 
    CHECK (negotiated_amount >= 0 OR negotiated_amount IS NULL);

-- Ensure positive quantities
ALTER TABLE enquiry_line_items ADD CONSTRAINT chk_quantity_positive 
    CHECK (quantity >= 0 OR quantity IS NULL);

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================

COMMENT ON TABLE enquiry IS 'Main enquiry table storing customer enquiry information';
COMMENT ON TABLE enquiry_line_items IS 'Line items for each enquiry with quantity and basis details';
COMMENT ON TABLE enquiry_vendor_cards IS 'Vendor quotations and negotiations for enquiries';

-- Column comments for enquiry table
COMMENT ON COLUMN enquiry.enquiry_no IS 'Unique enquiry number generated from number series';
COMMENT ON COLUMN enquiry.code IS 'Unique enquiry code for reference';
COMMENT ON COLUMN enquiry.customer_id IS 'Reference to customer table, nullable for new customers';
COMMENT ON COLUMN enquiry.company_code IS 'Company code for multi-company support';
COMMENT ON COLUMN enquiry.branch_code IS 'Branch code for multi-branch support';
COMMENT ON COLUMN enquiry.department_code IS 'Department code for multi-department support';
COMMENT ON COLUMN enquiry.service_type_code IS 'Service type code for categorization';

-- Column comments for vendor cards
COMMENT ON COLUMN enquiry_vendor_cards.is_selected IS 'Indicates if this vendor quote is selected for the enquiry';
COMMENT ON COLUMN enquiry_vendor_cards.negotiated_amount IS 'Final negotiated amount after discussions';
COMMENT ON COLUMN enquiry_vendor_cards.negotiation_status IS 'Current status of price negotiation';