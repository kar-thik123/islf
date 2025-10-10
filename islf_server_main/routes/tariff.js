const express = require("express");
const pool = require("../db");
const router = express.Router();
const { logMasterEvent } = require("../log");
const { getUsernameFromToken } = require("../utils/context-helper");

// 🔹 Enforce hierarchy: company → branch → department
function enforceHierarchy(companyCode, branchCode, departmentCode) {
  if (!companyCode && (branchCode || departmentCode)) {
    throw new Error("Branch/Department cannot be used without Company.");
  }
  if (!branchCode && departmentCode) {
    throw new Error("Department cannot be used without Branch.");
  }
}

// 🔹 Build WHERE clause dynamically
function buildWhereClause(filters) {
  const conditions = [];
  const values = [];
  let index = 1;

  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== null && value !== "") {
      conditions.push(`${key} = $${index}`);
      values.push(value);
      index++;
    }
  }

  return {
    clause: conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "",
    values,
  };
}

// GET all tariffs
router.get("/", async (req, res) => {
  try {
    const { companyCode, branchCode, departmentCode } = req.query;
    enforceHierarchy(companyCode, branchCode, departmentCode);

    const filters = {
      company_code: companyCode,
      branch_code: branchCode,
      department_code: departmentCode,
    };
    console.log("tariff Filter:", filters);
    const { clause, values } = buildWhereClause(filters);

    const query = `
      SELECT *
      FROM tariff
      ${clause}
      ORDER BY id ASC
    `;

    console.log("tariff query:", query, "tariff Value", values);
    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching tariffs:", err);
    res.status(400).json({ error: err.message || "Failed to fetch tariffs" });
  }
});

