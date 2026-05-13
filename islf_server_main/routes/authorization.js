const express = require('express');
const pool = require('../db');
const router = express.Router();

// Initialize the role_module_permissions table
const initTable = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS role_module_permissions (
        id SERIAL PRIMARY KEY,
        role_name VARCHAR(255) NOT NULL,
        module_name VARCHAR(255) NOT NULL,
        sub_module_name VARCHAR(255) NOT NULL,
        can_read BOOLEAN DEFAULT false,
        can_write BOOLEAN DEFAULT false,
        can_delete BOOLEAN DEFAULT false,
        UNIQUE(role_name, module_name, sub_module_name)
      )
    `);
    console.log("role_module_permissions table ensured");
  } catch (err) {
    console.error("Error creating role_module_permissions table:", err);
  }
};

initTable();

// Get permissions for a specific role
router.get('/:roleName', async (req, res) => {
  const { roleName } = req.params;
  try {
    const result = await pool.query(
      "SELECT module_name, sub_module_name, can_read, can_write, can_delete FROM role_module_permissions WHERE role_name = $1 ORDER BY module_name ASC, sub_module_name ASC",
      [roleName]
    );
    res.json({ permissions: result.rows });
  } catch (err) {
    console.error("Error fetching role permissions:", err);
    res.status(500).json({ error: "Failed to fetch role permissions", details: err.message });
  }
});

// Update permissions for a specific role
router.post('/:roleName', async (req, res) => {
  const { roleName } = req.params;
  const { permissions } = req.body;

  if (!roleName || !Array.isArray(permissions)) {
    return res.status(400).json({ error: "Invalid request body" });
  }

  // Phase K4: Protect IT Setup permissions from non-SYSTEM_ADMIN users
  if (req.user.role !== 'SYSTEM_ADMIN') {
    const hasITSetup = permissions.some(p => p.module_name === 'Settings' && p.sub_module_name === 'IT Setup');
    if (hasITSetup) {
      return res.status(403).json({ message: "Access denied: Only SYSTEM_ADMIN can configure IT Setup." });
    }
  }

  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // We can either delete all and insert, or do an UPSERT (INSERT ... ON CONFLICT).
    // UPSERT is better.
    for (const perm of permissions) {
      await client.query(
        `INSERT INTO role_module_permissions (role_name, module_name, sub_module_name, can_read, can_write, can_delete)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (role_name, module_name, sub_module_name)
         DO UPDATE SET
           can_read = EXCLUDED.can_read,
           can_write = EXCLUDED.can_write,
           can_delete = EXCLUDED.can_delete`,
        [
          roleName,
          perm.module_name,
          perm.sub_module_name,
          !!perm.can_read,
          !!perm.can_write,
          !!perm.can_delete
        ]
      );
    }

    await client.query("COMMIT");
    
    // Phase R1: Invalidate the enforcer cache immediately after update
    const { invalidateRolePermissionCache } = require('../middleware/rbacEnforcer');
    invalidateRolePermissionCache(roleName);
    
    res.json({ success: true, message: "Permissions updated successfully" });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error updating role permissions:", err);
    res.status(500).json({ error: "Failed to update role permissions", details: err.message });
  } finally {
    client.release();
  }
});

module.exports = router;
