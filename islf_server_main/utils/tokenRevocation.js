/**
 * Token Revocation Utility — Phase J
 *
 * Never stores raw tokens. Only SHA-256 hashes.
 *
 * API:
 *   ensureRevokedTokensTable()           → creates table if not exists
 *   revokeToken(rawToken, userId, pool)  → hashes + inserts into revoked_tokens
 *   isTokenRevoked(rawToken, pool)       → returns true if hash found in table
 *   hashToken(rawToken)                  → returns hex SHA-256 of token string
 */

'use strict';

const crypto = require('crypto');

// ---------------------------------------------------------------------------
// Blacklist cache (token_hash -> { revoked: boolean, ts: number })
// Avoids repeated DB hits for the same token on every request.
// TTL: 60 seconds
// ---------------------------------------------------------------------------
const blacklistCache = new Map();
const BLACKLIST_CACHE_TTL_MS = 60_000;

/**
 * Returns the SHA-256 hex digest of a raw JWT string.
 * @param {string} rawToken
 * @returns {string} hex string, 64 chars
 */
function hashToken(rawToken) {
  return crypto.createHash('sha256').update(rawToken).digest('hex');
}

/**
 * Ensures the revoked_tokens table exists.
 * Called once at server startup — idempotent.
 * @param {import('pg').Pool} pool
 */
async function ensureRevokedTokensTable(pool) {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS revoked_tokens (
      id          SERIAL PRIMARY KEY,
      token_hash  CHAR(64)     NOT NULL UNIQUE,
      user_id     INTEGER,
      revoked_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
      expires_at  TIMESTAMPTZ
    )
  `);
  // Index for fast lookup on every authenticated request
  await pool.query(`
    CREATE INDEX IF NOT EXISTS idx_revoked_tokens_hash ON revoked_tokens (token_hash)
  `);
  console.log('revoked_tokens table ensured');
}

/**
 * Revokes a token by hashing and inserting it into the blacklist.
 * @param {string}  rawToken   - Raw JWT string from Authorization header
 * @param {number}  userId     - req.user.userId
 * @param {Date|null} expiresAt - JWT exp claim as a Date (for auto-cleanup)
 * @param {import('pg').Pool} pool
 */
async function revokeToken(rawToken, userId, expiresAt, pool) {
  const hash = hashToken(rawToken);
  await pool.query(
    `INSERT INTO revoked_tokens (token_hash, user_id, expires_at)
     VALUES ($1, $2, $3)
     ON CONFLICT (token_hash) DO NOTHING`,
    [hash, userId || null, expiresAt || null]
  );
}

/**
 * Checks if a token has been revoked.
 * @param {string} rawToken
 * @param {import('pg').Pool} pool
 * @returns {Promise<boolean>}
 */
async function isTokenRevoked(rawToken, pool) {
  const hash = hashToken(rawToken);

  // Cache lookup
  const cached = blacklistCache.get(hash);
  if (cached && Date.now() - cached.ts < BLACKLIST_CACHE_TTL_MS) {
    return cached.revoked;
  }

  const result = await pool.query(
    `SELECT 1 FROM revoked_tokens WHERE token_hash = $1 LIMIT 1`,
    [hash]
  );
  const revoked = result.rows.length > 0;

  // Cache the result (even if not revoked, to avoid repeated DB hits for active tokens)
  blacklistCache.set(hash, { revoked, ts: Date.now() });

  return revoked;
}

/**
 * Force-evicts a token from the cache. Used on logout.
 */
function evictTokenCache(rawToken) {
  const hash = hashToken(rawToken);
  blacklistCache.delete(hash);
}

module.exports = { hashToken, ensureRevokedTokensTable, revokeToken, isTokenRevoked, evictTokenCache };
