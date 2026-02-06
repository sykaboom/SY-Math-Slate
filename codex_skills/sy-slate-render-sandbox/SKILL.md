---
name: sy-slate-render-sandbox
description: Integrate iframe or external renderers safely with sandboxed execution, postMessage, and asset-based outputs.
---

# Renderer Sandbox

## Use when
- Adding iframe-based renderers (python, HTML, graph, function plot)
- Capturing images or video from external renderers

## Workflow
1. Run renderer in sandboxed iframe/service only.
2. Use `postMessage` for commands and results; enforce origin allowlist.
3. Provide timeouts, cancelation, and partial ToolResult on failure.
4. Output assets must be referenced via logical refs (e.g., `asset://...`).
5. Validate outputs (type, size, mime) before ingesting.

## Guardrails
- No direct DOM access across frames.
- No unsafe inline scripts or `eval`.
- Do not persist raw HTML from renderers without sanitization.

## References
- `PROJECT_BLUEPRINT.md`
- `codex_tasks/task_071_mcp_ready_content_pipeline_spec.md`
