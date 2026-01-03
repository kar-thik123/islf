const pool = require('../db');

/**
 * Check if updates should include context fields
 */
async function shouldUpdateWithContext() {
  try {
    const result = await pool.query(
      'SELECT value FROM settings WHERE key = $1',
      ['validation_update_with_context']
    );
    return result.rows.length > 0 && result.rows[0].value === 'true';
  } catch (err) {
    console.error('❌ Error reading update_with_context setting:', err.message);
    return false; // Default to false on error
  }
}

/**
 * Convert camelCase → snake_case safely
 */
function toSnakeCase(str) {
  return str.replace(/([A-Z])/g, "_$1").toLowerCase();
}

/**
 * Build UPDATE query dynamically based on system settings
 */
async function buildUpdateQuery(tableName, data, whereClause, whereParams) {
  const updateWithContext = await shouldUpdateWithContext();

  const setClauses = [];
  const params = [];
  let paramIndex = 1;

  // ALWAYS include normal fields
  for (const [key, value] of Object.entries(data)) {
    if (!['companyCode', 'branchCode', 'departmentCode', 'serviceTypeCode'].includes(key)) {
      setClauses.push(`${toSnakeCase(key)} = $${paramIndex}`);
      params.push(value);
      paramIndex++;
    }
  }

  // INCLUDE CONTEXT FIELDS ONLY IF setting enabled
  if (updateWithContext) {
    if (data.companyCode !== undefined) {
      setClauses.push(`company_code = $${paramIndex}`);
      params.push(data.companyCode);
      paramIndex++;
    }
    if (data.branchCode !== undefined) {
      setClauses.push(`branch_code = $${paramIndex}`);
      params.push(data.branchCode);
      paramIndex++;
    }
    if (data.departmentCode !== undefined) {
      setClauses.push(`department_code = $${paramIndex}`);
      params.push(data.departmentCode);
      paramIndex++;
    }
    if (data.serviceTypeCode !== undefined) {
      setClauses.push(`service_type_code = $${paramIndex}`);
      params.push(data.serviceTypeCode);
      paramIndex++;
    }
  }

  // Add WHERE params after SET params
  for (const w of whereParams) {
    params.push(w);
  }

  const query = `
      UPDATE ${tableName}
      SET ${setClauses.join(', ')}
      WHERE ${whereClause}
      RETURNING *
  `;

  console.log("🔧 Generated UPDATE Query:", query);
  console.log("📦 Params:", params);

  return { query, params };
}

/**
 * Extract username from JWT (req.user)
 */
function getUsernameFromToken(req) {
  if (!req.user) {
    console.error("❌ Critical: No req.user found in protected context");
    return null;
  }

  console.log("👤 JWT Payload:", req.user);

  // Priority: username > name > email
  const username =
    req.user.username ||
    req.user.name ||
    req.user.email;

  if (!username) {
    console.error("❌ Critical: No username found in JWT payload", req.user);
    return null;
  }

  console.log("➡️ Extracted Username:", username);
  return username;
}

/**
 * Detect changed fields between old and new values
 */
function fieldChangeDetection({ fieldsToCheck, prevVal }) {
  if (typeof fieldsToCheck !== "object" || typeof prevVal !== "object") {
    throw new TypeError("fieldsToCheck and prevVal must be objects");
  }

  let changedFields = [];

  const normalize = (v) => {
    if (v === null || v === undefined) return "";
    return v.toString().trim();
  };

  for (const field of Object.keys(fieldsToCheck)) {
    const newVal = normalize(fieldsToCheck[field]);
    const oldVal = normalize(prevVal[field]);

    if (newVal !== oldVal) {
      changedFields.push(`Field '${field}' changed from '${oldVal}' to '${newVal}'`);
    }
  }

  return changedFields.length
    ? "Changes detected:\n" + changedFields.join("\n")
    : "No Changes Detected";
}

module.exports = {
  shouldUpdateWithContext,
  buildUpdateQuery,
  getUsernameFromToken,
  fieldChangeDetection
};
