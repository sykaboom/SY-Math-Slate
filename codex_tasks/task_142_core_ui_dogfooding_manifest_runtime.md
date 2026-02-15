# Task 142: Core UI Dogfooding via Manifest Runtime

Status: PENDING
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Make core toolbar/panel UI use the same declarative plugin manifest path as external modules.
  - Reduce hardcoded JSX composition in core chrome.
- What must NOT change:
  - No loss of current core controls.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/features/extensions/ui/registerCoreDeclarativeManifest.ts`
- `v10/src/core/extensions/pluginLoader.ts`
- `v10/src/features/layout/**`
- `v10/src/features/toolbar/**`

Out of scope:
- Mod Studio GUI.
- Role policy redesign.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Keep strict manifest whitelist.
  - No arbitrary function injection path.
- Compatibility:
  - Existing command IDs remain stable.

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
    - A: core manifest registration
    - B: plugin loader bridge wiring
    - C: layout/toolbar host cleanup
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

- [ ] AC-1: Core toolbar/panel items are registered as declarative manifests.
- [ ] AC-2: Layout consumes core controls through slot+manifest runtime path.
- [ ] AC-3: Existing core actions still dispatch expected commands.
- [ ] AC-4: lint/build and migration baseline checks pass.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: run app and verify core controls appear via runtime injection.
   - Expected result: controls visible and actionable.
   - Covers: AC-1, AC-2

2) Step:
   - Command / click path: execute key toolbar actions.
   - Expected result: matching command dispatch and behavior.
   - Covers: AC-3

3) Step:
   - Command / click path: `scripts/check_v10_migration_baseline.sh && cd v10 && npm run lint && npm run build`
   - Expected result: PASS.
   - Covers: AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Incorrect manifest wiring can hide controls.
- Roll-back:
  - Restore direct host rendering for affected core controls.

---

## Approval Gate (Base Required)

- [ ] Spec self-reviewed by Codex
- [ ] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- ...

Commands run (only if user asked or required by spec):
- ...

## Gate Results (Codex fills)

- Lint:
  - PASS | FAIL | N/A
- Build:
  - PASS | FAIL | N/A
- Script checks:
  - PASS | FAIL | N/A

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - ...
- Newly introduced failures:
  - ...
- Blocking:
  - YES / NO
- Mitigation:
  - ...

Manual verification notes:
- ...

Notes:
- ...
