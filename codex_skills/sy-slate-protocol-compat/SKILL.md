---
name: sy-slate-protocol-compat
description: Enforce forward-compatible content contracts, versioning, and migrations for NormalizedContent/RenderPlan/TTSScript/ToolResult across v10 and pdf-builder.
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
5. Update docs when rules/flows change:
   - `PROJECT_BLUEPRINT.md` for invariants
   - `v10/AI_READ_ME.md` for contract or flow changes
6. Ensure JSON-safe data only and sanitize any HTML inputs.

## Guardrails
- No breaking change without version bump + migration path.
- No tool-specific or model-specific logic in `core/`.
- Include example payloads for new versions.

## References
- `codex_tasks/task_071_mcp_ready_content_pipeline_spec.md`
- `PROJECT_BLUEPRINT.md`
