---
name: sy-slate-tool-registry-mcp
description: Define and integrate tools (LLM/TTS/renderer/validator) via Tool Registry and MCP adapters with consistent ToolResult outputs.
---

# Tool Registry + MCP Adapters

## Use when
- Adding a new LLM, TTS, renderer, transformer, or validator
- Changing Tool Registry fields or ToolResult structure
- Connecting to MCP servers or adding new adapters

## Workflow
1. Read `codex_tasks/task_071_mcp_ready_content_pipeline_spec.md`.
2. Register tool entry with required fields:
   - `toolId`, `category`, `inputSchema`, `outputSchema`
   - `capabilities`, `execution`, `policy`
3. Implement adapter in `features/` (never in `core/`).
4. Normalize outputs to `ToolResult` and then to `NormalizedContent` / `TTSScript` / `RenderPlan` as needed.
5. Enforce policy: auth, rate limits, cost tier, timeouts.
6. Emit diagnostics (latency, cost, warnings) in ToolResult.

## Guardrails
- No secrets in client code.
- No direct network calls from `core/`.
- Tool-specific types must stay inside adapters.

## References
- `codex_tasks/task_071_mcp_ready_content_pipeline_spec.md`
- `PROJECT_BLUEPRINT.md`
