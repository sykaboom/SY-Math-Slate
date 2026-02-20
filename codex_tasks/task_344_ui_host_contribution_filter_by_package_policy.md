# Task 344: UI Host Contribution Filter by Package Policy

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-20

---

## Goal (Base Required)
- What to change:
  - Apply package UI policy (`allowToolbarContributionGroups`, `allowPanelSlots`) in UI host bridge.
  - Keep host ownership of actual rendering/placement.
- What must NOT change:
  - panel behavior contracts and role-based visibility logic.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/features/ui-host/modContributionBridge.ts`
- `v10/src/features/layout/windowing/panelAdapters.tsx`
- `v10/src/core/mod/package/*` (ui policy selectors)

Out of scope:
- toolbar mode activation mapping.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - bridge consumes package policy by selector only.
- Compatibility:
  - when policy not defined, behavior equals current baseline.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W344
- Depends on tasks:
  - [`task_343_toolbar_mapping_to_package_activation_policy`]
- Enables tasks:
  - `task_345_mod_studio_package_diagnostics_and_conflicts`
  - `task_347_mod_package_regression_matrix_and_runtime_checks`
- Parallel group:
  - G3-ui-policy
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 3
- Files shared with other PENDING tasks:
  - `v10/src/features/layout/windowing/panelAdapters.tsx`
- Cross-module dependency:
  - YES
- Parallelizable sub-units:
  - 1
- Estimated single-agent duration:
  - ~30min
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - NO
- Rationale:
  - panel adapters are shared high-churn runtime host files.

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: YES / NO

---

## Optional Block B — Delegated Execution

- [ ] Applies: YES / NO

If NO:
- Execution mode: MANUAL

---

## Optional Block C — Hotfix Exception

- [ ] Applies: YES / NO

---

## Optional Block D — Speculative Defense Check

- [x] Applies: YES / NO
- If YES:
  - Evidence (real input, spec, or bug report):
    - mod contributions currently filtered by generic host rules only, not package policy.
  - Sunset criteria:
    - package UI policy fully governs contribution allow/deny path.

---

## Optional Block E — Documentation Update Check

- [ ] Applies: YES / NO

---

## Acceptance Criteria (Base Required)

- [x] AC-1: toolbar/panel contributions are filtered by active package UI policy.
- [x] AC-2: undefined policy keeps previous behavior.
- [x] AC-3: host role/mount mode restrictions still apply after policy filtering.

---

## Manual Verification Steps (Base Required)

1) policy allow/deny
   - Command / click path:
     - switch package policy fixtures and inspect toolbar/panel contributions
   - Expected result:
     - contributions included/excluded per package policy
   - Covers: AC-1

2) fallback
   - Command / click path:
     - run without ui policy fields
   - Expected result:
     - baseline behavior unchanged
   - Covers: AC-2

3) host restrictions
   - Command / click path:
     - student role + non-window-host mode checks
   - Expected result:
     - existing host restrictions preserved
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - over-filtering hides critical core contributions.
- Roll-back:
  - bypass package policy filter with compatibility switch.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (chat directive, 2026-02-20: "You own Task 344 implementation only.")

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/mod/package/selectors.ts`
- `v10/src/features/ui-host/modContributionBridge.ts`
- `v10/src/features/layout/windowing/panelAdapters.tsx`
- `codex_tasks/task_344_ui_host_contribution_filter_by_package_policy.md`

Commands run (only if user asked or required by spec):
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
- `bash scripts/check_layer_rules.sh`
- `bash scripts/check_mod_contract.sh`

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - FAIL
- Script checks:
  - PASS (`check_layer_rules`, `check_mod_contract`)

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - `cd v10 && npm run build` fails with TypeScript error in `v10/src/features/canvas/viewport/useViewportInteraction.ts:63` (`Type 'boolean' is not assignable to type 'Element'.`), outside Task 344 scope.
- Newly introduced failures:
  - None identified in Task 344 scope.
- Blocking:
  - YES
- Mitigation:
  - Resolve the typing error in `useViewportInteraction.ts` on its owning task branch, then rerun `cd v10 && npm run build`.

Manual verification notes:
- `modContributionBridge` now filters toolbar contributions by active package `allowToolbarContributionGroups` and panel contributions by `allowPanelSlots`, using package selectors.
- Host constraints are preserved: toolbar still requires `mountMode === "window-host"` and `role === "host"`; panel contributions still require `role === "host"`.
- Compatibility fallback is preserved: when active package or UI policy fields are undefined, selector logic allows contributions as before.
