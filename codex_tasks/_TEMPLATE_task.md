# Task <id>: <short title>

Status: PENDING | APPROVED | COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/   # or root/ (must choose one)
Date: YYYY-MM-DD

---

## Goal
- What to change:
  - (concise, observable change)
- What must NOT change:
  - (explicit non-goals / invariants)

---

## Scope (Codex must touch ONLY these)

Touched files/directories:
- (explicit, minimal list)

Out of scope:
- (explicit list; anything not listed above is out of scope)

---

## Design Artifacts (required for layout/structure changes)

- [ ] Layout / structure changes included: YES / NO
- [ ] SVG path in `design_drafts/`: (required if YES)
- [ ] SVG includes explicit `viewBox` (width / height / ratio label)
- [ ] Tablet viewports considered (if applicable):
  - 768x1024 / 820x1180 / 1024x768 / 1180x820
- [ ] Codex must verify SVG file exists before implementation

> Note:
> - SVG is a structural design artifact only.
> - SVG must NOT be embedded in production code.
> - Gemini provides SVG input only; ownership remains with Codex.

---

## Dependencies / Constraints

- New dependencies allowed: NO (default)
  - If YES, list and justify explicitly.
- Boundary rules:
  - (e.g. core cannot import features; provider logic stays in adapters)
- Compatibility:
  - (backward compatibility expectations, if relevant)

---

## Speculative Defense Check (guardrail)

- [ ] Any defensive branches added: YES / NO
- If YES:
  - Evidence (real input, spec, or bug report):
    - (link / file / example)
  - Sunset criteria (when and how to remove):
    - (explicit condition)

---

## Documentation Update Check

- [ ] Structure changes (file/folder add/move/delete):
  - Run `node scripts/gen_ai_read_me_map.mjs`
  - Verify `v10/AI_READ_ME_MAP.md` update if needed
- [ ] Semantic / rule changes (layers, invariants, core flows):
  - Verify `v10/AI_READ_ME.md` update if needed

---

## Acceptance Criteria (must be testable)

- [ ] AC-1: (observable condition; pass/fail)
- [ ] AC-2: (observable condition; pass/fail)
- [ ] AC-3: ...

---

## Manual Verification Steps (since no automated tests)

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

## Risks / Roll-back Notes

- Risks:
  - (what could go wrong, why)
- Roll-back:
  - (exact revert strategy; what to undo, what to keep)

---

## Approval Gate (mandatory)

- [ ] Spec self-reviewed by Codex
- [ ] Explicit user approval received (e.g. "승인: 진행")

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- ...

Commands run (only if user asked or required by spec):
- ...

Manual verification notes:
- (results vs Acceptance Criteria)

Notes:
- (pre-existing failures vs new issues, if any)
