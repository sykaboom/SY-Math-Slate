---
name: sy-slate-spec-batch-factory
description: Create and review multiple task specs in 6-slot waves, then hand off approved spec batches to implementation waves.
---

# Spec Batch Factory

## Use when
- Building many specs from one initiative (for example 10+ tasks)
- Preparing a full execution batch before implementation
- Standardizing spec quality before parallel coding

## Workflow
1. Intake and normalize:
   - Convert each requested work item into template fields:
     goal, scope, out-of-scope, AC, verification, risk/rollback.
2. Writer waves (6-slot max):
   - Assign up to 6 spec-writer agents in parallel.
   - Queue remainder in next wave (`6 + N` pattern).
3. Reviewer waves (6-slot max):
   - Assign up to 6 spec-reviewer agents.
   - Validate ambiguity, scope creep, unverifiable ACs, rollback realism.
4. Codex consolidation:
   - Apply accepted fixes.
   - Enforce naming and path standards in `codex_tasks/`.
5. Gate and package:
   - Produce ready list and blocked list.
   - Mark each spec with explicit approval state.
6. Hand off:
   - Approved specs go to implementer waves.
   - Blocked specs return to the next review wave only.

## Output contract
- Per spec:
  - Draft status and missing items
  - Review findings
  - Ready/blocked decision
- Batch summary:
  - Total specs, wave count, dependency notes, ownership constraints

## Gemini rule
- If any spec needs layout structure, codex requests one SVG draft via user bridge.
- No multi-round Gemini regeneration in this batch flow.

## Guardrails
- No production code edits in spec waves.
- No speculative "just in case" branches without evidence.
- Maintain one authoritative spec file per task.

## References
- `codex_tasks/_TEMPLATE_task.md`
- `codex_tasks/task_097_subagent_orchestration_governance.md`
