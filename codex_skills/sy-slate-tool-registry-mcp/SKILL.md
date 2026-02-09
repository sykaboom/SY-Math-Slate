---
name: sy-slate-tool-registry-mcp
description: Define and integrate tools (LLM/TTS/renderer/validator) via Tool Registry and adapter boundaries with deterministic ToolResult outputs and DAG-safe execution.
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
3. Run DAG order for contract chain:
   - Tool registry contract first
   - Adapter boundary integration second
   - Parallelize only non-overlapping files.
4. Implement adapter in `features/` (never in `core/`).
5. Normalize outputs to `ToolResult` and then to `NormalizedContent` / `TTSScript` / `RenderPlan` as needed.
6. Enforce policy: auth, rate limits, cost tier, timeouts.
7. Emit diagnostics (latency, cost, warnings) in ToolResult.
8. In delegated mode, escalate only when required:
   - breaking change
   - new dependency
   - migration requirement
   - security/cost policy impact
   - Gemini SVG draft request needed for layout-related tasks

## Guardrails
- No secrets in client code.
- No direct network calls from `core/`.
- Tool-specific types must stay inside adapters.
- Keep blocker-only interim reporting and one final packet.
- If layout artifacts are needed, allow a single Gemini SVG draft via user bridge.

## References
- `codex_tasks/task_071_mcp_ready_content_pipeline_spec.md`
- `PROJECT_BLUEPRINT.md`
