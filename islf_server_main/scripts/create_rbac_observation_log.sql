-- =============================================================================
-- RBAC OBSERVATION LOG — Phase A Migration Table
-- =============================================================================
-- Purpose : Records what RBAC enforcement WOULD have done for every request,
--           without actually blocking anything. Used to validate permissions
--           before Phase C enforcement is enabled.
--
-- Run once against the database:
--   psql -h <host> -U <user> -d <dbname> -f create_rbac_observation_log.sql
--
-- Safe to run multiple times (uses IF NOT EXISTS).
-- =============================================================================

CREATE TABLE IF NOT EXISTS rbac_observation_log (
    id               SERIAL PRIMARY KEY,
    created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    username         VARCHAR(255),
    user_id          INTEGER,
    user_role        VARCHAR(255),
    module_name      VARCHAR(255),
    sub_module_name  VARCHAR(255),
    action_type      VARCHAR(20),      -- READ | WRITE | DELETE | UNKNOWN
    permission_exists BOOLEAN,         -- row found in role_module_permissions?
    would_deny       BOOLEAN,          -- true if the action would have been blocked
    endpoint         VARCHAR(500)      -- full request path e.g. /api/customer/123
);

-- Indexes for efficient querying of observation reports
CREATE INDEX IF NOT EXISTS idx_rbac_obs_created_at
    ON rbac_observation_log (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_rbac_obs_would_deny
    ON rbac_observation_log (would_deny)
    WHERE would_deny = TRUE;

CREATE INDEX IF NOT EXISTS idx_rbac_obs_username
    ON rbac_observation_log (username);

CREATE INDEX IF NOT EXISTS idx_rbac_obs_role
    ON rbac_observation_log (user_role);

-- Helpful view for quick analysis during Phase A / Phase B review
CREATE OR REPLACE VIEW rbac_observation_summary AS
SELECT
    user_role,
    module_name,
    sub_module_name,
    action_type,
    COUNT(*)                                          AS total_requests,
    SUM(CASE WHEN would_deny THEN 1 ELSE 0 END)       AS would_have_denied,
    SUM(CASE WHEN NOT permission_exists THEN 1 ELSE 0 END) AS no_permission_row,
    MIN(created_at)                                   AS first_seen,
    MAX(created_at)                                   AS last_seen
FROM rbac_observation_log
GROUP BY user_role, module_name, sub_module_name, action_type
ORDER BY would_have_denied DESC, total_requests DESC;
