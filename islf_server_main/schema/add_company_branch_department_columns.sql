-- SQL Script to add company_code, branch_code, and department_code columns to all tables
-- This script adds the organizational hierarchy columns to all tables for multi-company, multi-branch, multi-department support

-- Add company_code, branch_code, department_code columns to auth_logs table
ALTER TABLE public.auth_logs 
ADD COLUMN company_code character varying(10),
ADD COLUMN branch_code text,
ADD COLUMN department_code text;

-- Add foreign key constraints for auth_logs
ALTER TABLE public.auth_logs 
ADD CONSTRAINT auth_logs_company_code_fkey 
FOREIGN KEY (company_code) REFERENCES public.companies(code) ON DELETE SET NULL;

ALTER TABLE public.auth_logs 
ADD CONSTRAINT auth_logs_branch_code_fkey 
FOREIGN KEY (branch_code) REFERENCES public.branches(code) ON DELETE SET NULL;

ALTER TABLE public.auth_logs 
ADD CONSTRAINT auth_logs_department_code_fkey 
FOREIGN KEY (department_code) REFERENCES public.departments(code) ON DELETE SET NULL;

-- Add company_code, branch_code, department_code columns to container_code table
ALTER TABLE public.container_code 
ADD COLUMN company_code character varying(10),
ADD COLUMN branch_code text,
ADD COLUMN department_code text;

-- Add foreign key constraints for container_code
ALTER TABLE public.container_code 
ADD CONSTRAINT container_code_company_code_fkey 
FOREIGN KEY (company_code) REFERENCES public.companies(code) ON DELETE SET NULL;

ALTER TABLE public.container_code 
ADD CONSTRAINT container_code_branch_code_fkey 
FOREIGN KEY (branch_code) REFERENCES public.branches(code) ON DELETE SET NULL;

ALTER TABLE public.container_code 
ADD CONSTRAINT container_code_department_code_fkey 
FOREIGN KEY (department_code) REFERENCES public.departments(code) ON DELETE SET NULL;

-- Add company_code, branch_code, department_code columns to currency_code table
ALTER TABLE public.currency_code 
ADD COLUMN company_code character varying(10),
ADD COLUMN branch_code text,
ADD COLUMN department_code text;

-- Add foreign key constraints for currency_code
ALTER TABLE public.currency_code 
ADD CONSTRAINT currency_code_company_code_fkey 
FOREIGN KEY (company_code) REFERENCES public.companies(code) ON DELETE SET NULL;

ALTER TABLE public.currency_code 
ADD CONSTRAINT currency_code_branch_code_fkey 
FOREIGN KEY (branch_code) REFERENCES public.branches(code) ON DELETE SET NULL;

ALTER TABLE public.currency_code 
ADD CONSTRAINT currency_code_department_code_fkey 
FOREIGN KEY (department_code) REFERENCES public.departments(code) ON DELETE SET NULL;

-- Add company_code, branch_code, department_code columns to customer table
ALTER TABLE public.customer 
ADD COLUMN company_code character varying(10),
ADD COLUMN branch_code text,
ADD COLUMN department_code text;

-- Add foreign key constraints for customer
ALTER TABLE public.customer 
ADD CONSTRAINT customer_company_code_fkey 
FOREIGN KEY (company_code) REFERENCES public.companies(code) ON DELETE SET NULL;

ALTER TABLE public.customer 
ADD CONSTRAINT customer_branch_code_fkey 
FOREIGN KEY (branch_code) REFERENCES public.branches(code) ON DELETE SET NULL;

ALTER TABLE public.customer 
ADD CONSTRAINT customer_department_code_fkey 
FOREIGN KEY (department_code) REFERENCES public.departments(code) ON DELETE SET NULL;

-- Add company_code, branch_code, department_code columns to entity_documents table
ALTER TABLE public.entity_documents 
ADD COLUMN company_code character varying(10),
ADD COLUMN branch_code text,
ADD COLUMN department_code text;

-- Add foreign key constraints for entity_documents
ALTER TABLE public.entity_documents 
ADD CONSTRAINT entity_documents_company_code_fkey 
FOREIGN KEY (company_code) REFERENCES public.companies(code) ON DELETE SET NULL;

