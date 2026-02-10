-- ============================================================================
-- REGISTER MISSING MODULES
-- Ensures all top-level API routes are registered to avoid FK violations
-- ============================================================================

INSERT INTO module_registry (module_name, module_group, display_name, description, sort_order) 
VALUES
-- Additional Auth/Public
('auth', 'Auth', 'Authentication API', 'Core authentication endpoints', 0),
('public', 'Auth', 'Public API', 'Publicly accessible endpoints', 99),

-- Additional Setup/Management
('user', 'Setup', 'User API', 'User management endpoints', 15),
('department', 'Setup', 'Department API', 'Department management endpoints', 17),
('branch', 'Setup', 'Branch API', 'Branch management endpoints', 18),
('settings', 'Setup', 'System Settings API', 'General system settings', 19),
('audit_logs', 'Setup', 'Audit Logs API', 'Audit log retrieval endpoints', 90),

-- Additional Masters
('account_details', 'Masters', 'Account Details', 'Bank and account information', 60),
('entity_documents', 'Masters', 'Entity Documents', 'Document management for entities', 61),
('incharge', 'Masters', 'Incharge Management', 'Assigning incharges to entities', 62),

-- Master Types Catch-all
('master_type', 'Master Types', 'Master Types API', 'Common master type management', 70),

-- Future Proofing
('general', 'Other', 'General Action', 'Generic system actions', 999)
ON CONFLICT (module_name) DO NOTHING;
