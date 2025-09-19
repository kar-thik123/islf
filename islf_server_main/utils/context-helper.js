const pool = require('../db');

/**
 * Get the update with context setting from configuration
 */
async function shouldUpdateWithContext() {
  try {
    const result = await pool.query('SELECT value FROM settings WHERE key = $1', ['validation_update_with_context']);
    return result.rows.length > 0 && result.rows[0].value === 'true';
  } catch (err) {
    console.error('Error checking update with context setting:', err);
    return false; // Default to false if error
  }
}

/**
 * Build dynamic UPDATE query based on context setting
 * @param {string} tableName - The table to update
 * @param {object} data - The data to update
 * @param {string} whereClause - The WHERE clause (e.g., 'id = $X')
 * @param {array} whereParams - Parameters for the WHERE clause
 * @returns {object} - { query, params }
 */
async function buildUpdateQuery(tableName, data, whereClause, whereParams) {
  const updateWithContext = await shouldUpdateWithContext();
  
  const setClauses = [];
  const params = [];
  let paramIndex = 1;
  
  // Always include non-context fields
  for (const [key, value] of Object.entries(data)) {
    if (!['companyCode', 'branchCode', 'departmentCode', 'serviceTypeCode'].includes(key)) {
      setClauses.push(`${key.replace(/([A-Z])/g, '_$1').toLowerCase()} = $${paramIndex}`);
      params.push(value);
      paramIndex++;
    }
  }
  
  // Include context fields only if setting is enabled
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
  
  // Add WHERE clause parameters
  whereParams.forEach(param => {
    params.push(param);
  });
  
  const query = `UPDATE ${tableName} SET ${setClauses.join(', ')} WHERE ${whereClause} RETURNING *`;
  
  return { query, params };
}
function getUsernameFromToken(req) {
  if (!req.user) {
    console.log('No user in request, using system');
    return 'system';
  }

  console.log('User object from JWT:', req.user);

  // For valid JWT tokens, prefer username over name, then email as fallback
  // For system fallback (when no valid token), it will have { username: 'system' }
  const username = req.user.username || req.user.name || req.user.email || 'system';
  console.log('Extracted username:', username);
  return username;
}


// change Field Detection
function fieldChangeDetection({fieldsToCheck, prevVal}) {
  if( typeof fieldsToCheck !== 'object'|| typeof prevVal !== 'object' ){
      throw new TypeError('fieldsToCheck and prevVal must be of type Object');      
  }
  changedFields = [];

  const normalize = (value)=>{
    if (value==null || value ==undefined) return '';

    return value.toString().trim();
  }
  for (field in fieldsToCheck){
    const newVal = normalize(fieldsToCheck[field]);
    const oldVal =normalize(prevVal[field]);
    newVal !== oldVal && changedFields.push(`Field ${field} changed From ${oldVal} to ${newVal}`);
  }

  return changedFields.length > 0 ? 'Changes detected in the field \n'+changedFields.join('\n') : 'No Changes Detected';
  
}

module.exports = {
  shouldUpdateWithContext,
  buildUpdateQuery,
  getUsernameFromToken,
  fieldChangeDetection
};