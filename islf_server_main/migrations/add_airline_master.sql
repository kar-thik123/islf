-- Create Airline Master Table
CREATE TABLE IF NOT EXISTS public.master_airline (
    id SERIAL PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    airline_name TEXT NOT NULL,
    airline_no TEXT, -- Flight No / Airline Identifier
    active BOOLEAN DEFAULT TRUE,
    company_code TEXT,
    branch_code TEXT,
    department_code TEXT,
    created_by TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add Schedule Type to Service Types
ALTER TABLE public.service_types ADD COLUMN IF NOT EXISTS schedule_type TEXT;

-- Initialize Number Series for AIRLINE
INSERT INTO public.number_series (code, description, is_manual, created_by)
VALUES ('AIRLINE', 'Airline Master Number Series', FALSE, 'System')
ON CONFLICT (code) DO NOTHING;

-- Initialize Number Series Relation for AIRLINE
INSERT INTO public.number_relation (number_series, prefix, starting_no, last_no_used, increment_by, created_by)
SELECT 'AIRLINE', 'AIR', 1, 0, 1, 'System'
WHERE NOT EXISTS (SELECT 1 FROM public.number_relation WHERE number_series = 'AIRLINE');

-- Initialize Mapping for AIRLINE_MASTER
INSERT INTO public.mapping_relations (code_type, mapping, description, created_by)
VALUES ('AIRLINE_MASTER', 'AIRLINE', 'Airline Master Number Series Mapping', 'System')
ON CONFLICT DO NOTHING;

-- Initialize Airline Filter Setting
INSERT INTO public.settings (key, value, description, created_by)
VALUES ('validation_airline_filter', 'CB', 'Airline filter validation settings (C=Company, B=Branch)', 'System')
ON CONFLICT (key) DO NOTHING;
