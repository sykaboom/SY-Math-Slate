# Task 148: Mod Studio Layout Composer (Slot Placement GUI)

Status: PENDING
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Add GUI layout composer for slot placement/order/visibility presets.
  - Persist layout manifest data without direct JSX edits.
- What must NOT change:
  - No runtime slot injection bypassing whitelist constraints.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/features/mod-studio/layout/**` (new)
- `v10/src/features/extensions/ui/**`
- `v10/src/core/extensions/pluginLoader.ts`

Out of scope:
- Policy editor semantics.
- Theme token editor.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Composer outputs declarative manifest only.
  - Slot names must be registry-known literals.
- Compatibility:
  - Existing layout manifest remains loadable.

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
    - A: layout model + manifest serializer
    - B: GUI composer widgets
    - C: runtime preview integration
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

- [ ] AC-1: GUI can reorder/place modules by slot.
- [ ] AC-2: Produced manifest validates against plugin loader guards.
- [ ] AC-3: Runtime preview reflects manifest without rebuild.
- [ ] AC-4: lint/build checks pass.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: edit slot placements in composer.
   - Expected result: preview updates correctly.
   - Covers: AC-1, AC-3

2) Step:
   - Command / click path: validate/save manifest.
   - Expected result: guard-validated save succeeds; invalid payload rejected.
   - Covers: AC-2

3) Step:
   - Command / click path: `cd v10 && npm run lint && npm run build`
   - Expected result: PASS.
   - Covers: AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Incorrect slot maps can hide critical controls.
- Roll-back:
  - Restore previous layout manifest snapshot.

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
