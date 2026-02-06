---
name: sy-slate-crossapp-exchange
description: Maintain v10 and math-pdf-builder-codex interoperability using NormalizedContent as the exchange contract.
---

# Cross-App Exchange

## Use when
- Exporting/importing between v10 and math-pdf-builder-codex
- Changing NormalizedContent or exchange mapping rules

## Workflow
1. Read `codex_tasks/task_071_mcp_ready_content_pipeline_spec.md`.
2. Treat NormalizedContent as the canonical exchange payload.
3. Keep RenderPlan optional (v10 may use it, pdf builder may ignore it).
4. Provide mapping functions at the adapter layer (not core).
5. Version any breaking mapping changes and provide migration notes.

## Guardrails
- Preserve backward compatibility for existing exports.
- Do not embed app-specific fields inside NormalizedContent.

## References
- `codex_tasks/task_071_mcp_ready_content_pipeline_spec.md`
- `PROJECT_CONTEXT.md`
