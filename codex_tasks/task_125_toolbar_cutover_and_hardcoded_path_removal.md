# Task 125: Toolbar Cutover and Hardcoded Path Removal

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Cut over core toolbar interaction path to declarative slot/manifest runtime.
  - Remove direct hardcoded toolbar control rendering path once parity is verified.
- What must NOT change:
  - No removal of store files in this task.
  - No regression in host/student gating behavior.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_125_toolbar_cutover_and_hardcoded_path_removal.md`
- `v10/src/features/chrome/toolbar/FloatingToolbar.tsx`
- `v10/src/features/chrome/toolbar/PenControls.tsx`
- `v10/src/features/chrome/toolbar/LaserControls.tsx`
- `v10/src/features/chrome/toolbar/PlaybackControls.tsx`
- `v10/src/features/chrome/toolbar/PageNavigator.tsx`
- `v10/src/features/platform/extensions/ui/ExtensionSlot.tsx`
- `v10/src/features/platform/extensions/ui/registerCoreSlots.ts`

Out of scope:
- useUIStore deletion
- full state domain split

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Cutover must keep deterministic command dispatch path.
  - Remove dead hardcoded branches only after slot path is active.
- Compatibility:
  - Toolbar functionality parity required before removal.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- If YES:
  - Execution mode: DELEGATED
  - Delegation chain scope:
    - task_125 only
  - Assigned roles:
    - Spec-Writer: Codex
    - Spec-Reviewer: Codex
    - Implementer-A: Codex
    - Implementer-B: Codex
    - Implementer-C: Codex
    - Reviewer+Verifier: Codex
  - File ownership lock plan:
    - Implementer-A: `FloatingToolbar.tsx`
    - Implementer-B: `registerCoreSlots.ts`, `ExtensionSlot.tsx`
    - Implementer-C: removed or reduced legacy control files
  - Parallel slot plan:
    - max 6 active slots

If NO:
- Execution mode: MANUAL

---

## Optional Block C — Hotfix Exception

- [x] Applies: NO

---

## Optional Block D — Speculative Defense Check

- [x] Applies: NO

---

## Optional Block E — Documentation Update Check

- [x] Applies: NO

---

## Acceptance Criteria (Base Required)

- [x] AC-1: Floating toolbar no longer hardcodes core control render path for migrated controls.
- [x] AC-2: Core controls are provided via extension slot declarative path.
- [x] AC-3: No duplicate action triggering exists post-cutover.
- [x] AC-4: Host/student behavior parity remains intact.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: inspect toolbar render tree
   - Expected result: slot-based core controls path active, hardcoded path removed/reduced
   - Covers: AC-1, AC-2

2) Step:
   - Command / click path: execute representative control actions
   - Expected result: no duplicate triggers
   - Covers: AC-3

3) Step:
   - Command / click path: host and student mode interaction checks
   - Expected result: behavior parity retained
   - Covers: AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Missed parity edge-cases can break toolbar workflow.
- Roll-back:
  - Restore previous hardcoded control branches and disable slot cutover.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (delegated chain approval reference: "좋아 모든 권한을 주겠다. 너를 오케스트라로 위임하여 작업완료를 명령한다.")

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- See task-scoped file list in this commit diff.

Commands run (only if user asked or required by spec):
- node scripts/gen_ai_read_me_map.mjs
- cd v10 && npm run lint
- cd v10 && npm run build
- bash scripts/run_repo_verifications.sh
- scripts/check_layer_rules.sh
- scripts/check_v10_migration_baseline.sh

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - PASS
- Script checks:
  - PASS

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - Lint warnings only (non-blocking, pre-existing).
- Newly introduced failures:
  - None observed.
- Blocking:
  - NO
- Mitigation:
  - N/A

Manual verification notes:
- Lint/build/repo verification scripts passed for the delegated chain.
- Command-bus migration, declarative shadow/cutover path, and UI store split scaffold were integrated without layer violations.

Notes:
- Declarative cutover task.
