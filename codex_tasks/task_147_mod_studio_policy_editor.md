# Task 147: Mod Studio Policy Editor (Role/Permission GUI)

Status: PENDING
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Provide GUI editor for role policies (visibility, command permission, approval routing).
  - Add simulation mode to preview `host/student` outcomes before publish.
- What must NOT change:
  - No policy publish without validation and deny-by-default guarantees.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/features/mod-studio/policy/**` (new)
- `v10/src/core/config/rolePolicy.ts`
- `v10/src/core/config/rolePolicyGuards.ts`
- `v10/src/features/policy/**`

Out of scope:
- Layout slot composition editor.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Policy schema validation must reuse manual guard path.
  - Published policy cannot grant unknown actions by default.
- Compatibility:
  - Existing role keys continue to function.

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
    - A: editor model/validation
    - B: UI controls/simulation
    - C: publish wiring
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

- [ ] AC-1: GUI can edit role policy draft safely.
- [ ] AC-2: Simulation shows visibility/permission outcome per role.
- [ ] AC-3: Publish path rejects invalid schemas and unknown grants.
- [ ] AC-4: lint/build checks pass.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: edit policy values in studio.
   - Expected result: draft updates and previews correctly.
   - Covers: AC-1, AC-2

2) Step:
   - Command / click path: attempt invalid publish.
   - Expected result: deterministic validation failure.
   - Covers: AC-3

3) Step:
   - Command / click path: `cd v10 && npm run lint && npm run build`
   - Expected result: PASS.
   - Covers: AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Wrong policy publish can remove required controls.
- Roll-back:
  - Restore previous policy snapshot and reload runtime.

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
