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
const { PROTECTED_ROLES, ADMIN_BYPASS_ROLES } = require('../constants/roles');

// ---------------------------------------------------------------------------
// Simple in-process role cache (per-userId, TTL 60 seconds).
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
    return cached.role;
  }

  try {
    const result = await pool.query(
      'SELECT role FROM users WHERE id = $1 LIMIT 1',
      [userId]
    );
    const role = result.rows[0]?.role ?? null;
    roleCache.set(userId, { role, ts: Date.now() });
    return role;
  } catch (err) {
    console.error('[RBAC Enforcer] DB error resolving role for userId', userId, ':', err.message);
    return null;
  }
}

/**
 * Invalidate caches. Called on role/permission updates.
 */
function invalidateRoleCache(userId) {
  if (userId) roleCache.delete(userId);
  else roleCache.clear();
}

function invalidatePermissionCache(role) {
  if (role) {
    // Delete all entries for this role
    for (const key of permissionCache.keys()) {
      if (key.startsWith(`${role}:`)) {
        permissionCache.delete(key);
      }
    }
  } else {
    permissionCache.clear();
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
  // No role → deny immediately.
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
      return { allowed: false, found: false };
    }

    const permissions = result.rows[0];
    permissionCache.set(cacheKey, { permissions, ts: Date.now() });

    return { allowed: !!permissions[permFlag], found: true };
  } catch (err) {
    console.error('[RBAC Enforcer] DB error checking permission:', err.message);
    return { allowed: false, found: false }; // Phase D: fail closed
  }
}

// ---------------------------------------------------------------------------
// Normalize action strings (read -> can_read, etc.)
// ---------------------------------------------------------------------------
function normalizeAction(action) {
  if (!action) return null;
  const a = action.toLowerCase();
  if (a === 'read')   return 'can_read';
  if (a === 'write')  return 'can_write';
  if (a === 'delete') return 'can_delete';
  return action;
}

// ---------------------------------------------------------------------------
// Middleware factory
// ---------------------------------------------------------------------------
function requirePermission(moduleOrArray, subModuleName) {
  const requirements = Array.isArray(moduleOrArray) 
    ? moduleOrArray 
    : [{ module: moduleOrArray, subModule: subModuleName }];

  return async function rbacEnforce(req, res, next) {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const userId   = req.user.userId;
    const username = req.user.username || 'unknown';
    const rawRole  = req.user.role || await getRoleForUser(userId);
    const role     = rawRole ? rawRole.toUpperCase() : null; // Normalize for constant checks
    const method   = req.method.toUpperCase();
    const endpoint = (req.originalUrl || req.url || '').split('?')[0].substring(0, 500);

    // 1. SYSTEM_ADMIN bypasses everything
    if (role === PROTECTED_ROLES.SYSTEM_ADMIN) {
      console.log(`[RBAC Enforcer] user="${username}" role="${role}" endpoint="${endpoint}" → SYSTEM_ADMIN BYPASS ALLOW`);
      return next();
    }

    // 2. ADMIN bypasses everything EXCEPT IT Setup and Authorization
    if (role === PROTECTED_ROLES.ADMIN) {
      const isRestricted = requirements.some(r => 
        r.module === 'Settings' && (r.subModule === 'IT Setup' || r.subModule === 'Authorization')
      );
      if (isRestricted) {
        console.warn(`[RBAC Enforcer] user="${username}" role="${role}" endpoint="${endpoint}" → ADMIN RESTRICTED DENY (403)`);
        return res.status(403).json({ message: "Access denied: Only SYSTEM_ADMIN can access this module." });
      }
      console.log(`[RBAC Enforcer] user="${username}" role="${role}" endpoint="${endpoint}" → ADMIN BYPASS ALLOW`);
      return next();
    }

    // 3. Inheritance & Standard RBAC
    const isGet = method === 'GET';
    const checkList = isGet ? requirements : [requirements[0]];

    let lastDecision = { allowed: false, found: false };
    let matchingRequirement = null;

    for (const reqInfo of checkList) {
      const targetFlag = normalizeAction(reqInfo.action) || resolveRequiredFlag(method);
      const decision = await checkPermission(rawRole, reqInfo.module, reqInfo.subModule, targetFlag);
      
      if (decision.allowed) {
        lastDecision = decision;
        matchingRequirement = reqInfo;
        break;
      }
      // Update lastDecision with the latest failure info
      lastDecision = decision;
      matchingRequirement = reqInfo;
    }

    const { allowed, found } = lastDecision;
    const finalModule = matchingRequirement ? `${matchingRequirement.module}/${matchingRequirement.subModule}` : 'None';
    const finalAction = normalizeAction(matchingRequirement?.action) || resolveRequiredFlag(method);

    const logLine = `[RBAC Enforcer] user="${username}" role="${rawRole}" ` +
      `module="${finalModule}" action="${finalAction}" ` +
      `method="${method}" endpoint="${endpoint}" ` +
      `found=${found} allowed=${allowed}`;

    if (allowed) {
      console.log(logLine + ' → ALLOW');
      return next();
    }

    console.warn(logLine + ' → DENY (403)');
    return res.status(403).json({
      message: 'Access denied: you do not have permission to perform this action.',
      module: matchingRequirement?.module || requirements[0].module,
      sub_module: matchingRequirement?.subModule || requirements[0].subModule,
      required: finalAction,
    });
  };
}

module.exports = { 
  requirePermission, 
  invalidateRoleCache, 
  invalidatePermissionCache 
};
