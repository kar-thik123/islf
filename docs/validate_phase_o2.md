# ISLF Phase O2 — Smart Progressive Context Selection

## Validation Checklist

---

### Test Matrix

| # | Scenario | Expected | How to Verify |
|---|----------|----------|---------------|
| 1 | SYSTEM_ADMIN logs in | Context selector dialog always shows on first page requiring context | Log in as SYSTEM_ADMIN; navigate to any master page. Dialog should appear with all company/branch/department dropdowns visible |
| 2 | ADMIN logs in | Context selector dialog always shows on first page requiring context | Log in as ADMIN; navigate to any master page. Dialog should appear with all company/branch/department dropdowns visible |
| 3 | Dynamic user with 1 company, 1 branch, 1 department logs in | No popup, dashboard loads silently | Log in as MANAGER/STAFF with single-chain assignment. No dialog should ever appear. Context should be set in sessionStorage automatically |
| 4 | Dynamic user with multiple companies logs in | Company selector dialog appears | Log in as a user with 2+ company assignments. Dialog should show only the Company dropdown |
| 5 | User selects a company that has only 1 branch | Branch dropdown is hidden; branch auto-selects | After company selection in dialog, branch row should disappear and branch be set automatically |
| 6 | User selects a branch that has only 1 department | Department dropdown is hidden; department auto-selects | After branch selection, department row should disappear and department be set automatically |
| 7 | Dynamic user with 1 company, multiple branches | Branch selector appears after silent company selection | Log in as user with 1 company, 2+ branches. Dialog should show only Branch dropdown |
| 8 | Dynamic user with 1 company, 1 branch, multiple departments | Department selector appears after silent chain | Log in as user with 1 company, 1 branch, 2+ departments. Dialog should show only Department dropdown |
| 9 | Login stability — all roles | Login succeeds for SYSTEM_ADMIN, ADMIN, and all dynamic roles | Try login for each role type. No regressions in auth flow |
| 10 | Angular build passes | `ng build` completes with no TypeScript or template errors | Run `ng build` and confirm exit code 0 |
| 11 | No context regressions | Context is saved/loaded from sessionStorage as before | After context is set (manually or auto), navigate away and back — context persists |

---

## Flow Before/After

### BEFORE Phase O2

```
Login → navigate to any page
→ page checks context
→ calls showContextSelector()
→ dialog always opens with all 3 dropdowns
→ user must manually choose company, branch, department even if only 1 option each
```

### AFTER Phase O2

```
[Protected roles: SYSTEM_ADMIN, ADMIN]
Login → navigate to any page
→ page calls showContextSelector()
→ dialog always opens (all 3 dropdowns shown)

[Dynamic roles: MANAGER, STAFF, DRIVER, SALES, etc.]
Login → topbar triggers triggerProgressiveContextSetup()
→ options load from backend (filtered to user's JWT assignments)
→ ContextSelectorComponent subscriptions fire

  CASE 1: 1 company, 1 branch, 1 department
  → company auto-selected silently
  → branches loaded for that company (1 branch returned)
  → branch auto-selected silently
  → departments loaded for that branch (1 dept returned)
  → department auto-selected silently
  → checkAndAutoSave() fires
  → context saved to sessionStorage
  → NO dialog ever shown

  CASE 2: multiple companies
  → dialog opens, only Company dropdown shown
  → user picks a company
  → if only 1 branch → auto-select branch, hide branch dropdown
  → if only 1 dept → auto-select dept, hide dept dropdown, auto-save

  CASE 3: 1 company, multiple branches
  → company auto-selected silently
  → dialog opens with only Branch dropdown shown
  → user picks branch
  → same department logic follows

  CASE 4: 1 company, 1 branch, multiple departments
  → company auto-selected silently
  → branch auto-selected silently
  → dialog opens with only Department dropdown shown
  → user picks department, saves
```

---

## Files Modified

| File | Change |
|------|--------|
| `src/app/services/context.service.ts` | Added `isBypassRolePublic()` public method; updated `showContextSelector()` to skip dialog for dynamic roles with context already set; added `triggerProgressiveContextSetup()` |
| `src/app/pages/context-selector.component.ts` | Added `isBypass` flag; updated `setupAutoSelection()` to only auto-select for dynamic roles; added `checkAndAutoSave()` to auto-commit when all values resolved; updated template with `*ngIf` guards to hide dropdowns with only 1 option for dynamic roles |
| `src/app/layout/components/app.topbar.ts` | Changed `ngOnInit` to call `triggerProgressiveContextSetup()` instead of `loadOptions()` |

---

## Rollback Steps

If any regression is observed, revert the following:

1. **`context.service.ts`:**
   - Remove `isBypassRolePublic()` method
   - Revert `showContextSelector()` to simply emit `true`
   - Remove `triggerProgressiveContextSetup()`

2. **`context-selector.component.ts`:**
   - Remove `isBypass` property
   - Revert `setupAutoSelection()` to its original form (without `!this.isBypass` guard)
   - Remove `checkAndAutoSave()` method
   - Revert template `*ngIf` on all 3 dropdown `<div>` wrappers to plain `<div>`

3. **`app.topbar.ts`:**
   - Revert `ngOnInit` to call `this.contextService.loadOptions()` instead

---

## Security Notes

- No backend changes were made
- JWT structure is unchanged
- RBAC and ownership guards are unchanged
- Context guard is unchanged
- All context persistence behavior (sessionStorage) is unchanged
- The `isBypassRolePublic()` method reads the already-present JWT from localStorage — no new API calls
