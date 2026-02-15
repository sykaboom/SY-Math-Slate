# Task 135: Command-Only Write Path Wave 2

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Expand command-dispatch write path coverage in high-impact UI mutation surfaces.
  - Remove direct mutation calls from targeted UI handlers, keeping deterministic fallback only where command registration is unavailable.
- What must NOT change:
  - No feature regression in pen/laser/playback/page/data-input interactions.
  - No full `useCanvasStore` deletion in this task.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_135_command_only_write_path_wave2.md`
- `v10/src/features/extensions/commands/registerCoreCommands.ts`
- `v10/src/features/toolbar/FloatingToolbar.tsx`
- `v10/src/features/toolbar/PenControls.tsx`
- `v10/src/features/toolbar/LaserControls.tsx`
- `v10/src/features/toolbar/PlaybackControls.tsx`
- `v10/src/features/toolbar/PageNavigator.tsx`
- `v10/src/features/layout/DataInputPanel.tsx`
- `v10/src/features/layout/PlayerBar.tsx`
- `v10/src/features/hooks/useSequence.ts`
- `scripts/check_v10_migration_baseline.sh`
- `v10/AI_READ_ME.md`

Out of scope:
- Full layout slot cutover (Task 136).
- Hard purge of `useCanvasStore` and all bridge fallbacks (Task 138).

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Write-path migration must prefer `dispatchCommand(...)`.
  - Preserve command metadata/audit source tags for host diagnostics.
  - Approval-required responses must not silently mutate doc state.
- Compatibility:
  - Existing UX controls remain functional for host role.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- If YES:
  - Execution mode: DELEGATED
  - Delegation chain scope:
    - task_133~138
  - Assigned roles:
    - Spec-Writer: Codex
    - Spec-Reviewer: Codex
    - Implementer-A: Codex
    - Implementer-B: Codex
    - Implementer-C: Codex
    - Reviewer+Verifier: Codex
  - File ownership lock plan:
    - Implementer-A: command registration file
    - Implementer-B: toolbar/page/playback handlers
    - Implementer-C: data-input/sequence/player handlers and docs
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

- [x] Applies: YES
- If YES:
  - [x] Structure changes (file/folder add/move/delete):
    - Run `node scripts/gen_ai_read_me_map.mjs`
    - Verify `v10/AI_READ_ME_MAP.md` update if needed
  - [x] Semantic/rule changes:
    - Verify `v10/AI_READ_ME.md` update if needed

---

## Acceptance Criteria (Base Required)

- [x] AC-1: Targeted handlers route state-changing actions through `dispatchCommand(...)` first.
- [x] AC-2: `registerCoreCommands.ts` contains required mutation commands for targeted handlers.
- [x] AC-3: Baseline metrics improve (dispatch refs increase and targeted direct mutation patterns decrease).
- [x] AC-4: `cd v10 && npm run lint` and `scripts/check_v10_migration_baseline.sh` pass.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: `rg -n "dispatchCommand\(" v10/src/features/{toolbar,layout,hooks}/*`
   - Expected result: targeted files show command-first mutation paths.
   - Covers: AC-1

2) Step:
   - Command / click path: `scripts/check_v10_migration_baseline.sh`
   - Expected result: pass with updated informational counts.
   - Covers: AC-3, AC-4

3) Step:
   - Command / click path: `cd v10 && npm run lint`
   - Expected result: lint pass.
   - Covers: AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Command payload mismatch could break specific controls.
- Roll-back:
  - Restore targeted handler fallbacks and revert individual command wiring.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/task_135_command_only_write_path_wave2.md`
- `v10/src/features/extensions/commands/registerCoreCommands.ts`
- `v10/src/features/layout/DataInputPanel.tsx`
- `v10/src/features/toolbar/FloatingToolbar.tsx`
- `v10/src/features/toolbar/PenControls.tsx`
- `v10/src/features/toolbar/LaserControls.tsx`
- `scripts/check_v10_migration_baseline.sh`
- `v10/AI_READ_ME.md`
- `v10/AI_READ_ME_MAP.md`

Commands run (only if user asked or required by spec):
- cd v10 && npm run lint
- cd v10 && npm run build
- scripts/check_v10_migration_baseline.sh
- node scripts/gen_ai_read_me_map.mjs

## Gate Results (Codex fills)

- Lint:
  - PASS (2 pre-existing warnings in untouched files)
- Build:
  - PASS
- Script checks:
  - PASS

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - Lint warnings only (pre-existing, non-blocking) in compileAnimationPlan/ChalkActor.
- Newly introduced failures:
  - None observed.
- Blocking:
  - NO
- Mitigation:
  - N/A

Manual verification notes:
- Command registration and command-first handlers were verified with migration baseline script and targeted source checks.

Notes:
- Delegated execution completed for this task scope.
