-- 20260527_add_multi_booking_to_job_card.sql

-- 1. Add linked_bookings JSONB array to job_card to support many-to-one
ALTER TABLE job_card ADD COLUMN IF NOT EXISTS linked_bookings JSONB DEFAULT '[]'::jsonb;

-- Migrate existing booking_id/booking_no into linked_bookings if applicable
UPDATE job_card 
SET linked_bookings = jsonb_build_array(jsonb_build_object('booking_id', booking_id, 'booking_no', booking_no))
WHERE booking_id IS NOT NULL AND (linked_bookings IS NULL OR jsonb_array_length(linked_bookings) = 0);

-- 2. Add source booking tracking to job_card_breakup directly
ALTER TABLE job_card_breakup ADD COLUMN IF NOT EXISTS booking_id INT;
ALTER TABLE job_card_breakup ADD COLUMN IF NOT EXISTS booking_no VARCHAR(50);

-- 3. Add UNIQUE constraint to job_card_breakup_allocation to prevent duplicate allocations
-- We use a partial index where is_active = true to ensure a breakup is only allocated to ONE active job at a time.
CREATE UNIQUE INDEX IF NOT EXISTS idx_uniq_active_booking_breakup 
ON job_card_breakup_allocation (booking_breakup_id, breakup_type) 
WHERE is_active = true;
