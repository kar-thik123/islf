/**
 * OWNERSHIP GUARD MIDDLEWARE — Phase G
 *
 * PURPOSE
 * -------
 * Provides record-level ownership protection ON TOP of the existing RBAC layer.
 *
 * RBAC answers: "Can this role access this module?"
 * Ownership answers: "Can this user access THIS specific record?"
 *
 * ARCHITECTURE
 * ------------
 * This is a middleware FACTORY that accepts a configuration object:
 *
 *   requireOwnership({
 *     table,           // DB table to query for the record
 *     idParam,         // req.params key that holds the record id (default: 'id')
 *     ownerField,      // Column in table that stores owner (default: 'created_by')
 *     ownerType,       // 'username' | 'userId' — what the ownerField stores
 *     selfParam,       // For user-profile: bypass table lookup, compare req.params.id === req.user.userId
 *     adminBypass,     // If true (default), admin role always allowed (default: true)
 *   })
 *
 * BEHAVIOUR
 * ---------
 * 1. Admin role → allow immediately (adminBypass=true by default).
 * 2. Record not found → 404 (route handler would also return 404, consistent).
 * 3. Ownership field missing from record → LOG WARNING, allow through (fallback mode).
 * 4. Owner matches → allow.
 * 5. Owner mismatch → 403 Forbidden.
 *
 * ROLLBACK
 * --------
 * Remove the requireOwnership(...) argument from any app.use() call in main.js.
 * Restart server. No data change required.
 *
 * NOTE ON OWNER FIELD TYPE
 * ------------------------
 * Discovery confirmed: ALL tables store created_by as VARCHAR username string,
 * NOT as an integer user id. The comparison is therefore:
 *   record.created_by === req.user.username
 * For user self-access (GET/PUT /api/user/:id), we compare by userId directly.
 */

'use strict';

const pool = require('../db');

// Phase K1: centralized role constants (replaces hardcoded 'admin' checks)
const { ADMIN_BYPASS_ROLES } = require('../constants/roles');

/**
 * Middleware factory.
 * @param {Object} config
 * @param {string} config.table         - DB table name
 * @param {string} [config.idParam]     - req.params key for the record id (default: 'id')
 * @param {string} [config.ownerField]  - Column storing owner (default: 'created_by')
 * @param {string} [config.ownerType]   - 'username' (default) | 'userId'
 * @param {boolean}[config.selfOnly]    - If true, compare req.params[idParam] === req.user.userId
 *                                        Used for /api/user/:id — user can only read/edit themselves.
 * @param {boolean}[config.adminBypass] - Admin always allowed (default: true)
 */
function requireOwnership(config = {}) {
  const {
    table,
    idParam      = 'id',
    ownerField   = 'created_by',
    ownerType    = 'username',
    selfOnly     = false,
    adminBypass  = true,
  } = config;

  return async function ownershipGuard(req, res, next) {
    // Should never be reached without authentication (auth middleware runs first)
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const role     = req.user.role || null;
    const userId   = req.user.userId;
    const username = req.user.username;

    // Admin bypass — admin-tier roles can access any record
    // Phase K1: uses ADMIN_BYPASS_ROLES set instead of hardcoded 'admin' string.
    if (adminBypass && ADMIN_BYPASS_ROLES.has(role)) {
      return next();
    }

    const recordId = req.params[idParam];

    // ── Self-only mode (user profile): just compare IDs ──────────────────
    if (selfOnly) {
      if (String(recordId) === String(userId)) {
        return next();
      }
      console.warn(
        `[Ownership] DENY self-only: user=${username}(id=${userId}) ` +
        `attempted access to record id=${recordId}`
      );
      return res.status(403).json({
        message: 'Access denied: you may only access your own profile.',
      });
    }

    // ── No record id in URL (list routes) — allow through ────────────────
    // List-level filtering will be a Phase H concern.
    if (!recordId) {
      return next();
    }

    // ── DB lookup for ownership field ─────────────────────────────────────
    if (!table) {
      console.error('[Ownership] No table configured — passing through (fallback)');
      return next();
    }

    let record;
    try {
      const result = await pool.query(
        `SELECT ${ownerField} FROM ${table} WHERE id = $1 LIMIT 1`,
        [recordId]
      );
      record = result.rows[0];
    } catch (err) {
      // DB error — fail open with warning (Phase G safety; will be fail-closed in Phase H)
      console.error(
        `[Ownership] DB error fetching ${table}.${ownerField} for id=${recordId}: ${err.message}`
      );
      return next();
    }

    // Record not found
    if (!record) {
      return res.status(404).json({ message: 'Record not found' });
    }

    const ownerValue = record[ownerField];

    // Ownership field is NULL/empty — log warning, allow through (fallback mode)
    if (ownerValue === null || ownerValue === undefined || ownerValue === '') {
      console.warn(
        `[Ownership] WARNING: ${table}.${ownerField} is empty for id=${recordId}. ` +
        `Allowing through (fallback mode) — populate this field to enforce ownership.`
      );
      return next();
    }

    // Compare owner
    const requestorValue = ownerType === 'userId' ? String(userId) : username;
    const ownerStr       = String(ownerValue);

    if (ownerStr === requestorValue) {
      return next();
    }

    console.warn(
      `[Ownership] DENY: user=${username}(id=${userId}) attempted access to ` +
      `${table}(id=${recordId}) owned by "${ownerValue}"`
    );
    return res.status(403).json({
      message: 'Access denied: you do not have permission to access this record.',
    });
  };
}

module.exports = { requireOwnership };
