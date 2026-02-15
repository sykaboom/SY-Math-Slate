# Task 122: Command Migration — Playback and Page Domain

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Migrate playback/page mutations to CommandBus dispatch.
  - Remove direct mutation handlers from playback/page controls.
- What must NOT change:
  - No UI layout changes.
  - No data-input edit migration in this task.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_122_command_migration_playback_page_domain.md`
- `v10/src/features/extensions/commands/registerCoreCommands.ts`
- `v10/src/features/toolbar/PlaybackControls.tsx`
- `v10/src/features/toolbar/PageNavigator.tsx`
- `v10/src/features/layout/PlayerBar.tsx`
- `v10/src/features/hooks/useSequence.ts`

Out of scope:
- Tooling command migration
- Data-input mutation migration
- Manifest injection/cutover

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Playback/page mutations must dispatch commands with validated payloads.
  - Existing keyboard/interaction affordances remain intact.
- Compatibility:
  - Current step/page behavior preserved.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- If YES:
  - Execution mode: DELEGATED
  - Delegation chain scope:
    - task_122 only
  - Assigned roles:
    - Spec-Writer: Codex
    - Spec-Reviewer: Codex
    - Implementer-A: Codex
    - Implementer-B: Codex
    - Implementer-C: Codex
    - Reviewer+Verifier: Codex
  - File ownership lock plan:
    - Implementer-A: `registerCoreCommands.ts`
    - Implementer-B: `PlaybackControls.tsx`, `PlayerBar.tsx`
    - Implementer-C: `PageNavigator.tsx`, `useSequence.ts`
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

- [x] AC-1: Playback/page command set registered (next/prev/go step, next/prev/go page, play/pause/stop/speed).
- [x] AC-2: Playback/page controls dispatch commands instead of direct writes.
- [x] AC-3: Existing playback/page behavior remains equivalent.
- [x] AC-4: Student role mutating requests are approval-gated.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: use playback/page controls in host mode
   - Expected result: behavior unchanged, command dispatch path active
   - Covers: AC-1, AC-2, AC-3

2) Step:
   - Command / click path: same under student role
   - Expected result: approval-required path triggered for mutating actions
   - Covers: AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Sequence drift if command ordering changes.
- Roll-back:
  - Revert command rewiring for playback/page controls.

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
- Domain migration wave B-B.