// CREATE new tariff
router.post("/", async (req, res) => {
  const data = req.body;

  // 🔹 Convert empty strings → null
  const cleanData = Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, v === "" ? null : v])
  );

  try {
    enforceHierarchy(
      cleanData.company_code,
      cleanData.branch_code,
      cleanData.department_code
    );

    // 🔹 Duplicate check
    const duplicateCheckQuery = `
      SELECT id, code FROM tariff 
      WHERE mode = $1 
        AND (shipping_type = $2 OR (shipping_type IS NULL AND $2 IS NULL))
        AND (cargo_type = $3 OR (cargo_type IS NULL AND $3 IS NULL))
        AND (tariff_type = $4 OR (tariff_type IS NULL AND $4 IS NULL))
        AND (basis = $5 OR (basis IS NULL AND $5 IS NULL))
        AND (container_type = $6 OR (container_type IS NULL AND $6 IS NULL))
        AND (item_name = $7 OR (item_name IS NULL AND $7 IS NULL))
        AND (currency = $8 OR (currency IS NULL AND $8 IS NULL))
        AND (location_type_from = $9 OR (location_type_from IS NULL AND $9 IS NULL))
        AND (from_location = $10 OR (from_location IS NULL AND $10 IS NULL))
        AND (location_type_to = $11 OR (location_type_to IS NULL AND $11 IS NULL))
        AND (to_location = $12 OR (to_location IS NULL AND $12 IS NULL))
        AND (vendor_type = $13 OR (vendor_type IS NULL AND $13 IS NULL))
        AND (vendor_name = $14 OR (vendor_name IS NULL AND $14 IS NULL))
        AND (effective_date = $15 OR (effective_date IS NULL AND $15 IS NULL))
        AND (period_start_date = $16 OR (period_start_date IS NULL AND $16 IS NULL))
        AND (period_end_date = $17 OR (period_end_date IS NULL AND $17 IS NULL))
        AND (charges = $18 OR (charges IS NULL AND $18 IS NULL))
        AND (freight_charge_type = $19 OR (freight_charge_type IS NULL AND $19 IS NULL))
        AND (is_mandatory = $20 OR (is_mandatory IS NULL AND $20 IS NULL))
        AND company_code = $21
        AND (branch_code = $22 OR (branch_code IS NULL AND $22 IS NULL))
        AND (department_code = $23 OR (department_code IS NULL AND $23 IS NULL))
        AND (service_area = $24 OR (service_area IS NULL AND $24 IS NULL))
        AND (source_sales_code = $25 OR (source_sales_code IS NULL AND $25 IS NULL))
      LIMIT 1
    `;

    const duplicateResult = await pool.query(duplicateCheckQuery, [
      cleanData.mode, cleanData.shippingType, cleanData.cargoType, cleanData.tariffType, cleanData.basis,
      cleanData.containerType, cleanData.itemName, cleanData.currency, cleanData.locationTypeFrom, cleanData.from,
      cleanData.locationTypeTo, cleanData.to, cleanData.vendorType, cleanData.vendorName, cleanData.effectiveDate,
      cleanData.periodStartDate, cleanData.periodEndDate, cleanData.charges, cleanData.freightChargeType,
      cleanData.isMandatory || false, cleanData.company_code, cleanData.branch_code, cleanData.department_code, cleanData.serviceArea, cleanData.sourceSalesCode
    ]);

    if (duplicateResult.rows.length > 0) {
      return res.status(400).json({
        error: "Duplicate tariff found",
        message: `A tariff with the same combination of fields already exists (Code: ${duplicateResult.rows[0].code})`,
        duplicateCode: duplicateResult.rows[0].code,
      });
    }
    console.log("DEBUG: req body,", cleanData);
    let code = cleanData.code;
    let seriesCode;

    // 🔹 Number series lookup
    if ((!code || code === "") && cleanData.company_code) {
      let whereConditions = ["code_type = $1", "company_code = $2"];
      let queryParams = ["tariffCode", cleanData.company_code];
      let paramIndex = 3;

      if (cleanData.branch_code) {
        whereConditions.push(`branch_code = $${paramIndex}`);
        queryParams.push(cleanData.branch_code);
        paramIndex++;
      } else {
        whereConditions.push("(branch_code IS NULL OR branch_code = '')");
      }

      if (cleanData.department_code) {
        whereConditions.push(`department_code = $${paramIndex}`);
        queryParams.push(cleanData.department_code);
      } else {
        whereConditions.push(
          "(department_code IS NULL OR department_code = '')"
        );
      }

      const mappingQuery = `
        SELECT mapping FROM mapping_relations
        WHERE ${whereConditions.join(" AND ")}
        ORDER BY id DESC
        LIMIT 1
      `;

      const mappingRes = await pool.query(mappingQuery, queryParams);
      if (mappingRes.rows.length > 0) {
        seriesCode = mappingRes.rows[0].mapping;
        console.log("DEBUG: Series Code,", seriesCode);
      }
    }

    // 🔹 Generate tariff code
    if (seriesCode) {
      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        const seriesResult = await client.query(
          "SELECT * FROM number_series WHERE code = $1 ORDER BY id DESC LIMIT 1",
          [seriesCode]
        );

        if (seriesResult.rows.length === 0) {
          await client.query("ROLLBACK");
          client.release();
          return res.status(400).json({ error: "Number series not found" });
        }

        const series = seriesResult.rows[0];
        if (series.is_manual) {
          if (!code || code.trim() === "") {
            await client.query("ROLLBACK");
            client.release();
            return res
              .status(400)
              .json({ error: "Manual code entry required for this series" });
          }
          const exists = await client.query(
            "SELECT 1 FROM tariff WHERE code = $1",
            [code]
          );
          if (exists.rows.length > 0) {
            await client.query("ROLLBACK");
            client.release();
            return res
              .status(400)
              .json({ error: "Tariff code already exists" });
          }
        } else {
          const relResult = await client.query(
            "SELECT * FROM number_relation WHERE number_series = $1 ORDER BY id DESC LIMIT 1 FOR UPDATE",
            [seriesCode]
          );

          if (relResult.rows.length === 0) {
            await client.query("ROLLBACK");
            client.release();
            return res
              .status(400)
              .json({ error: "Number series relation not found" });
          }

          const rel = relResult.rows[0];
          let nextNo =
            rel.last_no_used === 0
              ? Number(rel.starting_no)
              : Number(rel.last_no_used) + Number(rel.increment_by);

          code = `${rel.prefix || ""}${nextNo}`;
          console.log("Debug Code value if is not manual,", code);
          await client.query(
            "UPDATE number_relation SET last_no_used = $1 WHERE id = $2",
            [nextNo, rel.id]
          );
        }

        await client.query("COMMIT");
        client.release();
      } catch (error) {
        await client.query("ROLLBACK");
        client.release();
        throw error;
      }
    } else if (!code || code === "") {
      code = "TAR-" + Date.now();
    }

    // 🔹 Insert new tariff
    const created_by = getUsernameFromToken(req);
    const result = await pool.query(
      `INSERT INTO tariff (
        code, mode, shipping_type, cargo_type, tariff_type, basis, container_type, item_name, currency,
        location_type_from, location_type_to, from_location, to_location, vendor_type, vendor_name, 
        charges, freight_charge_type, effective_date, period_start_date, period_end_date, is_mandatory,
        company_code, branch_code, department_code, service_area, source_sales_code, created_by
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27
      ) RETURNING *`,
      [
        code, cleanData.mode, cleanData.shippingType, cleanData.cargoType, cleanData.tariffType,
        cleanData.basis, cleanData.containerType, cleanData.itemName, cleanData.currency,
        cleanData.locationTypeFrom, cleanData.locationTypeTo, cleanData.from, cleanData.to,
        cleanData.vendorType, cleanData.vendorName, cleanData.charges, cleanData.freightChargeType,
        cleanData.effectiveDate, cleanData.periodStartDate, cleanData.periodEndDate,
        cleanData.isMandatory || false, cleanData.company_code, cleanData.branch_code, cleanData.department_code, cleanData.serviceArea, cleanData.sourceSalesCode, created_by
      ]
    );

    await logMasterEvent({
      username: getUsernameFromToken(req),
      action: "CREATE",
      masterType: "Tariff",
      recordId: code,
      details: `New Tariff "${code}" has been created successfully.`,
    });

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Error creating tariff:", err);
    res.status(400).json({ error: err.message || "Failed to create tariff" });
  }
});

