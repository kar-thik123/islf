'use strict';
/**
 * Phase J — Cleanup Revoked Tokens
 * Deletes revoked_tokens rows where expires_at is in the past.
 * Safe to run as a cron job: node scripts/cleanup_revoked_tokens.js
 */
require('dotenv').config();
const pool = require('../db');

async function run() {
  console.log('\n========== REVOKED TOKEN CLEANUP ==========\n');
  const now = new Date().toISOString();

  try {
    // Delete expired revocations (token can no longer be used anyway — JWT itself is expired)
    const result = await pool.query(
      `DELETE FROM revoked_tokens
       WHERE expires_at IS NOT NULL AND expires_at < NOW()
       RETURNING id, user_id, token_hash, expires_at`
    );

    console.log(`✅ Deleted ${result.rows.length} expired token revocation(s).`);
    if (result.rows.length > 0) {
      result.rows.forEach(r =>
        console.log(`   id=${r.id} | user_id=${r.user_id} | expired=${r.expires_at}`)
      );
    }

    // Report remaining active revocations
    const remaining = await pool.query(
      'SELECT COUNT(*) FROM revoked_tokens'
    );
    console.log(`\nActive revoked tokens in table: ${remaining.rows[0].count}`);

    // Report tokens with no expiry (permanent revocations — issued without exp claim)
    const noExpiry = await pool.query(
      'SELECT COUNT(*) FROM revoked_tokens WHERE expires_at IS NULL'
    );
    if (parseInt(noExpiry.rows[0].count) > 0) {
      console.log(`⚠️  ${noExpiry.rows[0].count} token(s) have no expiry set — manual review recommended.`);
    }

  } catch (err) {
    if (err.code === '42P01') {
      console.log('⚠️  revoked_tokens table does not exist — no cleanup needed (run server first to create it).');
    } else {
      console.error('Cleanup error:', err.message);
      process.exit(1);
    }
  } finally {
    await pool.end();
  }

  console.log('\nDone.');
}

run();
