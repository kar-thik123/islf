-- Create service_types table
CREATE TABLE public.service_types (
    code text NOT NULL,
    company_code text NOT NULL,
    branch_code text NOT NULL,
    department_code text NOT NULL,
    name text NOT NULL,
    description text,
    incharge_name text,
    incharge_from date,
    status text,
    start_date date,
    close_date date,
    remarks text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);

-- Set ownership
ALTER TABLE public.service_types OWNER TO postgres;

-- Add primary key constraint
ALTER TABLE ONLY public.service_types
    ADD CONSTRAINT service_types_pkey PRIMARY KEY (code);

-- Add foreign key constraints
ALTER TABLE ONLY public.service_types
    ADD CONSTRAINT service_types_company_code_fkey FOREIGN KEY (company_code) REFERENCES public.companies(code) ON DELETE CASCADE;

ALTER TABLE ONLY public.service_types
    ADD CONSTRAINT service_types_branch_code_fkey FOREIGN KEY (branch_code) REFERENCES public.branches(code) ON DELETE CASCADE;

ALTER TABLE ONLY public.service_types
    ADD CONSTRAINT service_types_department_code_fkey FOREIGN KEY (department_code) REFERENCES public.departments(code) ON DELETE CASCADE;

-- Create indexes for better performance
CREATE INDEX idx_service_types_company_code ON public.service_types USING btree (company_code);
CREATE INDEX idx_service_types_branch_code ON public.service_types USING btree (branch_code);
CREATE INDEX idx_service_types_department_code ON public.service_types USING btree (department_code);
CREATE INDEX idx_service_types_code ON public.service_types USING btree (code);

-- Create view for dropdown
CREATE VIEW public.service_type_dropdown AS
 SELECT code,
    name,
    ((code || ' - '::text) || name) AS label
   FROM public.service_types;

-- Set ownership for view
ALTER VIEW public.service_type_dropdown OWNER TO postgres;

-- Add trigger for updated_at column
CREATE TRIGGER update_service_types_updated_at BEFORE UPDATE ON public.service_types FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column(); 