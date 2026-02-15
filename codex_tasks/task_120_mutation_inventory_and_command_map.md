# Task 120: Mutation Inventory and Command Map

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Produce an explicit map from legacy mutation paths to CommandBus command IDs.
  - Introduce command registry scaffolding for upcoming migrations without changing behavior yet.
- What must NOT change:
  - No user-visible behavior change.
  - No removal of legacy controls/stores in this task.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_120_mutation_inventory_and_command_map.md`
- `v10/src/features/extensions/commands/registerCoreCommands.ts`
- `v10/AI_READ_ME.md`

Out of scope:
- UI cutover
- Store deletions
- Kiosk/approval policy semantics changes

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Commands must preserve JSON-safe payload validation.
  - Existing three commands must remain backward-compatible.
- Compatibility:
  - Existing callers of `insertBlock/updateBlock/deleteBlock` continue to work.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- If YES:
  - Execution mode: DELEGATED
  - Delegation chain scope:
    - task_120 only
  - Assigned roles:
    - Spec-Writer: Codex
    - Spec-Reviewer: Codex
    - Implementer-A: Codex
    - Implementer-B: Codex
    - Implementer-C: Codex
    - Reviewer+Verifier: Codex
  - File ownership lock plan:
    - Implementer-A: `registerCoreCommands.ts`
    - Implementer-B: `v10/AI_READ_ME.md`
    - Implementer-C: `task_120_mutation_inventory_and_command_map.md`
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

- [x] AC-1: `registerCoreCommands.ts` contains command map comments/sections for tooling, playback/page, and data-input domains.
- [x] AC-2: No existing command IDs are removed or behavior-broken.
- [x] AC-3: `v10/AI_READ_ME.md` documents migration map and command naming conventions.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: inspect `registerCoreCommands.ts`
   - Expected result: explicit domain mapping scaffold exists
   - Covers: AC-1

2) Step:
   - Command / click path: run existing command dispatch paths from app
   - Expected result: existing command behavior unchanged
   - Covers: AC-2

3) Step:
   - Command / click path: inspect `v10/AI_READ_ME.md`
   - Expected result: command map documentation present
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Command naming drift may confuse follow-up tasks.
- Roll-back:
  - Revert command map additions and docs section.

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
- Mapping-only bridge task before migration implementation.