// UPDATE tariff by ID
router.put("/:id", async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id)) {
    return res.status(400).json({ error: "Invalid ID format" });
  }

  const data = req.body;
  const cleanData = Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, v === "" ? null : v])
  );

  try {
    const oldResult = await pool.query("SELECT * FROM tariff WHERE id = $1", [
      id,
    ]);
    if (oldResult.rows.length === 0)
      return res.status(404).json({ error: "Not found" });
    const oldTariff = oldResult.rows[0];

    const result = await pool.query(
      `UPDATE tariff SET
        code = $1, mode = $2, shipping_type = $3, cargo_type = $4, tariff_type = $5, basis = $6, container_type = $7, item_name = $8, currency = $9,
        location_type_from = $10, location_type_to = $11, from_location = $12, to_location = $13, vendor_type = $14, vendor_name = $15, charges = $16, freight_charge_type = $17, effective_date = $18, period_start_date = $19, period_end_date = $20, is_mandatory = $21,
        service_area = $22, source_sales_code = $23,
        WHERE id = $24 RETURNING *`,
      [
        cleanData.code,
        cleanData.mode,
        cleanData.shippingType,
        cleanData.cargoType,
        cleanData.tariffType,
        cleanData.basis,
        cleanData.containerType,
        cleanData.itemName,
        cleanData.currency,
        cleanData.locationTypeFrom,
        cleanData.locationTypeTo,
        cleanData.from,
        cleanData.to,
        cleanData.vendorType,
        cleanData.vendorName,
        cleanData.charges,
        cleanData.freightChargeType,
        cleanData.effectiveDate,
        cleanData.periodStartDate,
        cleanData.periodEndDate,
        cleanData.isMandatory || false,
        cleanData.serviceArea, cleanData.sourceSalesCode, 
        id,
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Tariff not found" });
    }

    const changedFields = [];
    const fieldMap = {
      code: { newVal: cleanData.code, db: 'code' },
      mode: { newVal: cleanData.mode, db: 'mode' },
      shipping_type: { newVal: cleanData.shippingType, db: 'shipping_type' },
      cargo_type: { newVal: cleanData.cargoType, db: 'cargo_type' },
      tariff_type: { newVal: cleanData.tariffType, db: 'tariff_type' },
      basis: { newVal: cleanData.basis, db: 'basis' },
      container_type: { newVal: cleanData.containerType, db: 'container_type' },
      item_name: { newVal: cleanData.itemName, db: 'item_name' },
      currency: { newVal: cleanData.currency, db: 'currency' },
      location_type_from: { newVal: cleanData.locationTypeFrom, db: 'location_type_from' },
      location_type_to: { newVal: cleanData.locationTypeTo, db: 'location_type_to' },
      from_location: { newVal: cleanData.from, db: 'from_location' },
      to_location: { newVal: cleanData.to, db: 'to_location' },
      vendor_type: { newVal: cleanData.vendorType, db: 'vendor_type' },
      vendor_name: { newVal: cleanData.vendorName, db: 'vendor_name' },
      charges: { newVal: cleanData.charges, db: 'charges' },
      freight_charge_type: { newVal: cleanData.freightChargeType, db: 'freight_charge_type' },
      effective_date: { newVal: cleanData.effectiveDate, db: 'effective_date' },
      period_start_date: { newVal: cleanData.periodStartDate, db: 'period_start_date' },
      period_end_date: { newVal: cleanData.periodEndDate, db: 'period_end_date' },
      is_mandatory: { newVal: cleanData.isMandatory || false, db: 'is_mandatory' },
      service_area: { newVal: cleanData.serviceArea, db: 'service_area' },
      source_sales_code: { newVal: cleanData.sourceSalesCode, db: 'source_sales_code' }
    };

    const normalize = (value) => {
      if (value === null || value === undefined) return "";
      if (value instanceof Date) return value.toISOString();
      if (typeof value === "number")
        return Number.isNaN(value) ? "" : String(value);
      return String(value).trim();
    };

    for (const label in fieldMap) {
      const mapping = fieldMap[label];
      const newValue = normalize(mapping.newVal);
      const oldValue = normalize(oldTariff[mapping.db]);
      if (newValue !== oldValue) {
        changedFields.push(
          `Field "${label}" changed from "${oldValue}" to "${newValue}".`
        );
      }
    }

    const details =
      changedFields.length > 0
        ? `Changes detected:\n` + changedFields.join("\n")
        : "No actual changes detected.";

    await logMasterEvent({
      username: getUsernameFromToken(req),
      action: "UPDATE",
      masterType: "Tariff",
      recordId: cleanData.code,
      details,
    });

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Error updating tariff:", err);
    res.status(500).json({ error: "Failed to update tariff" });
  }
});

module.exports = router;
