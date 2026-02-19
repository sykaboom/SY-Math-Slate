# Task 317: Design SSOT Docs Pack (Vibe Coding Consistency)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-19

---

## Goal (Base Required)
- What to change:
  - Add a machine-first design governance doc pack so design consistency is enforced by repo artifacts, not ad-hoc chat memory.
  - Convert the agreed rules (token-first colors, minimal accent strategy, structured prompting) into reusable docs for AI agents and human collaborators.
- What must NOT change:
  - No runtime behavior/code path changes in React components.
  - No theme token schema changes in this task.

---

## Scope (Base Required)

Touched files/directories:
- `v10/docs/design/DESIGN_SYSTEM_BLUEPRINT.md` (new)
- `v10/docs/design/UI_GOLDEN_SCREEN.md` (new)
- `v10/docs/design/LLM_DESIGN_PROMPT_TEMPLATE.md` (new)

Out of scope:
- Any TS/TSX runtime edits
- Any CSS token edits
- Any policy/role/session behavior changes

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Docs must align with existing tokenized theme architecture (`core/theme`, `core/themes`, `features/theme`, `features/mod-studio/theme`).
  - Must avoid tool lock-in language as hard requirement; external MCP/Figma use remains optional.
- Compatibility:
  - Docs should be additive and non-breaking for current workflows.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-DESIGN-SSOT-1
- Depends on tasks:
  - []
- Enables tasks:
  - `task_318`
- Parallel group:
  - G-DESIGN-DOCS
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `mid`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 3
- Files shared with other PENDING tasks:
  - none
- Cross-module dependency:
  - NO
- Parallelizable sub-units:
  - 2
- Estimated single-agent duration:
  - ~25min
- Recommended mode:
  - DELEGATED
- Batch-eligible:
  - YES
  - If YES, mention ordering/file-lock constraints.
- Rationale:
  - Pure documentation creation with isolated paths is safe for delegated execution and quick review.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- Execution mode: DELEGATED
- Delegation chain scope:
  - `task_317` doc drafting + syntax/contract review
- Assigned roles:
  - Spec-Writer: Codex
  - Spec-Reviewer: Codex
  - Implementer-A: docs author
  - Implementer-B: docs reviewer
  - Implementer-C: n/a
  - Reviewer+Verifier: gate verifier
- File ownership lock plan:
  - One implementer owns one markdown file at a time.
- Parallel slot plan:
  - max 6 active slots
- Scheduler plan (required in delegated mode):
  - Slot allocation mode:
    - DYNAMIC
  - Slot priority rule (DYNAMIC only):
    - shortest-job-first + file-conflict-avoidance
  - Requested orchestration mode:
    - max orchestration mode on
  - Initial slot split:
    - 2 executors + 1 reviewer
  - Ready-queue refill trigger:
    - on each completed doc file
  - Agent close/reuse policy:
    - close completed agent immediately, reuse slot for pending doc/review
  - Heartbeat policy:
    - Soft ping threshold: 90s
    - Reassignment threshold: 5m
    - Long-running exceptions: n/a (docs only)
  - Reassignment safety rule:
    - only after two unanswered pings and no diff progress
- Delegated closeout metrics:
  - Peak active slots: 2
  - Average active slots: 2.0
  - Slot refill count: 0
  - Reassignment count: 0

---

## Optional Block C — Hotfix Exception

- [x] Applies: NO

---

## Optional Block D — Speculative Defense Check

- [x] Applies: YES
- Evidence (real input, spec, or bug report):
  - Repeated UX/design drift due ad-hoc prompting and inconsistent palette usage.
- Sunset criteria:
  - Keep as permanent governance docs unless replaced by stricter SSOT.

---

## Optional Block E — Documentation Update Check

- [x] Applies: YES
- [x] Structure changes (file/folder add/move/delete):
  - Run `node scripts/gen_ai_read_me_map.mjs`
  - Verify `v10/AI_READ_ME_MAP.md` update if needed
- [ ] Semantic/rule changes:
  - Verify `v10/AI_READ_ME.md` update if needed

---

## Acceptance Criteria (Base Required)

- [x] AC-1: `v10/docs/design/` contains three new docs with clear headings and actionable rules.
- [x] AC-2: Docs define token-first color rules and explicitly separate design SSOT vs tool-specific references.
- [x] AC-3: `LLM_DESIGN_PROMPT_TEMPLATE.md` provides copy-ready structured prompt format for layout/style generation.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: open each new file and verify required sections
   - Expected result: complete docs with no placeholder text
   - Covers: AC-1, AC-2

2) Step:
   - Command / click path: inspect template file headings
   - Expected result: includes constraints, tokens, viewport matrix, and output format
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Overly prescriptive wording could conflict with future creative UI experiments.
- Roll-back:
  - Remove newly added docs and reintroduce as advisory notes in a follow-up task.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/docs/design/DESIGN_SYSTEM_BLUEPRINT.md`
- `v10/docs/design/UI_GOLDEN_SCREEN.md`
- `v10/docs/design/LLM_DESIGN_PROMPT_TEMPLATE.md`

Commands run (only if user asked or required by spec):
- `node scripts/gen_ai_read_me_map.mjs`

## Gate Results (Codex fills)

- Lint:
  - N/A
- Build:
  - N/A
- Script checks:
  - PASS

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - none
- Newly introduced failures:
  - none
- Blocking:
  - NO
- Mitigation:
  - none

Manual verification notes:
- All three docs created with required sections (token-first policy, viewport matrix, structured prompt template).

Notes:
- Implemented via delegated execution with two parallel worker agents and file ownership separation.
