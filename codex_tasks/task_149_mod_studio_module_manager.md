# Task 149: Mod Studio Module Manager (Install/Enable/Order)

Status: PENDING
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Provide module manager GUI for enable/disable, ordering, conflict checks.
  - Add deterministic conflict diagnostics before publish.
- What must NOT change:
  - No unsafe dynamic execution path.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/features/mod-studio/modules/**` (new)
- `v10/src/core/extensions/registry.ts`
- `v10/src/core/extensions/pluginLoader.ts`

Out of scope:
- Theme token editor.
- Policy schema redesign.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Module manager writes declarative data only.
  - Conflict rules are deterministic and reproducible.
- Compatibility:
  - Existing module manifests remain supported.

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
    - A: module catalog/state
    - B: conflict diagnostics
    - C: registry integration
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

- [ ] AC-1: GUI can enable/disable/order modules.
- [ ] AC-2: Conflict diagnostics block invalid publish state.
- [ ] AC-3: Runtime module load order matches GUI configuration.
- [ ] AC-4: lint/build pass.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: toggle/reorder modules in GUI.
   - Expected result: state persists and preview updates.
   - Covers: AC-1, AC-3

2) Step:
   - Command / click path: trigger known conflict state.
   - Expected result: deterministic conflict message and blocked publish.
   - Covers: AC-2

3) Step:
   - Command / click path: `cd v10 && npm run lint && npm run build`
   - Expected result: PASS.
   - Covers: AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Module ordering bugs may create missing UI sections.
- Roll-back:
  - Restore last known-good module configuration snapshot.

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
