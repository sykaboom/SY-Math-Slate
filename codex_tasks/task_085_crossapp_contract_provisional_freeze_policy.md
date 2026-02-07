# Task 085: Cross-App Contract Provisional Policy + Freeze Gate (v10 Lead)

Status: COMPLETED
Owner: Codex (spec)
Target: v10 + cross-app contract docs (planning/spec only)
Date: 2026-02-07

## Goal
- What to change:
  - Align v10 and pdf-builder on provisional contract policy where v10 leads and pdf-builder follows via adapters.
  - Define minimal draft exchange payload with required/optional fields and draft versioning.
  - Define explicit freeze gate and post-freeze breaking-change policy (including migration expectations).
  - Reaffirm MCP/tool boundary: `ToolResult -> normalize -> exchange payload -> app model`.
- What must NOT change:
  - No production code changes in this task.
  - No immediate schema freeze (v1 freeze is out of scope until gate is met).
  - No dependency changes.

## Scope (Codex must touch ONLY these)
Touched files/directories:
- `codex_tasks/task_085_crossapp_contract_provisional_freeze_policy.md`

Out of scope:
- Any `v10/src/**` implementation
- Any `math-pdf-builder-codex` repository changes
- MCP server implementation

## Design Artifacts (required for layout/structure changes)
- [x] Layout/structure changes included: NO
- [x] SVG path in `design_drafts/`: not required
- [x] SVG includes `viewBox` with explicit width/height and ratio label: N/A
- [x] Codex must verify SVG file exists before implementation: N/A

## Policy alignment (locked)
1) Product lead
- v10 is the lead app for exchange contract direction.
- pdf-builder consumes via adapter and follows lead contract changes.

2) Contract lifecycle
- Current phase is `provisional` / `draft`.
- `v1 freeze` is deferred until freeze gate criteria are satisfied.

3) Contract design principle
- Start with minimal, standard fields only.
- Keep provider/vendor-specific fields out of contract body.
- Vendor details stay in adapter-specific `raw`/`diagnostics` zones.

4) Pipeline invariant
- Required flow: `ToolResult -> normalize -> exchange payload -> app model`.
- No ad-hoc provider parsing logic injected into app core.

5) Legacy stance
- Legacy full compatibility is not mandatory by default.
- One-shot migration import tool is optional and can be considered when needed.

## Draft exchange payload (proposal to validate)
Purpose: minimal interoperable payload for v10 <-> pdf-builder.

### A) Required fields
- `type`: fixed literal (`NormalizedContent`)
- `version`: draft semver-like string (e.g. `0.3.0-draft`)
- `blocks`: ordered content blocks
- `metadata.locale`

### B) Optional fields
- `metadata` extras (`title`, `subject`, `grade`, `tags`)
- `style` defaults (font/color sizing hints)
- `audio` links (e.g. TTSScript segment references)
- `renderHints` (non-authoritative, renderer can ignore)

### C) Block minimum shape
- `id`: stable block id
- `kind`: `text | math | media | break`
- Content payload:
  - `text`: sanitized inline HTML or plain text policy field
  - `math`: LaTeX source
  - `media`: logical asset reference (`asset://...`)

### D) Draft version policy
- During provisional phase:
  - Additive changes: bump MINOR (e.g. `0.3.x -> 0.4.0-draft`)
  - Patch clarifications: bump PATCH
  - Breaking changes: allowed only with documented migration note in task/docs
- At freeze:
  - move to `1.0.0`
  - breaking changes require MAJOR bump + migration path

## Example payloads (draft)
### Example 1: Text + Math
```json
{
  "type": "NormalizedContent",
  "version": "0.3.0-draft",
  "metadata": { "locale": "ko-KR", "title": "함수 기본" },
  "blocks": [
    { "id": "b1", "kind": "text", "text": "함수의 정의를 봅시다." },
    { "id": "b2", "kind": "math", "latex": "f(x)=x^2+1" }
  ]
}
```

