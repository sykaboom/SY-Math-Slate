# Task 241: Panel Policy State Persistence and Role Overrides

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-16

---

## Goal (Base Required)
- What to change:
  - Implement policy-aware panel state evaluation with persisted placement behavior.
  - Support declarative controls for `rememberPosition`, `defaultPosition`, and `roleOverride` without hardcoded layout branches.
- What must NOT change:
  - Do not alter existing role-token trust model.
  - Do not add direct panel rendering logic in policy modules.
  - No new dependencies.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_241_panel_policy_state_persistence_and_role_overrides.md`
- `v10/src/core/config/panel-policy.ts` (new or update)
- `v10/src/features/chrome/layout/windowing/panelPolicy.runtime.ts` (new)
- `v10/src/features/platform/store/useChromeStore.ts` (policy state persistence fields)
- `v10/src/features/governance/policy/useResolvedPanelPolicy.ts` (new if needed)

Out of scope:
- AppLayout cutover
- Panel adapter migration
- Launcher IA changes

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Policy lives in config/runtime boundary, not component trees.
  - Store state remains JSON-safe.
  - Keep security decisions server-trust compatible.
- Compatibility:
  - Consumes runtime foundation from `task_240`.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-C1
- Depends on tasks:
  - [`task_240`]
- Enables tasks:
  - [`task_243`]
- Parallel group:
  - G-policy-runtime
- Max parallel slots:
  - 6 (default)
- Verification stage for this task:
  - `mid`

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: NO

---

## Optional Block B — Delegated Execution

- [ ] Applies: NO

If NO:
- Execution mode: MANUAL

---

## Optional Block C — Hotfix Exception

- [ ] Applies: NO

---

## Optional Block D — Speculative Defense Check

- [ ] Applies: NO

---

## Optional Block E — Documentation Update Check

- [x] Applies: YES
- If YES:
  - [ ] Structure changes (file/folder add/move/delete):
    - Run `node scripts/gen_ai_read_me_map.mjs`
    - Verify `v10/AI_READ_ME_MAP.md` update if needed
  - [ ] Semantic/rule changes:
    - Verify `v10/AI_READ_ME.md` update if needed

---

## Acceptance Criteria (Base Required)

- [x] AC-1: Panel policy resolves mode/visibility using declarative data (`roleOverride`, `displayMode`, `movable`).
- [x] AC-2: `rememberPosition=true` restores last valid position; `rememberPosition=false` always uses defaults.
- [x] AC-3: Invalid or missing policy values fall back to safe defaults (deny-by-default for edit-only panels in student role).
- [x] AC-4: No direct `if(role===...)` branches are newly introduced in layout components for these rules.
- [x] AC-5: `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh` passes.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: inspect policy resolver and defaults.
   - Expected result: declarative role/mode handling with safe fallback.
   - Covers: AC-1, AC-3

2) Step:
   - Command / click path: inspect persistence read/write path.
   - Expected result: `rememberPosition` semantics are deterministic.
   - Covers: AC-2

3) Step:
   - Command / click path: `rg -n \"if\\s*\\(.*role\" v10/src/features/chrome/layout`
   - Expected result: no new hardcoded role branching introduced for panel visibility policy.
   - Covers: AC-4

4) Step:
   - Command / click path: `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh`
   - Expected result: PASS.
   - Covers: AC-5

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Policy fallback mistakes can hide required host controls.
  - Persistence schema mismatch can reset panel positions unexpectedly.
- Roll-back:
  - Revert policy runtime/store updates and restore prior policy evaluation path.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - Approval reference: user assignment message for Task 241 (Wave 4 branch C1) with scope lock and required verification command.

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/task_241_panel_policy_state_persistence_and_role_overrides.md`
- `v10/src/core/config/panel-policy.ts`
- `v10/src/features/chrome/layout/windowing/panelPolicy.runtime.ts`
- `v10/src/features/platform/store/useChromeStore.ts`
- `v10/src/features/governance/policy/useResolvedPanelPolicy.ts`

Commands run (only if user asked or required by spec):
- `scripts/check_layer_rules.sh`
- `rg -n "if\\s*\\(.*role" v10/src/features/chrome/layout -S`
- `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh`

## Gate Results (Codex fills)

- Lint:
  - PASS (`scripts/check_v10_changed_lint.sh` via `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh`)
- Build:
  - N/A
- Script checks:
  - PASS (`VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh`)

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - None in required gates.
- Newly introduced failures:
  - None (intermediate local lint issue in new runtime helper naming was fixed before final gate run).
- Blocking:
  - NO
- Mitigation:
  - Not required.

Manual verification notes:
- AC-1 PASS: `v10/src/features/chrome/layout/windowing/panelPolicy.runtime.ts` resolves panel behavior declaratively from `displayMode`, `movable`, and `roleOverride`, with no component-layer branching.
- AC-2 PASS: `rememberPosition` is enforced both in resolver output (`initialPosition` from persisted layout only when `rememberPosition=true`) and store persistence filters (`v10/src/features/platform/store/useChromeStore.ts` removes persisted layouts when `rememberPosition=false`).
- AC-3 PASS: runtime resolver applies safe defaults for invalid/missing policy values and explicitly denies student visibility by default on edit-only panels.
- AC-4 PASS: `rg -n "if\\s*\\(.*role" v10/src/features/chrome/layout -S` confirmed no new layout-component role branch for panel visibility policy.
- AC-5 PASS: `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh` completed successfully.

Notes:
- Scope lock respected: no AppLayout cutover, no panel adapter migration, no launcher IA changes.
- No new dependencies added.
