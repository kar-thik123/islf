'use strict';

const { ADMIN_BYPASS_ROLES } = require('../constants/roles');

/**
 * CONTEXT GUARD MIDDLEWARE — Phase M2
 *
 * PURPOSE
 * -------
 * Protect backend CRUD operations from context spoofing by ensuring
 * that dynamic users can only operate within their assigned context (company, branch, department).
 *
 * It reads the assigned context from the JWT payload and validates it against
 * the requested context (from req.query or req.body).
 */
function requireContext() {
  return function contextGuard(req, res, next) {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const role = req.user.role || null;

    // 1. Admin Bypass
    if (ADMIN_BYPASS_ROLES.has(role)) {
      return next();
    }

    // 2. Read assigned context from JWT
    // Assignments may be comma-separated strings (e.g. "BR001,BR002")
    const assignedCompany = req.user.company_code ? req.user.company_code.split(',').map(s => s.trim()) : null;
    const assignedBranch = req.user.branch ? req.user.branch.split(',').map(s => s.trim()) : null;
    const assignedDepartment = req.user.department ? req.user.department.split(',').map(s => s.trim()) : null;

    // 3. Read requested context from query (GET) or body (POST/PUT/DELETE)
    const source = req.method === 'GET' ? req.query : req.body;
    
    // Support both camelCase and snake_case for backward compatibility
    const reqCompany = source.companyCode || source.company_code;
    const reqBranch = source.branchCode || source.branch_code;
    const reqDepartment = source.departmentCode || source.department_code;

    // 4. Validate mismatch (Fail-open logic for legacy tokens without assignments)

    // Company Validation
    if (reqCompany) {
      if (assignedCompany) {
        if (!assignedCompany.includes(reqCompany.trim())) {
          console.warn(`[Context Guard] DENY: User ${req.user.username} requested company ${reqCompany} but assigned ${req.user.company_code}`);
          return res.status(403).json({ message: "Context mismatch" });
        }
      } else {
        console.warn(`[Context Guard] Fail-open: User ${req.user.username} requested company ${reqCompany} but has no company assignment in JWT`);
      }
    }

    // Branch Validation
    if (reqBranch) {
      if (assignedBranch) {
        if (!assignedBranch.includes(reqBranch.trim())) {
          console.warn(`[Context Guard] DENY: User ${req.user.username} requested branch ${reqBranch} but assigned ${req.user.branch}`);
          return res.status(403).json({ message: "Context mismatch" });
        }
      } else {
        console.warn(`[Context Guard] Fail-open: User ${req.user.username} requested branch ${reqBranch} but has no branch assignment in JWT`);
      }
    }

    // Department Validation
    if (reqDepartment) {
      if (assignedDepartment) {
        if (!assignedDepartment.includes(reqDepartment.trim())) {
          console.warn(`[Context Guard] DENY: User ${req.user.username} requested department ${reqDepartment} but assigned ${req.user.department}`);
          return res.status(403).json({ message: "Context mismatch" });
        }
      } else {
        console.warn(`[Context Guard] Fail-open: User ${req.user.username} requested department ${reqDepartment} but has no department assignment in JWT`);
      }
    }

    // All validations passed or skipped
    return next();
  };
}

module.exports = { requireContext };