ALTER TABLE public.entity_documents 
ADD CONSTRAINT entity_documents_branch_code_fkey 
FOREIGN KEY (branch_code) REFERENCES public.branches(code) ON DELETE SET NULL;

ALTER TABLE public.entity_documents 
ADD CONSTRAINT entity_documents_department_code_fkey 
FOREIGN KEY (department_code) REFERENCES public.departments(code) ON DELETE SET NULL;

-- Add company_code, branch_code, department_code columns to gst_setup table
ALTER TABLE public.gst_setup 
ADD COLUMN company_code character varying(10),
ADD COLUMN branch_code text,
ADD COLUMN department_code text;

-- Add foreign key constraints for gst_setup
ALTER TABLE public.gst_setup 
ADD CONSTRAINT gst_setup_company_code_fkey 
FOREIGN KEY (company_code) REFERENCES public.companies(code) ON DELETE SET NULL;

ALTER TABLE public.gst_setup 
ADD CONSTRAINT gst_setup_branch_code_fkey 
FOREIGN KEY (branch_code) REFERENCES public.branches(code) ON DELETE SET NULL;

ALTER TABLE public.gst_setup 
ADD CONSTRAINT gst_setup_department_code_fkey 
FOREIGN KEY (department_code) REFERENCES public.departments(code) ON DELETE SET NULL;

-- Add company_code, branch_code, department_code columns to mapping table
ALTER TABLE public.mapping 
ADD COLUMN company_code character varying(10),
ADD COLUMN branch_code text,
ADD COLUMN department_code text;

-- Add foreign key constraints for mapping
ALTER TABLE public.mapping 
ADD CONSTRAINT mapping_company_code_fkey 
FOREIGN KEY (company_code) REFERENCES public.companies(code) ON DELETE SET NULL;

ALTER TABLE public.mapping 
ADD CONSTRAINT mapping_branch_code_fkey 
FOREIGN KEY (branch_code) REFERENCES public.branches(code) ON DELETE SET NULL;

ALTER TABLE public.mapping 
ADD CONSTRAINT mapping_department_code_fkey 
FOREIGN KEY (department_code) REFERENCES public.departments(code) ON DELETE SET NULL;

-- Add company_code, branch_code, department_code columns to master_code table
ALTER TABLE public.master_code 
ADD COLUMN company_code character varying(10),
ADD COLUMN branch_code text,
ADD COLUMN department_code text;

-- Add foreign key constraints for master_code
ALTER TABLE public.master_code 
ADD CONSTRAINT master_code_company_code_fkey 
FOREIGN KEY (company_code) REFERENCES public.companies(code) ON DELETE SET NULL;

ALTER TABLE public.master_code 
ADD CONSTRAINT master_code_branch_code_fkey 
FOREIGN KEY (branch_code) REFERENCES public.branches(code) ON DELETE SET NULL;

ALTER TABLE public.master_code 
ADD CONSTRAINT master_code_department_code_fkey 
FOREIGN KEY (department_code) REFERENCES public.departments(code) ON DELETE SET NULL;

-- Add company_code, branch_code, department_code columns to master_item table
ALTER TABLE public.master_item 
ADD COLUMN company_code character varying(10),
ADD COLUMN branch_code text,
ADD COLUMN department_code text;

-- Add foreign key constraints for master_item
ALTER TABLE public.master_item 
ADD CONSTRAINT master_item_company_code_fkey 
FOREIGN KEY (company_code) REFERENCES public.companies(code) ON DELETE SET NULL;

ALTER TABLE public.master_item 
ADD CONSTRAINT master_item_branch_code_fkey 
FOREIGN KEY (branch_code) REFERENCES public.branches(code) ON DELETE SET NULL;

ALTER TABLE public.master_item 
ADD CONSTRAINT master_item_department_code_fkey 
FOREIGN KEY (department_code) REFERENCES public.departments(code) ON DELETE SET NULL;

-- Add company_code, branch_code, department_code columns to master_location table
ALTER TABLE public.master_location 
ADD COLUMN company_code character varying(10),
ADD COLUMN branch_code text,
ADD COLUMN department_code text;

-- Add foreign key constraints for master_location
ALTER TABLE public.master_location 
ADD CONSTRAINT master_location_company_code_fkey 
FOREIGN KEY (company_code) REFERENCES public.companies(code) ON DELETE SET NULL;

