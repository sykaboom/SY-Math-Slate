# Task <id>: <short title>

Status: PENDING | APPROVED | COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/   # or root/ (must choose one)
Date: YYYY-MM-DD

---

## Goal (Base Required)
- What to change:
  - (concise, observable change)
- What must NOT change:
  - (explicit non-goals / invariants)

---

## Scope (Base Required)

Touched files/directories:
- (explicit, minimal list)

Out of scope:
- (explicit list; anything not listed above is out of scope)

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO (default)
  - If YES, list and justify explicitly.
- Boundary rules:
  - (layer/import/runtime constraints)
- Compatibility:
  - (backward compatibility expectations, if relevant)

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: YES / NO
- If YES, fill all items:
  - [ ] SVG path in `design_drafts/`
  - [ ] SVG has explicit `viewBox` (width / height / ratio)
  - [ ] Tablet viewport checks considered:
    - 768x1024 / 820x1180 / 1024x768 / 1180x820
  - [ ] Numeric redlines recorded in spec
  - [ ] Codex verified SVG exists before implementation

---

## Optional Block B — Delegated Execution

- [ ] Applies: YES / NO
- If YES:
  - Execution mode: DELEGATED
  - Delegation chain scope:
    - (task IDs / boundaries)
  - Assigned roles:
    - Spec-Writer:
    - Spec-Reviewer:
    - Implementer-A:
    - Implementer-B:
    - Implementer-C:
    - Reviewer+Verifier:
  - File ownership lock plan:
    - (one file = one implementer)
  - Parallel slot plan:
    - (max 6 active slots)

If NO:
- Execution mode: MANUAL

---

## Optional Block C — Hotfix Exception

- [ ] Applies: YES / NO
- If YES:
  - Explicit user hotfix approval quote:
    - (chat message)
  - Exact hotfix scope/files:
    - ...
  - Hotfix log path:
    - `codex_tasks/hotfix/hotfix_<id>_<slug>.md`

---

## Optional Block D — Speculative Defense Check

- [ ] Applies: YES / NO
- If YES:
  - Evidence (real input, spec, or bug report):
    - (link / file / sample)
  - Sunset criteria:
    - (explicit removal condition)

---

## Optional Block E — Documentation Update Check

- [ ] Applies: YES / NO
- If YES:
  - [ ] Structure changes (file/folder add/move/delete):
    - Run `node scripts/gen_ai_read_me_map.mjs`
    - Verify `v10/AI_READ_ME_MAP.md` update if needed
  - [ ] Semantic/rule changes:
    - Verify `v10/AI_READ_ME.md` update if needed

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: (observable pass/fail condition)
- [ ] AC-2: (observable pass/fail condition)
- [ ] AC-3: ...

---

## Manual Verification Steps (Base Required)

> Each step should map to one or more Acceptance Criteria.

1) Step:
   - Command / click path:
   - Expected result:
   - Covers: AC-#

2) Step:
   - Command / click path:
   - Expected result:
   - Covers: AC-#

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - (what could go wrong, why)
- Roll-back:
  - (exact revert strategy)

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
  - (file / command / reason)
- Newly introduced failures:
  - (file / command / reason)
- Blocking:
  - YES / NO
- Mitigation:
  - (rollback or follow-up task)

Manual verification notes:
- (results vs Acceptance Criteria)

Notes:
- (pre-existing failures vs new issues, if any)
