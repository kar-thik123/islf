/**
 * PROTECTED ROLE CONSTANTS — Phase K5 (Cleanup)
 *
 * Frontend counterpart of islf_server_main/constants/roles.js.
 * Used by PermissionService to determine admin bypass.
 * Legacy admin compatibility has been completely removed.
 *
 * ROLLBACK: Restore Legacy admin backward compatibilities.
 */

export const PROTECTED_ROLES = Object.freeze({
  SYSTEM_ADMIN: 'SYSTEM_ADMIN',
  ADMIN: 'ADMIN'
});

/**
 * Roles that bypass ALL permission checks in the frontend.
 * Case-insensitive comparison is used when checking against this set.
 */
export const ADMIN_BYPASS_ROLES: ReadonlySet<string> = new Set([
  PROTECTED_ROLES.SYSTEM_ADMIN,
  PROTECTED_ROLES.ADMIN
]);

/**
 * Helper: checks if a role string is an admin-bypass role.
 * Handles null/undefined and performs case-insensitive comparison.
 */
export function isAdminBypassRole(role: string | null | undefined): boolean {
  if (!role) return false;
  const normalized = role.trim().toUpperCase();
  // Check against uppercase versions since the set has mixed case
  return normalized === PROTECTED_ROLES.SYSTEM_ADMIN
    || normalized === PROTECTED_ROLES.ADMIN;
}