ALTER TABLE public.master_location 
ADD CONSTRAINT master_location_branch_code_fkey 
FOREIGN KEY (branch_code) REFERENCES public.branches(code) ON DELETE SET NULL;

ALTER TABLE public.master_location 
ADD CONSTRAINT master_location_department_code_fkey 
FOREIGN KEY (department_code) REFERENCES public.departments(code) ON DELETE SET NULL;

-- Add company_code, branch_code, department_code columns to master_logs table
ALTER TABLE public.master_logs 
ADD COLUMN company_code character varying(10),
ADD COLUMN branch_code text,
ADD COLUMN department_code text;

-- Add foreign key constraints for master_logs
ALTER TABLE public.master_logs 
ADD CONSTRAINT master_logs_company_code_fkey 
FOREIGN KEY (company_code) REFERENCES public.companies(code) ON DELETE SET NULL;

ALTER TABLE public.master_logs 
ADD CONSTRAINT master_logs_branch_code_fkey 
FOREIGN KEY (branch_code) REFERENCES public.branches(code) ON DELETE SET NULL;

ALTER TABLE public.master_logs 
ADD CONSTRAINT master_logs_department_code_fkey 
FOREIGN KEY (department_code) REFERENCES public.departments(code) ON DELETE SET NULL;

-- Add company_code, branch_code, department_code columns to master_type table
ALTER TABLE public.master_type 
ADD COLUMN company_code character varying(10),
ADD COLUMN branch_code text,
ADD COLUMN department_code text;

-- Add foreign key constraints for master_type
ALTER TABLE public.master_type 
ADD CONSTRAINT master_type_company_code_fkey 
FOREIGN KEY (company_code) REFERENCES public.companies(code) ON DELETE SET NULL;

ALTER TABLE public.master_type 
ADD CONSTRAINT master_type_branch_code_fkey 
FOREIGN KEY (branch_code) REFERENCES public.branches(code) ON DELETE SET NULL;

ALTER TABLE public.master_type 
ADD CONSTRAINT master_type_department_code_fkey 
FOREIGN KEY (department_code) REFERENCES public.departments(code) ON DELETE SET NULL;

-- Add company_code, branch_code, department_code columns to master_uom table
ALTER TABLE public.master_uom 
ADD COLUMN company_code character varying(10),
ADD COLUMN branch_code text,
ADD COLUMN department_code text;

-- Add foreign key constraints for master_uom
ALTER TABLE public.master_uom 
ADD CONSTRAINT master_uom_company_code_fkey 
FOREIGN KEY (company_code) REFERENCES public.companies(code) ON DELETE SET NULL;

ALTER TABLE public.master_uom 
ADD CONSTRAINT master_uom_branch_code_fkey 
FOREIGN KEY (branch_code) REFERENCES public.branches(code) ON DELETE SET NULL;

ALTER TABLE public.master_uom 
ADD CONSTRAINT master_uom_department_code_fkey 
FOREIGN KEY (department_code) REFERENCES public.departments(code) ON DELETE SET NULL;

-- Add company_code, branch_code, department_code columns to master_vessel table
ALTER TABLE public.master_vessel 
ADD COLUMN company_code character varying(10),
ADD COLUMN branch_code text,
ADD COLUMN department_code text;

-- Add foreign key constraints for master_vessel
ALTER TABLE public.master_vessel 
ADD CONSTRAINT master_vessel_company_code_fkey 
FOREIGN KEY (company_code) REFERENCES public.companies(code) ON DELETE SET NULL;

ALTER TABLE public.master_vessel 
ADD CONSTRAINT master_vessel_branch_code_fkey 
FOREIGN KEY (branch_code) REFERENCES public.branches(code) ON DELETE SET NULL;

ALTER TABLE public.master_vessel 
ADD CONSTRAINT master_vessel_department_code_fkey 
FOREIGN KEY (department_code) REFERENCES public.departments(code) ON DELETE SET NULL;

-- Add company_code, branch_code, department_code columns to settings table
ALTER TABLE public.settings 
ADD COLUMN company_code character varying(10),
ADD COLUMN branch_code text,
ADD COLUMN department_code text;

-- Add foreign key constraints for settings
ALTER TABLE public.settings 
ADD CONSTRAINT settings_company_code_fkey 
FOREIGN KEY (company_code) REFERENCES public.companies(code) ON DELETE SET NULL;

