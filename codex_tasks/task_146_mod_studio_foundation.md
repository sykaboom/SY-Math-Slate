# Task 146: Mod Studio Foundation (GUI Modding Base)

Status: PENDING
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Build base Mod Studio shell for non-code users.
  - Provide GUI state model for policy/layout/module/theme editing flows.
- What must NOT change:
  - No direct runtime mutation bypassing command/policy gates.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/features/mod-studio/**` (new)
- `v10/src/features/layout/AppLayout.tsx` (entry point mount only)
- `v10/src/features/store/**` (only if local studio state slice is needed)

Out of scope:
- Full policy editor features.
- Full layout composer features.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Studio UI remains in features/ui; core remains headless.
  - Studio save/publish path must call existing policy/plugin guards.
- Compatibility:
  - Studio can be feature-flagged off without app regression.

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: YES
- If YES, fill all items:
  - [ ] SVG path in `design_drafts/`
  - [ ] SVG has explicit `viewBox` (width / height / ratio)
  - [ ] Tablet viewport checks considered:
    - 768x1024 / 820x1180 / 1024x768 / 1180x820
  - [ ] Numeric redlines recorded in spec
  - [ ] Codex verified SVG exists before implementation

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
    - A: studio shell + routes
    - B: studio local state
    - C: app integration mount
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

- [ ] AC-1: Mod Studio shell loads and is role-gated.
- [ ] AC-2: Studio state can edit draft config without direct runtime mutation.
- [ ] AC-3: Save/preview hooks pass through existing guard path.
- [ ] AC-4: lint/build pass.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: open Mod Studio UI.
   - Expected result: panel loads and baseline navigation works.
   - Covers: AC-1

2) Step:
   - Command / click path: edit draft values and preview.
   - Expected result: draft state updates without runtime corruption.
   - Covers: AC-2, AC-3

3) Step:
   - Command / click path: `cd v10 && npm run lint && npm run build`
   - Expected result: PASS.
   - Covers: AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Studio shell can add UI complexity and regress layout.
- Roll-back:
  - Disable studio mount via feature flag and revert studio files.

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
