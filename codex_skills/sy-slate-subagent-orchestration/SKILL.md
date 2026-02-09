---
name: sy-slate-subagent-orchestration
description: Run delegated, one-click execution with a 6-slot sub-agent wave model (spec writing/review, implementation, review+verification, and escalation handling).
---

# Sub-agent Orchestration

## Use when
- Running delegated execution mode from one user directive
- Coordinating multi-task or multi-spec work with sub-agents
- Needing blocker-only progress updates and one executive final report

## Workflow
1. Confirm intake package:
   - Goal, priority, constraints, stop conditions.
2. Build DAG:
   - Split independent vs dependency-bound tasks.
   - Define ownership lock (one file, one implementer at a time).
3. Run waves with max 6 slots:
   - Wave A: spec writer agents
   - Wave B: spec reviewer agents
   - Codex consolidates and decides go/no-go
   - Wave C: implementer agents
   - Wave D: reviewer+verifier pass (single loop only)
4. Rotate pools between waves:
   - Close completed agents, spawn next wave roles as needed.
5. Handle escalations only when required:
   - Breaking change
   - New dependency
   - Security/cost policy impact
   - Migration requirement
   - Gemini SVG draft request required
6. Publish final executive packet:
   - Changed files
   - Risks/regressions
   - Gate results (`pre-existing` vs `new`)
   - Decision items only when escalation exists

## Gemini rule
- Gemini is layout-draft only.
- Codex prepares SVG request brief, user relays to Gemini.
- Accept exactly one SVG draft cycle (no regeneration loop).

## Guardrails
- Keep implementation within approved spec scope.
- Do not allow cross-owner file edits in the same wave.
- Keep reviewer+verifier to one pass to prevent infinite loops.
- If sub-agents are disabled, fall back to single-Codex mode immediately.

## References
- `codex_tasks/task_097_subagent_orchestration_governance.md`
- `PROJECT_BLUEPRINT.md`
