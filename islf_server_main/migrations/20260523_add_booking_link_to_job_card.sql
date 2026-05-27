-- ALTER TABLE TO ADD BOOKING LINKAGE REFERENCE
ALTER TABLE job_card ADD COLUMN IF NOT EXISTS booking_id INT;
ALTER TABLE job_card ADD COLUMN IF NOT EXISTS booking_no VARCHAR(50);

-- Index for linkage queries
CREATE INDEX IF NOT EXISTS idx_job_card_booking ON job_card(booking_id);
