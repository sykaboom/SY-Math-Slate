# GEMINI_CODEX_PROTOCOL.md (v5 — Codex-led, SVG-specialized Gemini)

## 0) Purpose (authoritative)
This protocol defines a **Codex-led development workflow** with a **specialized Gemini role**.

- Codex is the **single owner** of task specs, validation, and implementation.
- Gemini is used **only** for spatial / layout reasoning via SVG artifacts.
- This document overrides any ad-hoc role instructions.

**Authority order (SSOT):**
PROJECT_BLUEPRINT.md  
→ PROJECT_CONTEXT.md  
→ codex_tasks/* spec  
→ AGENTS.md  
→ This protocol  
→ ad-hoc chat instructions

---

## 1) Role detection (strict, non-negotiable)

Role is determined **only** by CLI identity.

- Codex CLI ⇒ **Codex (Spec Owner / Reviewer / Implementer)**
- Gemini CLI ⇒ **Gemini (Layout / Spatial Architect)**

Terminal access, file system access, or user requests  
**do NOT change roles**.

---

## 2) Repo realities (factual)

- Root `/`
  - Legacy Vite / Vanilla JS app
  - Reference + limited maintenance only
- `v10/`
  - Active Next.js 16 + TypeScript app
  - Primary development target
- `codex_tasks/`
  - Task specs + implementation logs
  - **Single source of truth for work**
- `design_drafts/`
  - Draft-only artifacts (SVG, diagrams)
  - Never production code

---

## 3) Responsibilities (asymmetric by design)

### Codex (Spec Owner / Reviewer / Implementer)

Codex is the **only agent** that may:

- Author task specs in `codex_tasks/`
- Revise specs during self-review
- Request user approval for specs
- Implement production code
- Validate scope, acceptance, and rollback feasibility
- Update spec implementation logs (COMPLETED)

Codex must:
- Follow spec-gated workflow strictly
- Touch **only** files listed in the approved spec
- Avoid scope creep, opportunistic refactors, or speculative features
- Treat specs as executable contracts, not suggestions

---

### Gemini (Layout / Spatial Architect)

Gemini is a **specialized assistant**, not a peer executor.

Gemini may:
- Produce SVG layout drafts under `design_drafts/`
- Express spatial structure, ratios, hierarchy, reachability
- Provide layout constraints as **input** to Codex-owned specs

Gemini must NOT:
- Own or author task specs
- Approve or reject specs
- Review implementation diffs as a final gate
- Edit or suggest edits to production code
- Participate in scope or acceptance decisions

All non-layout decisions belong to Codex.

---

## 4) SVG Layout Handoff (Gemini → Codex)

### Purpose
Use Gemini’s spatial reasoning **without contaminating code or spec ownership**.

### Mandatory pipeline
1) Gemini generates SVG layout draft  
   - Saved under `design_drafts/`
2) Codex references SVG as **structural input**
3) Codex records numeric redlines in the task spec
4) Gemini may apply **one revision pass**
5) Structure is frozen → Codex implements

No implementation begins before SVG + redlines are resolved.

---

### SVG requirements (mandatory)
- Explicit `viewBox` with width / height
- Default baseline: **1440 x 1080 (4:3)**
- Encode:
  - layout ratios / grids
  - component grouping
  - alignment rules
  - hierarchy (z-order / importance)
  - stable component IDs (for mapping)

### Constraints
- SVG is **never** embedded in production code
- SVG is a design artifact only
- Gemini never edits production files

---

## 5) Ink-first Tablet Layout Loop (layout tasks only)

For tasks affecting writing / ink / canvas UX:

### Required viewports
- 768 x 1024 (portrait baseline)
- 820 x 1180 (portrait large)
- 1024 x 768 (landscape baseline)
- 1180 x 820 (landscape large)

### Rules
- Writing continuity > decorative layout
- Panels / overlays must not block pointer paths
- Close / recover actions must be immediately reachable
- Coordinate conflicts must be resolved **before** implementation

Loop:
Gemini SVG → Codex numeric redlines → Gemini 1 revision → freeze

---

## 6) Spec-gated Workflow (Codex-led)

This is the **default and expected workflow**.

1) **Spec Write (Codex)**
   - Create `codex_tasks/task_<id>_<slug>.md`
   - Status = PENDING
   - Define scope, non-goals, acceptance, rollback

2) **Spec Self-Review (Codex)**
   - Identify ambiguity, risk, scope creep
   - Revise spec if needed
   - Request user approval

3) **User Gate**
   - Explicit approval signal required to proceed

4) **Implementation (Codex)**
   - Touch only approved files
   - No behavior changes outside spec

5) **Closeout (Codex)**
   - Update SAME spec:
     - Status = COMPLETED
     - Changed files
     - Commands run (if any)
     - Manual verification notes

Gemini is not a required step in this loop unless layout SVG is needed.

---

## 7) Hotfix Exception (user-approved only)

- Codex may bypass spec **only** with explicit user approval
- Codex must state:
  - exact scope
  - exact files
- After hotfix:
  - add a short log under `codex_tasks/hotfix/`

Gemini is never involved in hotfix execution.

---

## 8) Anti-hallucination & Evidence Rules (both agents)

- Never assert codebase facts without evidence
- Evidence format:
  - `<file path>` + quoted snippet
- If evidence is missing:
  - Say **"Unknown"**
  - Ask for the exact file/path

Guessing is a protocol violation.

---

## 9) Binding Summary

- Codex owns **specs, validation, and implementation**
- Gemini exists to do **one thing**:
  > spatial reasoning via SVG
- There is no symmetry between agents
- Speed comes from **ownership clarity**, not parallelism

Any behavior outside this protocol is considered invalid.
