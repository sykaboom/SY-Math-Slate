# Task 071: MCP Ready Content Pipeline Spec (v10 + pdf builder)

Status: COMPLETED
Owner: Codex (spec)
Target: v10/ + cross app contract (planning only)
Date: 2026-02-06

## Goal
- What to change:
  - Define a normalized content schema that can represent text, math, media, timeline, and audio.
  - Define a tool registry and tool result contract that supports MCP and non-MCP adapters.
  - Define an orchestrator pipeline model that separates deterministic steps from generative steps.
  - Define a cross-app exchange contract so v10 and math-pdf-builder-codex can share content.
- What must NOT change:
  - No production code changes in this task.
  - No new runtime dependencies in this task.

## Scope (Codex must touch ONLY these)
Touched files/directories:
- codex_tasks/task_071_mcp_ready_content_pipeline_spec.md

Out of scope:
- Any v10 production code edits
- Any math-pdf-builder-codex repo edits
- MCP server implementation
- UI changes

## Dependencies / constraints
- New dependencies allowed? NO
- Boundary rules: core must not import features, no window globals, sanitize innerHTML, JSON-safe persistence only
- Security: iframe renderers must be sandboxed and communicate by postMessage only

## Documentation Update Check
- [ ] Structure changes (files/folders) require AI_READ_ME_MAP update
- [ ] Rules/flow changes require AI_READ_ME update

## Definitions (canonical contracts)

### 1) NormalizedContent (cross app content contract)
Purpose: tool outputs and human-authored inputs are converted into this format.

Minimal schema:
```json
{
  "type": "NormalizedContent",
  "version": "1.0",
  "locale": "ko-KR",
  "metadata": {
    "title": "Untitled",
    "subject": "math",
    "grade": "high-2",
    "tags": ["function", "graph"]
  },
  "blocks": [
    { "id": "b1", "kind": "text", "html": "<span>...</span>" },
    { "id": "b2", "kind": "math", "latex": "\\int_0^1 ..." },
    { "id": "b3", "kind": "media", "mediaRef": "asset://graph/123.png" }
  ],
  "style": {
    "fontFamily": "\"Noto Sans KR\", sans-serif",
    "fontSize": "28px",
    "fontWeight": "400",
    "color": "#ffffff"
  },
  "audio": [
    { "scriptId": "tts-1", "blockIds": ["b1", "b2"] }
  ]
}
```

Rules:
- HTML must be sanitized and class allowlisted before ingestion.
- Math uses LaTeX only. No raw HTML math.
- mediaRef is a logical reference, not a raw URL.

### 2) RenderPlan (layout and timeline)
Purpose: drive v10 rendering and timing without tool-specific logic.

Minimal schema:
```json
{
  "type": "RenderPlan",
  "version": "1.0",
  "pages": [
    {
      "pageId": "p1",
      "columns": 2,
      "steps": [
        { "stepIndex": 0, "blockIds": ["b1"] },
        { "stepIndex": 1, "blockIds": ["b2", "b3"] }
      ]
    }
  ]
}
```

### 3) TTSScript
Purpose: a stable contract for TTS providers.

Minimal schema:
```json
{
  "type": "TTSScript",
  "version": "1.0",
  "segments": [
    { "id": "seg-1", "text": "..." , "lang": "ko-KR" }
  ]
}
```

### 4) ToolResult
Purpose: unify outputs from any tool (LLM, TTS, renderer).

Minimal schema:
```json
{
  "toolId": "llm.openai.gpt-4o-mini",
  "toolVersion": "2026-02",
  "status": "ok",
  "raw": { },
  "normalized": { },
  "diagnostics": {
    "latencyMs": 1234,
    "costUsd": 0.012,
    "warnings": []
  }
}
```

## Tool Registry (MCP ready)
Purpose: allow dynamic tool binding and swapping.

Required fields:
- toolId (stable string)
- category (llm, tts, renderer, transformer, validator)
- inputSchema / outputSchema
- capabilities (languages, maxInputTokens, maxOutputTokens, mediaTypes)
- execution (mcpServerId or httpEndpoint)
- policy (rateLimit, costTier, trustLevel)

## Orchestrator Pipeline Model
Purpose: manage deterministic vs generative steps.

Step types:
- Deterministic: normalize, validate, layout, merge
- Generative: LLM explain, paraphrase, script
- Renderer: iframe graph, html to image, video assembly
- Validator: schema checks, safety checks

Rules:
- Deterministic steps must be repeatable and cacheable.
- Generative steps must persist prompts and seeds for audit.
- Failures in renderer must return partial results with diagnostics.

## MCP Gateway (adapter layer)
Purpose: connect to multiple MCP servers and map them into Tool Registry.

Responsibilities:
- discovery of MCP resources and tools
- input/output schema conversion
- authentication and policy enforcement
- unified ToolResult generation

## Local and Remote Model Support
Purpose: allow local open source models and remote providers.

Rules:
- Local models expose MCP endpoints on user machines.
- Remote models are accessed only by server-side adapters.
- User policy controls which tools are allowed per workspace.

## Cross App Exchange Contract
Purpose: share content between v10 and math-pdf-builder-codex.

Contract:
- NormalizedContent is the exchange payload.
- RenderPlan is optional for pdf builder.
- v10 persists to PersistedSlateDoc but exports NormalizedContent for interchange.

## Acceptance criteria (must be testable)
- [ ] NormalizedContent, RenderPlan, TTSScript, ToolResult schemas are defined with JSON examples.
- [ ] Tool Registry requirements and MCP adapter responsibilities are specified.
- [ ] Orchestrator pipeline rules separate deterministic and generative steps.
- [ ] Cross app exchange contract is defined for v10 and math-pdf-builder-codex.
- [ ] Security and sandbox rules are listed.

## Manual verification steps (since no automated tests)
- Read this spec and confirm all required sections are present.
- Confirm that the schema examples can represent text, math, media, and audio.

## Risks / roll-back notes
- Risk: schemas diverge from existing PersistedSlateDoc fields.
- Risk: tool registry over-specifies features too early.
- Roll-back: treat this as planning-only and revise before implementation.

## Open questions
- How to version NormalizedContent without breaking older exports?
- What is the minimal block set for pdf builder v1 compatibility?
- How to map iframe renderer output into asset pipelines?
- What is the default tool selection policy for a new workspace?

---

## Implementation Log (Codex fills)
Status: COMPLETED
Changed files:
- codex_tasks/task_071_mcp_ready_content_pipeline_spec.md

Commands run (only if user asked):
- None

Notes:
- Planning-only spec finalized.
