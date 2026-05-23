const express = require("express");
const pool = require("../db");
const router = express.Router();
const { getUsernameFromToken } = require("../utils/context-helper");

// Get all master types
router.get("/", async (req, res) => {
  try {
    const { companyCode, branchCode, departmentCode } = req.query;

    let query = `
      SELECT *
      FROM master_type
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    // Hierarchical filtering (with NULL fallbacks for global types)
    if (companyCode) {
      query += ` AND (company_code = $${paramIndex} OR company_code IS NULL)`;
      params.push(companyCode);
      paramIndex++;

      if (branchCode) {
        query += ` AND (branch_code = $${paramIndex} OR branch_code IS NULL)`;
        params.push(branchCode);
        paramIndex++;

        if (departmentCode) {
          query += ` AND (department_code = $${paramIndex} OR department_code IS NULL)`;
          params.push(departmentCode);
          paramIndex++;
        }
      }
    }

    query += ` ORDER BY key ASC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching master types:", err);
    res.status(500).json({ error: "Failed to fetch master types" });
  }
});

// Get master type by id
router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM master_type WHERE id = $1", [
      req.params.id,
    ]);
    if (result.rows.length === 0)
      return res.status(404).json({ error: "Not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch master type" });
  }
});

// Get master types by type
router.get("/type/:type", async (req, res) => {
  const masterType = req.params.type;
  const { companyCode, branchCode, departmentCode } = req.query;

  try {
    if (!masterType) {
      return res.status(400).json({ error: "Master type is required" });
    }
    let masterTypeUpper = masterType.toUpperCase();

    let query = `
      SELECT *
      FROM master_type
      WHERE 1=1
    `;

    const params = [];
    let paramIndex = 1;

    // Hierarchical filtering
    if (companyCode) {
      query += ` AND ( company_code = $${paramIndex} OR company_code IS NULL )`;
      params.push(companyCode);
      paramIndex++;

      if (branchCode) {
        query += ` AND ( branch_code = $${paramIndex} OR branch_code IS NULL )`;
        params.push(branchCode);
        paramIndex++;

        if (departmentCode) {
          query += ` AND (department_code = $${paramIndex} OR department_code IS NULL )`;;
          params.push(departmentCode);
          paramIndex++;
        }
      }
    }

    // adding the master type key search logic
    query += `  AND key = $${paramIndex}`;
    params.push(masterTypeUpper);
    paramIndex++;

    query += ` ORDER BY id DESC`;
    console.log("Executing query: ", query, " with params: ", params);
    const { rows: result } = await pool.query(query, params);
    // if (result.length === 0) {
    //   return res
    //     .status(404)
    //     .json({ error: "No master types found for the specified type" });
    // }
    res.json(result);
  } catch (err) {
    console.error("Error fetching master types ", err);
    res
      .status(500)
      .json({ error: "Failed to fetch master types", msg: err.message });
  }
});

// Create master type
router.post("/", async (req, res) => {
  const {
    key,
    value,
    description,
    status,
    company_code,
    branch_code,
    department_code,
  } = req.body;

  try {
    const created_by = getUsernameFromToken(req);
    const result = await pool.query(
      "INSERT INTO master_type (key, value, description, status,company_code,branch_code,department_code,created_by) VALUES ($1, $2, $3, $4,$5,$6,$7,$8) RETURNING *",
      [
        key,
        value,
        description,
        status,
        company_code,
        branch_code,
        department_code,
        created_by,
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: "Failed to create master type" });
  }
});

// Update master type
router.put("/:id", async (req, res) => {
  const { value, description, status } = req.body;
  try {
    const oldResult = await pool.query(
      "SELECT * FROM master_type WHERE id = $1",
      [req.params.id]
    );
    if (oldResult.rows.length === 0)
      return res.status(404).json({ error: "Not found" });
    const id = oldResult.rows[0].id;
    const result = await pool.query(
      "UPDATE master_type SET value = $1, description = $2, status = $3 WHERE id = $4 RETURNING *",
      [value, description, status, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update master type" });
  }
});
// Delete master type
router.delete("/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM master_type WHERE id = $1 RETURNING *",
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Master type not found" });
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Error deleting master type:", err);
    res.status(500).json({ error: "Failed to delete master type" });
  }
});

module.exports = router;