ALTER TABLE public.settings 
ADD CONSTRAINT settings_branch_code_fkey 
FOREIGN KEY (branch_code) REFERENCES public.branches(code) ON DELETE SET NULL;

ALTER TABLE public.settings 
ADD CONSTRAINT settings_department_code_fkey 
FOREIGN KEY (department_code) REFERENCES public.departments(code) ON DELETE SET NULL;

-- Add company_code, branch_code, department_code columns to tariff table
ALTER TABLE public.tariff 
ADD COLUMN company_code character varying(10),
ADD COLUMN branch_code text,
ADD COLUMN department_code text;

-- Add foreign key constraints for tariff
ALTER TABLE public.tariff 
ADD CONSTRAINT tariff_company_code_fkey 
FOREIGN KEY (company_code) REFERENCES public.companies(code) ON DELETE SET NULL;

ALTER TABLE public.tariff 
ADD CONSTRAINT tariff_branch_code_fkey 
FOREIGN KEY (branch_code) REFERENCES public.branches(code) ON DELETE SET NULL;

ALTER TABLE public.tariff 
ADD CONSTRAINT tariff_department_code_fkey 
FOREIGN KEY (department_code) REFERENCES public.departments(code) ON DELETE SET NULL;

-- Add company_code, branch_code, department_code columns to users table
ALTER TABLE public.users 
ADD COLUMN company_code character varying(10),
ADD COLUMN branch_code text,
ADD COLUMN department_code text;

-- Add foreign key constraints for users
ALTER TABLE public.users 
ADD CONSTRAINT users_company_code_fkey 
FOREIGN KEY (company_code) REFERENCES public.companies(code) ON DELETE SET NULL;

ALTER TABLE public.users 
ADD CONSTRAINT users_branch_code_fkey 
FOREIGN KEY (branch_code) REFERENCES public.branches(code) ON DELETE SET NULL;

ALTER TABLE public.users 
ADD CONSTRAINT users_department_code_fkey 
FOREIGN KEY (department_code) REFERENCES public.departments(code) ON DELETE SET NULL;

-- Add company_code, branch_code, department_code columns to vendor table
ALTER TABLE public.vendor 
ADD COLUMN company_code character varying(10),
ADD COLUMN branch_code text,
ADD COLUMN department_code text;

-- Add foreign key constraints for vendor
ALTER TABLE public.vendor 
ADD CONSTRAINT vendor_company_code_fkey 
FOREIGN KEY (company_code) REFERENCES public.companies(code) ON DELETE SET NULL;

ALTER TABLE public.vendor 
ADD CONSTRAINT vendor_branch_code_fkey 
FOREIGN KEY (branch_code) REFERENCES public.branches(code) ON DELETE SET NULL;

ALTER TABLE public.vendor 
ADD CONSTRAINT vendor_department_code_fkey 
FOREIGN KEY (department_code) REFERENCES public.departments(code) ON DELETE SET NULL;

-- Create indexes for better query performance
CREATE INDEX idx_auth_logs_company_code ON public.auth_logs(company_code);
CREATE INDEX idx_auth_logs_branch_code ON public.auth_logs(branch_code);
CREATE INDEX idx_auth_logs_department_code ON public.auth_logs(department_code);

CREATE INDEX idx_container_code_company_code ON public.container_code(company_code);
CREATE INDEX idx_container_code_branch_code ON public.container_code(branch_code);
CREATE INDEX idx_container_code_department_code ON public.container_code(department_code);

CREATE INDEX idx_currency_code_company_code ON public.currency_code(company_code);
CREATE INDEX idx_currency_code_branch_code ON public.currency_code(branch_code);
CREATE INDEX idx_currency_code_department_code ON public.currency_code(department_code);

CREATE INDEX idx_customer_company_code ON public.customer(company_code);
CREATE INDEX idx_customer_branch_code ON public.customer(branch_code);
CREATE INDEX idx_customer_department_code ON public.customer(department_code);

CREATE INDEX idx_entity_documents_company_code ON public.entity_documents(company_code);
CREATE INDEX idx_entity_documents_branch_code ON public.entity_documents(branch_code);
CREATE INDEX idx_entity_documents_department_code ON public.entity_documents(department_code);

