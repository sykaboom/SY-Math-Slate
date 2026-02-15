# Task 150: Theme Token Editor and Module Style Isolation

Status: PENDING
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Provide GUI theme editor based on design tokens.
  - Enforce per-module style isolation to reduce cross-module visual breakage.
- What must NOT change:
  - No inline style bypass in logic layers.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/features/mod-studio/theme/**` (new)
- `v10/src/app/globals.css`
- `v10/src/core/themes/**`
- `v10/src/ui/components/**` (token wiring only)

Out of scope:
- Layout slot composer.
- Role policy editor.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Theme values are token data, not ad-hoc class edits.
  - Module-scoped token prefixes required where applicable.
- Compatibility:
  - Existing theme defaults stay valid.

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
    - A: token schema/editor model
    - B: CSS variable wiring
    - C: module isolation constraints
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

- [ ] AC-1: GUI can edit and preview token packs.
- [ ] AC-2: Module style keys are isolated with deterministic prefix/scope rules.
- [ ] AC-3: Token publish does not require code edits.
- [ ] AC-4: lint/build pass.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: edit token values in GUI.
   - Expected result: preview updates immediately.
   - Covers: AC-1, AC-3

2) Step:
   - Command / click path: apply two modules with different theme packs.
   - Expected result: no cross-module style leak.
   - Covers: AC-2

3) Step:
   - Command / click path: `cd v10 && npm run lint && npm run build`
   - Expected result: PASS.
   - Covers: AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Token naming collisions can create style drift.
- Roll-back:
  - Restore previous token pack and clear runtime overrides.

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
