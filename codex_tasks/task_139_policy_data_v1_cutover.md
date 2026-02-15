# Task 139: Policy-as-Data v1 Final Cutover

Status: PENDING
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Replace remaining role hardcoding in runtime UI/action gating with policy resolver calls.
  - Move role visibility and command/tool permission rules to policy data as SSOT.
- What must NOT change:
  - No behavior regression for current `host` / `student` baseline.
  - No bypass path that mutates doc state outside policy checks.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/config/rolePolicy.ts`
- `v10/src/core/config/rolePolicyGuards.ts`
- `v10/src/features/layout/**`
- `v10/src/features/extensions/commandExecutionPolicy.ts`
- `v10/src/features/extensions/toolExecutionPolicy.ts`
- `v10/AI_READ_ME.md`

Out of scope:
- Mod Studio GUI.
- Realtime network sync.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Policy resolution in `core/config`, UI wiring in `features/**`.
  - Unknown role/surface/action must evaluate to deny.
- Compatibility:
  - Existing persisted docs remain compatible.

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
    - A: policy core
    - B: command/tool policy hooks
    - C: layout visibility wiring
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

- [ ] AC-1: No primary runtime role gating in touched files uses direct literal branching.
- [ ] AC-2: Role permission and visibility decisions resolve through policy helpers.
- [ ] AC-3: Unknown role/action/surface inputs are denied deterministically.
- [ ] AC-4: `scripts/check_layer_rules.sh` and lint/build pass.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: `rg -n "role ===|role !==" v10/src/features/layout v10/src/features/extensions`
   - Expected result: touched decision paths use policy helpers.
   - Covers: AC-1, AC-2

2) Step:
   - Command / click path: `scripts/check_layer_rules.sh`
   - Expected result: PASS.
   - Covers: AC-4

3) Step:
   - Command / click path: `cd v10 && npm run lint && npm run build`
   - Expected result: PASS.
   - Covers: AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Misconfigured policy may hide required controls.
- Roll-back:
  - Revert policy wiring commits and restore previous branch conditions.

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