CREATE INDEX idx_gst_setup_company_code ON public.gst_setup(company_code);
CREATE INDEX idx_gst_setup_branch_code ON public.gst_setup(branch_code);
CREATE INDEX idx_gst_setup_department_code ON public.gst_setup(department_code);

CREATE INDEX idx_mapping_company_code ON public.mapping(company_code);
CREATE INDEX idx_mapping_branch_code ON public.mapping(branch_code);
CREATE INDEX idx_mapping_department_code ON public.mapping(department_code);

CREATE INDEX idx_master_code_company_code ON public.master_code(company_code);
CREATE INDEX idx_master_code_branch_code ON public.master_code(branch_code);
CREATE INDEX idx_master_code_department_code ON public.master_code(department_code);

CREATE INDEX idx_master_item_company_code ON public.master_item(company_code);
CREATE INDEX idx_master_item_branch_code ON public.master_item(branch_code);
CREATE INDEX idx_master_item_department_code ON public.master_item(department_code);

CREATE INDEX idx_master_location_company_code ON public.master_location(company_code);
CREATE INDEX idx_master_location_branch_code ON public.master_location(branch_code);
CREATE INDEX idx_master_location_department_code ON public.master_location(department_code);

CREATE INDEX idx_master_logs_company_code ON public.master_logs(company_code);
CREATE INDEX idx_master_logs_branch_code ON public.master_logs(branch_code);
CREATE INDEX idx_master_logs_department_code ON public.master_logs(department_code);

CREATE INDEX idx_master_type_company_code ON public.master_type(company_code);
CREATE INDEX idx_master_type_branch_code ON public.master_type(branch_code);
CREATE INDEX idx_master_type_department_code ON public.master_type(department_code);

CREATE INDEX idx_master_uom_company_code ON public.master_uom(company_code);
CREATE INDEX idx_master_uom_branch_code ON public.master_uom(branch_code);
CREATE INDEX idx_master_uom_department_code ON public.master_uom(department_code);

CREATE INDEX idx_master_vessel_company_code ON public.master_vessel(company_code);
CREATE INDEX idx_master_vessel_branch_code ON public.master_vessel(branch_code);
CREATE INDEX idx_master_vessel_department_code ON public.master_vessel(department_code);

CREATE INDEX idx_settings_company_code ON public.settings(company_code);
CREATE INDEX idx_settings_branch_code ON public.settings(branch_code);
CREATE INDEX idx_settings_department_code ON public.settings(department_code);

CREATE INDEX idx_tariff_company_code ON public.tariff(company_code);
CREATE INDEX idx_tariff_branch_code ON public.tariff(branch_code);
CREATE INDEX idx_tariff_department_code ON public.tariff(department_code);

CREATE INDEX idx_users_company_code ON public.users(company_code);
CREATE INDEX idx_users_branch_code ON public.users(branch_code);
CREATE INDEX idx_users_department_code ON public.users(department_code);

CREATE INDEX idx_vendor_company_code ON public.vendor(company_code);
CREATE INDEX idx_vendor_branch_code ON public.vendor(branch_code);
CREATE INDEX idx_vendor_department_code ON public.vendor(department_code);

-- Add comments to document the new columns
COMMENT ON COLUMN public.auth_logs.company_code IS 'Company code reference for multi-company support';
COMMENT ON COLUMN public.auth_logs.branch_code IS 'Branch code reference for multi-branch support';
COMMENT ON COLUMN public.auth_logs.department_code IS 'Department code reference for multi-department support';

COMMENT ON COLUMN public.container_code.company_code IS 'Company code reference for multi-company support';
COMMENT ON COLUMN public.container_code.branch_code IS 'Branch code reference for multi-branch support';
COMMENT ON COLUMN public.container_code.department_code IS 'Department code reference for multi-department support';

COMMENT ON COLUMN public.currency_code.company_code IS 'Company code reference for multi-company support';
COMMENT ON COLUMN public.currency_code.branch_code IS 'Branch code reference for multi-branch support';
COMMENT ON COLUMN public.currency_code.department_code IS 'Department code reference for multi-department support';

COMMENT ON COLUMN public.customer.company_code IS 'Company code reference for multi-company support';
COMMENT ON COLUMN public.customer.branch_code IS 'Branch code reference for multi-branch support';
COMMENT ON COLUMN public.customer.department_code IS 'Department code reference for multi-department support';

