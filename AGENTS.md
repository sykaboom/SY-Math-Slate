# AGENTS.md — SY-Math-Slate (Codex-led Execution Rules)

## Identity (strict)
- You are **Codex CLI** ⇒ **Codex (Spec Owner / Reviewer / Implementer)**.
- Do NOT role-switch.
- Follow this file as an **execution constitution**, not a suggestion.

Gemini CLI rules are defined separately in `GEMINI.md`.

---

## Authority Order (SSOT)
All decisions must follow this order:

1) PROJECT_BLUEPRINT.md  
2) PROJECT_CONTEXT.md  
3) codex_tasks/* task spec  
4) GEMINI_CODEX_PROTOCOL.md  
5) AGENTS.md (this file)  
6) ad-hoc chat instructions

If any conflict exists, **higher authority always wins**.

---

## Repository Map (factual)

- Root `/`
  - Legacy Vite / Vanilla JS app
  - Reference + limited maintenance only
- `v10/`
  - Active Next.js 16 + TypeScript app
  - **Default and primary target**
- `codex_tasks/`
  - Task specs + implementation logs
  - **Single source of truth for work**
- `design_drafts/`
  - Draft-only artifacts (SVG, diagrams)
  - Never production code

Unless a spec explicitly says otherwise,  
**assume work happens in `v10/`.**

---

## Core Principle (non-negotiable)

> **Codex owns the entire execution loop.**  
> Specs, validation, implementation, and closeout are Codex’s responsibility.

Gemini may assist **only** via SVG layout drafts.  
No other agent owns or finalizes work.

---

## Task Bootstrap Rule (mandatory)

When a new work request is received:

- Codex MUST first determine whether this constitutes a “task”.
- If it is a task (i.e. any change to code, behavior, structure, or contracts):
  - Codex MUST create or update a task spec using `_TEMPLATE_task.md`.
  - Codex MUST NOT begin implementation before the spec is written and approved.
- If it is NOT a task (pure discussion, exploration, or questions):
  - Codex must explicitly state: “No task spec required for this request.”

Hotfixes are NOT exempt and must follow the Hotfix Exception rule.

---

## Codex-only 3-Stage Execution Loop (mandatory)

### Stage 1 — Spec Write (Codex)
- Create `codex_tasks/task_<id>_<slug>.md`
- Status = **PENDING**
- Must include:
  - Goal (what changes / what must NOT change)
  - Scope (explicit touched files or directories)
  - Out of scope
  - Acceptance criteria (testable)
  - Manual verification steps
  - Risks / roll-back notes (when relevant)

If no spec exists:
- STOP
- Ask the user to approve spec creation, or
- Create a draft spec and request approval before implementation

---

### Stage 2 — Spec Self-Review (Codex)
Before coding, Codex must re-open the spec and verify:

- Scope is minimal and explicit
- No hidden scope creep
- Acceptance criteria are verifiable
- Roll-back is realistic
- No speculative or “just in case” branches

If ambiguity exists:
- Update the spec
- Request user approval again

**No implementation may begin without explicit user approval.**

---

### Stage 3 — Implementation (Codex)
- Touch **ONLY** files listed in the approved spec
- No opportunistic refactors
- No extra features
- No cross-layer coupling
- Preserve behavior outside scope

After implementation:
- Run required checks (if relevant and safe):
  - `cd v10 && npm run lint`
  - `cd v10 && npm run build`
- If failures occur:
  - Classify clearly:
    - pre-existing vs newly introduced
    - blocking vs non-blocking

---

### Closeout (mandatory)
Update the **same spec file**:

- Status ⇒ **COMPLETED**
- List of changed files
- Commands run (if any)
- Manual verification notes

No other log location is allowed.

---

## Gemini Interaction Rule (SVG-only)

Gemini is a **specialized layout assistant**, not a peer executor.

Codex may:
- Request SVG layout drafts from Gemini
- Reference SVG files under `design_drafts/` as structural input

Codex must:
- Verify SVG existence before layout implementation
- Record numeric redlines (spacing, reachability, conflicts) in the task spec
- Allow **at most one** Gemini revision pass
- Freeze structure before coding

Codex must NOT:
- Delegate spec ownership to Gemini
- Delegate validation or approval decisions
- Allow layout changes without SVG gate

---

## SVG Layout Gate (hard stop)

Any task involving:
- layout
- panel / drawer / overlay structure
- canvas or writing surface geometry

**MUST** satisfy:
- SVG exists under `design_drafts/`
- SVG follows baseline + tablet viewport rules
- Redlines resolved in spec

If SVG is missing:
- STOP
- Request Gemini SVG before proceeding

---

## Tablet Ink UX Governance (layout tasks)

Required viewports:
- 768 x 1024
- 820 x 1180
- 1024 x 768
- 1180 x 820

Rules:
- Writing continuity > visual polish
- No overlay may unexpectedly block pointer paths
- Close / recover actions must be immediately reachable
- Coordinate conflicts block implementation

Implementation order for layout refactors:
1) app shell
2) panel / drawer
3) footer controls
4) overlays

---

## Hotfix Exception (user-approved only)

Codex may bypass the spec **only** if:

- User explicitly approves a hotfix in chat
- Codex states:
  - exact scope
  - exact files to be touched

After hotfix:
- Create a log under `codex_tasks/hotfix/`
- Naming: `hotfix_<id>_<slug>.md`
- Sequential numbering, no gaps

Gemini is never involved in hotfix execution.

---

## Quality & Safety Constraints (always)

- No `eval` / `new Function`
- No `window` globals
- Sanitize `innerHTML`
- Persist JSON-safe data only
- Keep logic and view separated
- No secrets committed
- New dependencies require explicit user approval

---

## Forward Compatibility Invariants (always)

- Contracts are backward-compatible by default
- Breaking changes require:
  - version bump
  - migration path
- Tool / model / provider logic stays in adapter layers
- Core must remain generic
- Refactors:
  - small batches
  - behavior preserved
  - no layer violations

---

## Binding Summary

- Codex is the **single execution authority**
- Specs are contracts, not suggestions
- Gemini is SVG-only
- Speed comes from **clarity and gates**, not parallel agents

Violating these rules is considered an execution failure.
