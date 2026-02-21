# Task 140: Command-Only Write Path Completion

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Complete migration of user-visible write actions to `dispatchCommand(...)`.
  - Remove remaining direct mutation calls on critical UX paths.
- What must NOT change:
  - No regressions in pen/laser/playback/page/data-input flows.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/features/chrome/toolbar/**`
- `v10/src/features/chrome/layout/**`
- `v10/src/features/platform/hooks/useSequence.ts`
- `v10/src/features/platform/extensions/commands/registerCoreCommands.ts`
- `scripts/check_v10_migration_baseline.sh`
- `scripts/check_v10_legacy_freeze.sh`

Out of scope:
- Full deletion of `useCanvasStore` internals.
- Mod Studio GUI.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - UI-triggered mutations must dispatch commands first.
  - Approval-required commands must route queue for student role.
- Compatibility:
  - Keep existing command IDs backward compatible.

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: NO

---

## Optional Block B — Delegated Execution

- [ ] Applies: YES
- If YES:
  - Execution mode: DELEGATED
  - Delegation chain scope:
    - task_139~157
  - Assigned roles:
    - Spec-Writer: Codex
    - Spec-Reviewer: Codex
    - Implementer-A: Codex
    - Implementer-B: Codex
    - Implementer-C: Codex
    - Reviewer+Verifier: Codex
  - File ownership lock plan:
    - A: command registry/validators
    - B: toolbar/playback/page paths
    - C: data-input/sequence paths
  - Parallel slot plan:
    - max 6 active slots

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

- [ ] Applies: YES
- If YES:
  - [ ] Structure changes (file/folder add/move/delete):
    - Run `node scripts/gen_ai_read_me_map.mjs`
    - Verify `v10/AI_READ_ME_MAP.md` update if needed
  - [ ] Semantic/rule changes:
    - Verify `v10/AI_READ_ME.md` update if needed

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: Critical UI write actions route through `dispatchCommand(...)`.
- [ ] AC-2: Command validators cover all migrated payloads.
- [ ] AC-3: Legacy direct mutation references decrease, dispatch references increase.
- [ ] AC-4: Baseline/freeze/lint/build checks pass.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: `rg -n "useCanvasStore\(\).*\.|dispatchCommand\(" v10/src/features/chrome/toolbar v10/src/features/chrome/layout v10/src/features/platform/hooks`
   - Expected result: command usage dominates touched mutation paths.
   - Covers: AC-1, AC-3

2) Step:
   - Command / click path: `scripts/check_v10_migration_baseline.sh && scripts/check_v10_legacy_freeze.sh`
   - Expected result: PASS.
   - Covers: AC-3, AC-4

3) Step:
   - Command / click path: `cd v10 && npm run lint && npm run build`
   - Expected result: PASS.
   - Covers: AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Command payload mismatch may break control actions.
- Roll-back:
  - Revert migrated handlers per domain slice.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/features/chrome/toolbar/FloatingToolbar.tsx`
- `v10/src/features/chrome/layout/AppLayout.tsx`
- `v10/src/features/platform/extensions/ui/registerCoreDeclarativeManifest.ts`

Commands run (only if user asked or required by spec):
- `rg -n "useCanvasStore\\(\\).*\\.|dispatchCommand\\(" v10/src/features/chrome/toolbar v10/src/features/chrome/layout v10/src/features/platform/hooks`
- `scripts/check_v10_migration_baseline.sh`
- `scripts/check_v10_legacy_freeze.sh`
- `cd v10 && npm run lint && npm run build`

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - PASS
- Script checks:
  - PASS

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - None
- Newly introduced failures:
  - None
- Blocking:
  - NO
- Mitigation:
  - N/A

Manual verification notes:
- `setTool` / `setViewMode` UI write path를 command dispatch 경유로 이관.
- core declarative manifest `insertBreak` payload 호환 키를 `type`으로 정합화.
- migration/freeze 지표: `dispatchCommand` 참조 14건으로 증가, freeze 임계치 통과.

Notes:
- Direct write path 제거는 점진 이관 원칙으로 유지(레거시 store 전면 삭제는 후속 wave).
