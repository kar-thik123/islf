/**
 * PROTECTED ROLE CONSTANTS — Phase K5 (Cleanup)
 *
 * PURPOSE
 * -------
 * Single source of truth for protected role names used across the backend.
 * Eliminates scattered hardcoded 'admin' string comparisons.
 * Legacy admin compatibility has been completely removed.
 *
 * ROLLBACK
 * --------
 * 1. Restore Legacy admin to these sets.
 */

'use strict';

const PROTECTED_ROLES = Object.freeze({
  SYSTEM_ADMIN: 'SYSTEM_ADMIN',
  ADMIN: 'ADMIN'
});

/**
 * Roles that bypass ALL permission checks (ownership, record access, etc.).
 * Used by: ownershipGuard.js, auth.js /register route.
 */
const ADMIN_BYPASS_ROLES = new Set([
  PROTECTED_ROLES.SYSTEM_ADMIN,
  PROTECTED_ROLES.ADMIN
]);

/**
 * Roles that can access IT Setup (Settings > IT Setup).
 * ADMIN intentionally excluded — only SYSTEM_ADMIN controls infrastructure.
 */
const IT_SETUP_ROLES = new Set([
  PROTECTED_ROLES.SYSTEM_ADMIN
]);

module.exports = {
  PROTECTED_ROLES,
  ADMIN_BYPASS_ROLES,
  IT_SETUP_ROLES,
};