COMMENT ON COLUMN public.entity_documents.company_code IS 'Company code reference for multi-company support';
COMMENT ON COLUMN public.entity_documents.branch_code IS 'Branch code reference for multi-branch support';
COMMENT ON COLUMN public.entity_documents.department_code IS 'Department code reference for multi-department support';

COMMENT ON COLUMN public.gst_setup.company_code IS 'Company code reference for multi-company support';
COMMENT ON COLUMN public.gst_setup.branch_code IS 'Branch code reference for multi-branch support';
COMMENT ON COLUMN public.gst_setup.department_code IS 'Department code reference for multi-department support';

COMMENT ON COLUMN public.mapping.company_code IS 'Company code reference for multi-company support';
COMMENT ON COLUMN public.mapping.branch_code IS 'Branch code reference for multi-branch support';
COMMENT ON COLUMN public.mapping.department_code IS 'Department code reference for multi-department support';

COMMENT ON COLUMN public.master_code.company_code IS 'Company code reference for multi-company support';
COMMENT ON COLUMN public.master_code.branch_code IS 'Branch code reference for multi-branch support';
COMMENT ON COLUMN public.master_code.department_code IS 'Department code reference for multi-department support';

COMMENT ON COLUMN public.master_item.company_code IS 'Company code reference for multi-company support';
COMMENT ON COLUMN public.master_item.branch_code IS 'Branch code reference for multi-branch support';
COMMENT ON COLUMN public.master_item.department_code IS 'Department code reference for multi-department support';

COMMENT ON COLUMN public.master_location.company_code IS 'Company code reference for multi-company support';
COMMENT ON COLUMN public.master_location.branch_code IS 'Branch code reference for multi-branch support';
COMMENT ON COLUMN public.master_location.department_code IS 'Department code reference for multi-department support';

COMMENT ON COLUMN public.master_logs.company_code IS 'Company code reference for multi-company support';
COMMENT ON COLUMN public.master_logs.branch_code IS 'Branch code reference for multi-branch support';
COMMENT ON COLUMN public.master_logs.department_code IS 'Department code reference for multi-department support';

COMMENT ON COLUMN public.master_type.company_code IS 'Company code reference for multi-company support';
COMMENT ON COLUMN public.master_type.branch_code IS 'Branch code reference for multi-branch support';
COMMENT ON COLUMN public.master_type.department_code IS 'Department code reference for multi-department support';

COMMENT ON COLUMN public.master_uom.company_code IS 'Company code reference for multi-company support';
COMMENT ON COLUMN public.master_uom.branch_code IS 'Branch code reference for multi-branch support';
COMMENT ON COLUMN public.master_uom.department_code IS 'Department code reference for multi-department support';

COMMENT ON COLUMN public.master_vessel.company_code IS 'Company code reference for multi-company support';
COMMENT ON COLUMN public.master_vessel.branch_code IS 'Branch code reference for multi-branch support';
COMMENT ON COLUMN public.master_vessel.department_code IS 'Department code reference for multi-department support';

COMMENT ON COLUMN public.settings.company_code IS 'Company code reference for multi-company support';
COMMENT ON COLUMN public.settings.branch_code IS 'Branch code reference for multi-branch support';
COMMENT ON COLUMN public.settings.department_code IS 'Department code reference for multi-department support';

COMMENT ON COLUMN public.tariff.company_code IS 'Company code reference for multi-company support';
COMMENT ON COLUMN public.tariff.branch_code IS 'Branch code reference for multi-branch support';
COMMENT ON COLUMN public.tariff.department_code IS 'Department code reference for multi-department support';

COMMENT ON COLUMN public.users.company_code IS 'Company code reference for multi-company support';
COMMENT ON COLUMN public.users.branch_code IS 'Branch code reference for multi-branch support';
COMMENT ON COLUMN public.users.department_code IS 'Department code reference for multi-department support';

COMMENT ON COLUMN public.vendor.company_code IS 'Company code reference for multi-company support';
COMMENT ON COLUMN public.vendor.branch_code IS 'Branch code reference for multi-branch support';
COMMENT ON COLUMN public.vendor.department_code IS 'Department code reference for multi-department support'; 