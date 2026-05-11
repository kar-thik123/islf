# ISLF Phase N1 — Validation Checklist

This checklist manually verifies that the Frontend AuthInterceptor behaves correctly regarding HTTP 403 vs 401 errors.

## Prerequisites
1. Ensure the ISLF UI project is built and running (`ng serve`).
2. Have a test user with a dynamic role (e.g., `MANAGER`) that lacks the global `Settings / User Mgmt` permission.
3. Keep the browser Developer Console (Network & Console tabs) open.

## Validation Steps

### 1. Dynamic User Login Succeeds
- **Action**: Log in using the `MANAGER` test credentials.
- **Expected Result**: Login succeeds. The browser proceeds to load the dashboard. 
- **Status**: [ ] Passed

### 2. 403 Errors No Longer Force Logout
- **Action**: Upon dashboard load, the `AppTopbar` fires `GET /api/user/by-username/manager`. Observe the Network tab.
- **Expected Result**: The backend responds with `403 Forbidden` (as expected for Phase M2). The browser Console prints the warning `AuthInterceptor: 403 Forbidden for /api/user/by-username/manager - keeping session intact` instead of triggering a logout.
- **Status**: [ ] Passed

### 3. Session Token Remains Intact
- **Action**: After the 403 error occurs, open the Application > Session Storage in DevTools.
- **Expected Result**: The JWT `token` and `username` keys are still present and have not been cleared by the interceptor.
- **Status**: [ ] Passed

### 4. Dashboard Stays Open
- **Action**: Wait 5 seconds after the dashboard finishes loading.
- **Expected Result**: The user remains on the dashboard screen, and the application does *not* auto-redirect to `/auth/login`.
- **Status**: [ ] Passed

### 5. `SYSTEM_ADMIN` Still Works
- **Action**: Log out. Log in as `islf_root`.
- **Expected Result**: Login succeeds. `GET /api/user/by-username/islf_root` succeeds with 200 OK because the system admin bypasses RBAC. Avatar loads normally. No auto-logout loops occur.
- **Status**: [ ] Passed

### 6. `ADMIN` Still Works
- **Action**: Log out. Log in as `islf_admin` (or another protected `ADMIN` user).
- **Expected Result**: Login succeeds. Avatar loads (or falls back cleanly). No auto-logout loops occur.
- **Status**: [ ] Passed

### 7. Angular Build Passes
- **Action**: Verify terminal output for the `ng serve` process.
- **Expected Result**: No compilation errors. Build succeeds.
- **Status**: [ ] Passed

## Conclusion
If all checks pass, the Frontend Phase N1 fix successfully eliminates the over-aggressive logout loop without requiring immediate backend restructuring. Components can now gracefully handle their own 403 fallback UI (e.g., loading a default avatar placeholder) while keeping the core session alive.
