# Task 152: JSON Roundtrip and Migration UI

Status: PENDING
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Add GUI import/export for policy/layout/module/theme JSON.
  - Provide migration UI for versioned manifests/policies.
- What must NOT change:
  - No acceptance of invalid or unsafe JSON payloads.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/features/mod-studio/io/**` (new)
- `v10/src/core/migrations/**`
- `v10/src/core/config/rolePolicyGuards.ts`
- `v10/src/core/extensions/pluginLoader.ts`

Out of scope:
- Realtime sync engine.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Import path validates then migrates then stages publish.
  - Export path emits deterministic JSON-safe payload.
- Compatibility:
  - Backward compatibility with prior schema versions required.

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
    - A: import/export adapters
    - B: migration UI and conflict prompts
    - C: contract validation wiring
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

- [ ] AC-1: GUI exports valid JSON for each modding domain.
- [ ] AC-2: GUI imports prior versions and migrates to current schema.
- [ ] AC-3: Invalid payloads fail fast with deterministic errors.
- [ ] AC-4: lint/build checks pass.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: export current config and re-import.
   - Expected result: roundtrip equivalence.
   - Covers: AC-1, AC-2

2) Step:
   - Command / click path: import malformed payload.
   - Expected result: deterministic rejection, no runtime mutation.
   - Covers: AC-3

3) Step:
   - Command / click path: `cd v10 && npm run lint && npm run build`
   - Expected result: PASS.
   - Covers: AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Migration gaps may fail older payload recovery.
- Roll-back:
  - Disable import publish path and keep export-only mode.

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
