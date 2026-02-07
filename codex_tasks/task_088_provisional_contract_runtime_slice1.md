# Task 088: Provisional Contract Runtime Slice 1 (v10 Lead)

Status: PENDING
Owner: Codex (spec)
Target: v10/
Date: 2026-02-08

## Goal
- What to change:
  - Implement the first runtime slice for the provisional cross-app contract defined in `task_085`.
  - Add canonical contract types and runtime guards for:
    - `NormalizedContent` (`0.3.0-draft`)
    - `ToolResult` envelope
  - Add adapter-layer mapping boundary so core features consume normalized payload only.
  - Add deterministic conversion path from current v10 document model to provisional `NormalizedContent`.
- What must NOT change:
  - No schema freeze (`1.0.0`) in this task.
  - No provider-specific parsing logic in core feature/store modules.
  - No new dependencies.

## Scope (Codex must touch ONLY these)
Touched files/directories for this spec draft:
- `codex_tasks/task_088_provisional_contract_runtime_slice1.md`

Planned implementation scope (after approval):
- `v10/src/core/contracts/normalizedContent.ts` (new)
- `v10/src/core/contracts/toolResult.ts` (new)
- `v10/src/core/contracts/index.ts` (new)
- `v10/src/core/export/exportPipeline.ts`
- `v10/src/core/extensions/connectors.ts`
- `v10/src/core/persistence/buildPersistedDoc.ts` (read-only integration point validation; modify only if needed)

Out of scope:
- `math-pdf-builder-codex` repo edits
- MCP server implementation
- `RenderPlan` and `TTSScript` full runtime implementation (reserved for follow-up task)
- UI/layout changes

## Dependency alignment (locked)
- Must align with:
  - `codex_tasks/task_071_mcp_ready_content_pipeline_spec.md`
  - `codex_tasks/task_085_crossapp_contract_provisional_freeze_policy.md`
  - `PROJECT_BLUEPRINT.md` section 6 (forward compatibility)
  - `PROJECT_CONTEXT.md` (v10 lead app principle)

## Contract shape for this slice
### 1) NormalizedContent (`0.3.0-draft`)
Required:
- `type: "NormalizedContent"`
- `version: "0.3.0-draft"`
- `metadata.locale`
- `blocks[]`

Optional:
- `metadata.title | subject | grade | tags`
- `style`
- `audio`
- `renderHints`

Block kinds in this slice:
- `text`
- `math`
- `media`
- `break`

### 2) ToolResult envelope
Required:
- `toolId`
- `toolVersion`
- `status`
- `raw`
- `normalized`
- `diagnostics`

Rule:
- `normalized` must contain normalized payload only.
- Provider-specific content stays in `raw` / `diagnostics`.

## Runtime behavior requirements
1) Guard functions
- Add runtime type guards / validators for `NormalizedContent` and `ToolResult`.
- Invalid payload returns deterministic error object (no throw-driven control flow in normal path).

2) Mapping path
- Add deterministic mapper: `PersistedSlateDoc`/step-block oriented data -> `NormalizedContent`.
- HTML/text fields must remain JSON-safe and sanitized upstream assumptions must be preserved.

3) Adapter boundary
- `core` exposes contract types + guard + mapper helpers.
- No provider `if/else` branching in `features/**` or store modules.

## Acceptance criteria (must be testable)
- [ ] New contract modules exist under `v10/src/core/contracts/`.
- [ ] `NormalizedContent` draft type/guard and `ToolResult` type/guard are implemented.
- [ ] Mapper to `NormalizedContent` exists and handles text/math/media baseline blocks.
- [ ] No vendor-specific fields are introduced into contract body.
- [ ] `v10` lint/build pass for touched scope or failures are explicitly classified as pre-existing.
- [ ] No out-of-scope files are modified.

## Manual verification steps
- Run `cd v10 && npm run lint`.
- Run `cd v10 && npm run build`.
- Manual payload check:
  - produce at least 2 payload samples from mapper path:
    - text + math
    - text + image(media)
  - verify required fields and `version: "0.3.0-draft"`.

## Risks / roll-back notes
- Risk: current v10 content model can map ambiguously to minimal block schema.
- Risk: over-eager contract generalization may bloat first slice.
- Roll-back:
  - Keep contract modules additive and isolated.
  - Revert mapper integration while preserving standalone contract types/guards.

## Speculative Defense Check
- [x] Any defensive branches added? NO
- [x] Evidence provided (real input, spec, or bug report): YES (`task_085`, cross-app alignment request)
- [x] Sunset criteria defined (when to remove): YES (replace draft-only shortcuts at v1 freeze task)

## Documentation Update Check
- [ ] 구조 변경(파일/폴더 추가·이동·삭제) 발생 시: `node scripts/gen_ai_read_me_map.mjs` 갱신 확인
- [ ] 규칙/의미 변경 발생 시: `v10/AI_READ_ME.md` 갱신 확인

---

## Implementation Log (Codex fills)
Status: PENDING
Changed files:
- `codex_tasks/task_088_provisional_contract_runtime_slice1.md`

Commands run (only if user asked):
- None

Notes:
- Draft spec prepared for approval before implementation.
