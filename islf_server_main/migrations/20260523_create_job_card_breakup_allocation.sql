-- CREATE JOB CARD BREAKUP ALLOCATION TRACKING
CREATE TABLE IF NOT EXISTS job_card_breakup_allocation (
    id SERIAL PRIMARY KEY,
    job_card_id INT NOT NULL REFERENCES job_card(id) ON DELETE CASCADE,
    booking_id INT NOT NULL,
    booking_no VARCHAR(50) NOT NULL,
    booking_breakup_id INT NOT NULL,
    breakup_type VARCHAR(50) NOT NULL, -- 'container', 'package', 'general'
    allocated_qty NUMERIC DEFAULT 1,
    allocation_status VARCHAR(50) DEFAULT 'Allocated',
    company_code VARCHAR(10),
    branch_code VARCHAR(10),
    department_code VARCHAR(10),
    is_active BOOLEAN DEFAULT true,
    created_by VARCHAR(100),
    updated_by VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    item_no VARCHAR(100)
);

-- Idempotent alteration in case table already exists
ALTER TABLE job_card_breakup_allocation ADD COLUMN IF NOT EXISTS item_no VARCHAR(100);

CREATE INDEX IF NOT EXISTS idx_job_card_bk_alloc_job ON job_card_breakup_allocation(job_card_id);
CREATE INDEX IF NOT EXISTS idx_job_card_bk_alloc_booking ON job_card_breakup_allocation(booking_id);

-- Alter job_card_breakup to add reference columns for linkage
ALTER TABLE job_card_breakup ADD COLUMN IF NOT EXISTS booking_breakup_id INT;
ALTER TABLE job_card_breakup ADD COLUMN IF NOT EXISTS breakup_type VARCHAR(50);

CREATE INDEX IF NOT EXISTS idx_job_card_breakup_alloc ON job_card_breakup(booking_breakup_id);
