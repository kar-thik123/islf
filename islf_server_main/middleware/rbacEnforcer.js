/**
 * RBAC ENFORCER MIDDLEWARE — Phase C (Controlled Enforcement)
 *
 * PURPOSE
 * -------
 * A middleware factory that enforces real permission checks and returns 403
 * when a user lacks the required permission. Applied selectively per route
 * group in main.js — NOT globally.
 *
 * USAGE (in main.js)
 * ------------------
 *   const { requirePermission } = require('./middleware/rbacEnforcer');
 *
 *   // Before (Phase A/B — no enforcement):
 *   app.use('/api/settings', settingsRouter);
 *
 *   // After (Phase C — enforced):
 *   app.use('/api/settings', requirePermission('Settings', 'IT Setup'), settingsRouter);
 *
 * ROLLBACK
 * --------
 * Remove the requirePermission(...) argument from the app.use() call.
 * The route continues to work identically to pre-Phase-C. One argument
 * removed per route. Restart server. Done.
 *
 * DESIGN RULES
 * ------------
 * - Does NOT modify req, res body format, or JWT
 * - Does NOT touch any route handler file
 * - Does NOT change any frontend behavior
 * - Reads role from req.user.role (JWT) if present, else DB fallback
 * - Returns 403 JSON with a consistent, frontend-safe message
 * - Logs every enforcement decision (allow and deny) for audit trail
 * - Never crashes the request pipeline on internal errors (fails OPEN
 *   during Phase C to preserve safety — this will be tightened in Phase D)
 *
 * FAIL BEHAVIOUR
 * --------------
 * Phase C: If the DB lookup itself fails (connection error etc.), the
 * request is ALLOWED through and the error is logged. This is intentional:
 * during controlled rollout we prefer a brief permission gap over a
 * production outage. Phase D will switch to fail-closed.
 */

'use strict';

const pool = require('../db');

// ---------------------------------------------------------------------------
// Simple in-process role cache (per-userId, TTL 60 seconds).
// Avoids a DB round-trip on every request for the same user.
// This is request-level caching only — no shared state between workers.
// ---------------------------------------------------------------------------
const roleCache = new Map();
const ROLE_CACHE_TTL_MS = 60_000;

// ---------------------------------------------------------------------------
// Permission cache (per role + module + action, TTL 60 seconds).
// ---------------------------------------------------------------------------
const permissionCache = new Map();
const PERM_CACHE_TTL_MS = 60_000;

async function getRoleForUser(userId) {
  const cached = roleCache.get(userId);
  if (cached && Date.now() - cached.ts < ROLE_CACHE_TTL_MS) {
    return cached.role; // may be null — that's valid (user has no role)
  }

  try {
    const result = await pool.query(
      'SELECT role FROM users WHERE id = $1 LIMIT 1',
      [userId]
    );
    // Explicitly null for unknown userId OR user with no role
    const role = result.rows[0]?.role ?? null;
    roleCache.set(userId, { role, ts: Date.now() });
    return role;
  } catch (err) {
    console.error('[RBAC Enforcer] DB error resolving role for userId', userId, ':', err.message);
    return null;
  }
}

// ---------------------------------------------------------------------------
// HTTP method → permission flag mapping
// ---------------------------------------------------------------------------
function resolveRequiredFlag(method) {
  switch (method.toUpperCase()) {
    case 'GET':    return 'can_read';
    case 'POST':
    case 'PUT':
    case 'PATCH':  return 'can_write';
    case 'DELETE': return 'can_delete';
    default:       return 'can_read';
  }
}

// ---------------------------------------------------------------------------
// Check permission in role_module_permissions table.
// Returns { allowed: boolean, found: boolean }
// ---------------------------------------------------------------------------
async function checkPermission(role, moduleName, subModuleName, permFlag) {
  // No role → deny immediately. This is not a transient error; it's a data integrity issue.
  if (!role || role.trim() === '') {
    return { allowed: false, found: false };
  }

  // Cache lookup
  const cacheKey = `${role}:${moduleName}:${subModuleName}`;
  const cached = permissionCache.get(cacheKey);
  if (cached && Date.now() - cached.ts < PERM_CACHE_TTL_MS) {
    return { allowed: !!cached.permissions[permFlag], found: true };
  }

  try {
    const result = await pool.query(
      `SELECT can_read, can_write, can_delete
       FROM role_module_permissions
       WHERE role_name = $1
         AND module_name = $2
         AND sub_module_name = $3
       LIMIT 1`,
      [role, moduleName, subModuleName]
    );

    if (result.rows.length === 0) {
      // Role exists but has no permission row for this module — deny.
      return { allowed: false, found: false };
    }

    const permissions = result.rows[0];
    permissionCache.set(cacheKey, { permissions, ts: Date.now() });

    return { allowed: !!permissions[permFlag], found: true };
  } catch (err) {
    console.error('[RBAC Enforcer] DB error checking permission:', err.message);
    // Phase C: fail open ONLY on transient DB errors (role IS known but lookup failed).
    // Phase D will change this to fail-closed.
    return { allowed: true, found: false };
  }
}

// ---------------------------------------------------------------------------
// Middleware factory
// Call once per route group: requirePermission(moduleName, subModuleName)
// ---------------------------------------------------------------------------
function requirePermission(moduleName, subModuleName) {
  return async function rbacEnforce(req, res, next) {
    // Should never happen (authenticateToken runs before this), but be safe
    if (!req.user) {
      console.warn('[RBAC Enforcer] req.user missing — authenticateToken may not have run');
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userId   = req.user.userId;
    const username = req.user.username || 'unknown';

    // Resolve role: from JWT if present, else DB
    const role = req.user.role || await getRoleForUser(userId);

    const permFlag = resolveRequiredFlag(req.method);
    const endpoint = (req.originalUrl || req.url || '').split('?')[0].substring(0, 500);

    const { allowed, found } = await checkPermission(role, moduleName, subModuleName, permFlag);

    // Structured enforcement log (grep-friendly)
    const logLine = `[RBAC Enforcer] user="${username}" role="${role}" ` +
      `module="${moduleName}/${subModuleName}" ` +
      `action="${permFlag}" endpoint="${endpoint}" ` +
      `found=${found} allowed=${allowed}`;

    if (allowed) {
      console.log(logLine + ' → ALLOW');
      return next();
    }

    console.warn(logLine + ' → DENY (403)');
    return res.status(403).json({
      message: 'Access denied: you do not have permission to perform this action.',
      module: moduleName,
      sub_module: subModuleName,
      required: permFlag,
    });
  };
}

function invalidateRolePermissionCache(roleName) {
  for (const key of permissionCache.keys()) {
    if (key.startsWith(`${roleName}:`)) {
      permissionCache.delete(key);
    }
  }
}

module.exports = { requirePermission, invalidateRolePermissionCache };
