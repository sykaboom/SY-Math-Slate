# GEMINI_CODEX_PROTOCOL.md (v4 — repo-aligned)

## 0) Purpose
Two-agent collaboration rule: PROJECT_BLUEPRINT.md > PROJECT_CONTEXT.md > codex_tasks spec > ad-hoc chat instructions

## 1) Role detection (strict)
- Role is determined by CLI identity:
  - Codex CLI => Codex (Implementer)
  - Gemini CLI => Gemini (Architect/Reviewer)
- Terminal access does NOT change the role (even if requested).

## 2) Repo realities (important)
- This repo contains two apps:
  - Root `/` = legacy Vite / Vanilla JS (reference + limited maintenance)
  - `v10/` = active Next.js 16 + TypeScript app (primary development target)
- Task specs + logs live in `codex_tasks/`
- Design drafts live in `design_drafts/`

## 3) Responsibilities
### Gemini (Architect / Reviewer)
- Read-only for existing production code.
- Writes initial task spec drafts in `codex_tasks/`.
- For design-heavy NEW frontend features: may create self-contained drafts in `design_drafts/` only.
- For layout/structure work: output SVG layout drafts only (see SVG handoff below).
- Must not edit existing production files.

### Codex (Implementer / Integrator)
- Reviews and may edit task specs after receiving the Gemini draft.
- Any spec edits must be reviewed by the user before implementation.
- Implements tasks in production code.
- Consumes SVG layout drafts as structural specs; never embeds SVG into production code.
- Validates spec quality BEFORE coding.
- Touches only the files explicitly listed in the spec.
- Runs commands/tests only when explicitly asked.
- Commits/pushes only when explicitly asked.

## 3.1) SVG Layout Handoff (Gemini -> Codex)
Purpose: use Gemini's spatial reasoning to design stable layout structure without touching code.

### Pipeline (mandatory)
1) Gemini CLI: "Generate SVG for this screen structure." Save under `design_drafts/`.
2) Codex CLI: "Implement UI from SVG structure + rules." Do NOT embed SVG in code.

### Gemini SVG requirements (mandatory)
- Must include `viewBox` with explicit width/height and a labeled ratio.
- Default baseline size: **1440 x 1080 (4:3)** aligned with v10 board ratio.
- Optional secondary variant: **1920 x 1080 (16:9)** when presentation mode needs it.
- Must encode:
  - layout ratios and grids (if any)
  - component relationships and grouping
  - alignment rules (edges, centers, baselines)
  - hierarchy (visual importance / z-order)
  - stable component IDs that Codex can map to code

### Constraints
- SVG is a design artifact only; it must NOT be embedded in production code.
- Gemini must not edit production files.

## 4) Workflow (mandatory)
1) Spec Draft (Gemini): `codex_tasks/task_<id>_<desc>.md` with status = PENDING
2) Review + Edit (Codex): review spec; if missing scope/acceptance/touched files -> edit the spec and request user review/approval
3) Implement (Codex): minimal changes within approved scope
4) Closeout (Codex): update the SAME spec file status = COMPLETED, include:
   - changed files
   - commands run (if any)
   - manual verification notes
5) Verify (Gemini/User): review diff/results vs acceptance criteria

## 4.1) Hotfix exception (user-approved)
- For urgent, small-scope fixes, Codex may proceed without a spec **only** if the user explicitly approves in chat.
- Codex must state the exact scope and files before editing.
- After the hotfix, add a brief note in `codex_tasks/` (new hotfix log or append to the closest task log).

## 5) Spec quality checklist (Codex gate)
A spec must include:
- Goal (what changes, what does NOT change)
- Scope: explicit touched file list (or directories)
- Acceptance criteria / manual verification steps
- Risks / roll-back notes (when relevant)
If any item is missing => update the spec and request user review/approval before coding.

## 6) Safety / Quality guardrails
- No eval / new Function
- No window globals
- innerHTML must be sanitized
- Keep logic and view separated
- Persist only JSON-safe data
