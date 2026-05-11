# ISLF Phase M3 — Validation Checklist

This checklist is used to manually validate the Phase M3 (Frontend Context Filtering) implementation.

## Prerequisites
1. Ensure the backend is running with Phase M1 (JWT Context Hydration) and Phase M2 (Backend Context Guard) active.
2. Ensure the Angular frontend has successfully rebuilt after applying the `context.service.ts` modifications.
3. Access the ISLF application via the browser.

## Validation Steps

### 1. `SYSTEM_ADMIN` Context Visibility
- **Action**: Log in as `islf_root`. Open the Context Selector.
- **Expected Result**: All active companies, branches, and departments in the system are listed in the dropdowns.
- **Status**: [ ] Passed

### 2. `ADMIN` Context Visibility
- **Action**: Log in as `islf_admin`. Open the Context Selector.
- **Expected Result**: All active companies, branches, and departments are visible. (Bypass rule is active).
- **Status**: [ ] Passed

### 3. Dynamic User (`MANAGER`) — Valid Assignments
- **Pre-condition**: Create a user with role `MANAGER` and assign specifically to Branch `BR001` and Department `IT`.
- **Action**: Log in as the `MANAGER` user. Open the Context Selector.
- **Expected Result**: 
  - The Branch dropdown **only** contains `BR001`.
  - The Department dropdown **only** contains `IT`.
- **Status**: [ ] Passed

### 4. Dynamic User — Unassigned Contexts Hidden
- **Action**: While logged in as the `MANAGER` user from Step 3, attempt to view or select `BR002` or `HR`.
- **Expected Result**: The options do not exist in the dropdown lists.
- **Status**: [ ] Passed

### 5. Legacy Token Fallback (Fail-Open)
- **Pre-condition**: Use a token generated prior to Phase M1 (where `branch` and `department` are absent from the JWT payload).
- **Action**: Log in and open the Context Selector.
- **Expected Result**: The UI falls open and displays all branches and departments, and logs a warning in the console. The application does not crash.
- **Status**: [ ] Passed

### 6. Auto-Selection Logic
- **Action**: Log in as a dynamic user assigned exactly 1 Company, 1 Branch, and 1 Department.
- **Expected Result**: The context selector automatically selects them without requiring user interaction. (This relies on the pre-existing `setupAutoSelection` logic combined with the newly filtered options list).
- **Status**: [ ] Passed

### 7. Angular Build Integrity
- **Action**: Verify the terminal output for `ng serve`.
- **Expected Result**: Build passes with no compilation errors.
- **Status**: [ ] Passed

## Conclusion
If all steps pass, the Frontend Context Filtering is successfully aligned with the Backend Context Guard, preventing unauthorized context selection at the UI layer.