### Example 2: Text + Image
```json
{
  "type": "NormalizedContent",
  "version": "0.3.0-draft",
  "metadata": { "locale": "ko-KR" },
  "blocks": [
    { "id": "b1", "kind": "text", "text": "그래프를 참고하세요." },
    {
      "id": "b2",
      "kind": "media",
      "mediaRef": "asset://images/graph-001.png",
      "mediaType": "image"
    }
  ]
}
```

### Example 3: Mixed with optional style/audio
```json
{
  "type": "NormalizedContent",
  "version": "0.3.0-draft",
  "metadata": { "locale": "ko-KR", "subject": "math" },
  "style": { "fontFamily": "Noto Sans KR", "fontSize": "28px", "color": "#ffffff" },
  "audio": [{ "scriptId": "tts-01", "blockIds": ["b1", "b2"] }],
  "blocks": [
    { "id": "b1", "kind": "text", "text": "다음 식을 전개합니다." },
    { "id": "b2", "kind": "math", "latex": "(x+1)^2=x^2+2x+1" }
  ]
}
```

## Freeze gate definition (for future v1 lock)
`v1 freeze` can start only when all conditions below are met:
1) v10 export/import for `text + math + image` round-trip verified.
2) pdf-builder adapter import/export for same payload family verified.
3) At least 2 tool providers normalize through same `ToolResult -> normalize` path.
4) Required error-path behavior documented (invalid payload, missing asset, unsupported kind).
5) Cross-app review sign-off (v10 + pdf-builder maintainers).

## Post-freeze breaking change policy (v1+)
- Breaking change requires:
  - MAJOR version bump
  - migration document (old -> new mapping)
  - one-shot migration tool or script guidance
- No silent field repurpose.
- Deprecated fields need sunset note and removal window.

## MCP / tool boundary rules (non-negotiable)
- `ToolResult` remains standard output envelope.
- Provider-specific parsing/conversion stays in adapter layer.
- App core consumes normalized payload only.
- No direct provider branching spaghetti in core features/store code.

## Speculative Defense Check
- [x] Any defensive branches added? NO
- [x] Evidence provided (real input, spec, or bug report): N/A
- [x] Sunset criteria defined (when to remove): N/A

## Dependencies / constraints
- New dependencies allowed? NO
- Must align with:
  - `codex_tasks/task_071_mcp_ready_content_pipeline_spec.md`
  - `PROJECT_CONTEXT.md` (v10 lead / AI hub vision)
  - `PROJECT_BLUEPRINT.md` forward compatibility invariants

## Documentation Update Check
- [ ] 구조 변경(파일/폴더 추가·이동·삭제) 발생 시: `node scripts/gen_ai_read_me_map.mjs` 실행하여 `v10/AI_READ_ME_MAP.md` 갱신 여부 확인
- [ ] 규칙/의미 변경(레이어 규칙, 불변조건, 핵심 플로우 등) 발생 시: `v10/AI_READ_ME.md` 갱신 여부 확인

## Acceptance criteria (must be testable)
- [x] Provisional policy is explicitly documented (no premature freeze).
- [x] Minimal payload draft includes required/optional split.
- [x] Versioning draft and freeze gate are explicit.
- [x] 2-3 concrete payload examples are included (text+math, image 포함).
- [x] MCP/tool boundary rule is explicit and enforceable in future tasks.

## Manual verification steps (since no automated tests)
- Read this spec and verify all five requested sections exist.
- Check examples are JSON-safe and vendor-neutral.
- Confirm freeze gate is objective enough to be used as go/no-go.

## Risks / roll-back notes
- Risk: draft period prolonged without gate tracking can create drift.
- Risk: minimal schema might miss near-term real fields.
- Roll-back: keep this as policy baseline and revise with additive updates only.

---

## Implementation Log (Codex fills)
Status: COMPLETED
Changed files:
- `codex_tasks/task_085_crossapp_contract_provisional_freeze_policy.md`

Commands run (only if user asked):
- `sed -n '1,320p' codex_tasks/task_085_crossapp_contract_provisional_freeze_policy.md`

Notes:
- Spec-only task finalized as policy baseline for cross-app provisional contract and freeze gate.
