---
name: sy-slate-protocol-compat
description: Enforce forward-compatible content contracts, versioning, and migration policy for NormalizedContent/RenderPlan/TTSScript/ToolResult in delegated multi-agent execution.
---

# Protocol Compatibility

## Use when
- Changing NormalizedContent, RenderPlan, TTSScript, or ToolResult
- Changing exchange contracts between v10 and math-pdf-builder-codex
- Adding fields to PersistedSlateDoc export/import paths

## Workflow
1. Read `PROJECT_BLUEPRINT.md` and `PROJECT_CONTEXT.md`.
2. Read `codex_tasks/task_071_mcp_ready_content_pipeline_spec.md` for canonical schemas.
3. Classify the change:
   - Additive: optional fields only, defaults defined.
   - Breaking: bump version and provide a migration plan.
4. If code changes are planned, update migrations and fixtures.
5. In delegated mode, run escalation gate before implementation when any of these apply:
   - breaking change
   - migration path required
   - new dependency needed
   - security/cost policy impact
6. Update docs when rules/flows change:
   - `PROJECT_BLUEPRINT.md` for invariants
   - `v10/AI_READ_ME.md` for contract or flow changes
7. Ensure JSON-safe data only and sanitize any HTML inputs.
8. For layout-related contract tasks, accept one Gemini SVG draft through user bridge only.

## Guardrails
- No breaking change without version bump + migration path.
- No tool-specific or model-specific logic in `core/`.
- Include example payloads for new versions.
- Maintain deterministic failure classification (`pre-existing` vs `new`) in validation reports.

## References
- `codex_tasks/task_071_mcp_ready_content_pipeline_spec.md`
- `PROJECT_BLUEPRINT.md`
