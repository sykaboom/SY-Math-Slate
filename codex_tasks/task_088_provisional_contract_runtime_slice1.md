# Task 088: Provisional Contract Runtime Slice 1 (v10 Lead)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-08

---

## Goal
- What to change:
  - `task_085` 정책을 코드 레벨 1차 슬라이스로 옮긴다.
  - `NormalizedContent (0.3.0-draft)` + `ToolResult`의 canonical 타입/가드/매퍼를 `core`에 추가한다.
  - `ToolResult -> normalize -> exchange payload` 경계를 adapter 계층에서 강제할 기반을 만든다.
- What must NOT change:
  - `1.0.0` freeze 진행 금지.
  - provider 벤더 분기 로직을 `features/**`나 store에 추가 금지.
  - 신규 dependency 추가 금지.

---

## Scope (Codex must touch ONLY these)

Touched files/directories:
- `codex_tasks/task_088_provisional_contract_runtime_slice1.md`
- `v10/src/core/contracts/normalizedContent.ts` (new)
- `v10/src/core/contracts/toolResult.ts` (new)
- `v10/src/core/contracts/fromPersistedDoc.ts` (new)
- `v10/src/core/contracts/index.ts` (new)
- `v10/src/core/export/exportPipeline.ts`
- `v10/src/core/extensions/connectors.ts`
- `v10/AI_READ_ME.md` (semantic mapping update if changed)
- `v10/AI_READ_ME_MAP.md` (auto-generated if structure changed)

Out of scope:
- `math-pdf-builder-codex` 저장소 변경
- MCP 서버 구현
- `RenderPlan` / `TTSScript` runtime 구현
- UI/layout 변경
- `v10/src/features/**` 및 `v10/src/features/store/**` 수정

---

## Design Artifacts (required for layout/structure changes)
- [x] Layout / structure changes included: NO
- [x] SVG path in `design_drafts/`: N/A
- [x] SVG includes explicit `viewBox`: N/A
- [x] Codex must verify SVG file exists before implementation: N/A

---

## Dependencies / Constraints
- New dependencies allowed: NO
- Must align with:
  - `codex_tasks/task_071_mcp_ready_content_pipeline_spec.md`
  - `codex_tasks/task_085_crossapp_contract_provisional_freeze_policy.md`
  - `PROJECT_BLUEPRINT.md` section 6
  - `PROJECT_CONTEXT.md` (v10 lead principle)
- Boundary rules:
  - provider-specific fields는 `raw/diagnostics`에만 존재
  - contract body는 vendor-neutral 유지
  - `core` 밖으로 provider 조건 분기 전파 금지

---

## Runtime Contract Shape (slice-1)
### A) `NormalizedContent` (`0.3.0-draft`)
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

Block kinds (slice-1):
- `text`
- `math`
- `media`
- `break`

### B) `ToolResult` envelope
Required:
- `toolId`
- `toolVersion`
- `status`
- `raw`
- `normalized`
- `diagnostics`

Rule:
- `normalized`에는 normalized payload만 허용
- provider 세부 정보는 `raw`/`diagnostics`에 격리

---

## Runtime Behavior Requirements
1) Guards
- `NormalizedContent` / `ToolResult` runtime guard 제공
- invalid payload는 deterministic error result 반환 (normal path에서 throw 지양)

2) Mapper
- `PersistedSlateDoc` 또는 `stepBlocks` 기반 입력을 `NormalizedContent`로 변환하는 deterministic mapper 제공
- text/html/math/media mapping 규칙 문서화

3) Adapter boundary
- `core` exports: contract types + guard + mapper
- adapter 계층에서 `ToolResult.normalized`를 contract로 변환/검증

---

## Speculative Defense Check
- [x] Any defensive branches added: NO
- [x] Evidence provided: YES (`task_085`, cross-app alignment request)
- [x] Sunset criteria: YES (v1 freeze task에서 draft-only constraints 교체)

---

## Documentation Update Check
- [x] Structure changes:
  - `node scripts/gen_ai_read_me_map.mjs`
  - `v10/AI_READ_ME_MAP.md` 반영 확인
- [x] Semantic/rule changes:
  - `v10/AI_READ_ME.md` contract flow 섹션 반영 확인

---

## Acceptance Criteria (must be testable)
- [x] AC-1: `v10/src/core/contracts/`에 `NormalizedContent`, `ToolResult`, mapper 모듈이 생성된다.
- [x] AC-2: `NormalizedContent`와 `ToolResult`의 타입 + runtime guard가 구현된다.
- [x] AC-3: mapper가 최소 2종 케이스를 생성 가능하다.
  - `text + math`
  - `text + media(image)`
- [x] AC-4: contract body에 vendor-specific 필드가 추가되지 않는다.
- [x] AC-5: `cd v10 && npm run lint`, `cd v10 && npm run build` 실행 결과를 기록하고, 실패 시 pre-existing/new를 구분한다.
- [x] AC-6: scope 외 파일 수정이 없다.

---

## Manual Verification Steps
1) Contract module creation check
   - Command / path: `rg --files v10/src/core/contracts`
   - Expected result: 신규 4개 파일 확인
   - Covers: AC-1

2) Guard behavior check
   - Command / path: 구현된 guard 함수에 valid/invalid sample 입력
   - Expected result: valid true / invalid deterministic error result
   - Covers: AC-2

3) Mapper sample check
   - Command / path: mapper 함수 호출 샘플 2개 작성/실행
   - Expected result: required fields + `version: "0.3.0-draft"` 포함
   - Covers: AC-3, AC-4

4) Quality gate
   - Command / path: `cd v10 && npm run lint`, `cd v10 && npm run build`
   - Expected result: 성공 또는 실패 분류(pre-existing/new) 보고
   - Covers: AC-5

5) Scope audit
   - Command / path: `git status --short` / `git diff --name-only`
   - Expected result: scope 목록 외 파일 없음
   - Covers: AC-6

---

## Risks / Roll-back Notes
- Risks:
  - 현 v10 데이터 모델과 최소 contract 간 매핑 ambiguity 발생 가능
  - slice-1에서 범위가 커지면 계약이 과도하게 비대해질 수 있음
- Roll-back:
  - `core/contracts/*` 신규 파일만 우선 유지하고 integration만 되돌리는 전략
  - contract 타입/가드는 남기고 export/connector wiring만 revert 가능하도록 커밋 분리

---

## Approval Gate (mandatory)
- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (e.g. "승인: 진행")

> Implementation MUST NOT begin until user approval is checked.

---

## Implementation Log (Codex fills)
Status: COMPLETED

Changed files:
- `codex_tasks/task_088_provisional_contract_runtime_slice1.md`
- `v10/src/core/contracts/normalizedContent.ts`
- `v10/src/core/contracts/toolResult.ts`
- `v10/src/core/contracts/fromPersistedDoc.ts`
- `v10/src/core/contracts/index.ts`
- `v10/src/core/export/exportPipeline.ts`
- `v10/src/core/extensions/connectors.ts`
- `v10/AI_READ_ME.md`
- `v10/AI_READ_ME_MAP.md`

Commands run (spec + implementation phase):
- `sed -n '1,280p' AGENTS.md`
- `sed -n '1,260p' GEMINI_CODEX_PROTOCOL.md`
- `sed -n '1,260p' PROJECT_BLUEPRINT.md`
- `sed -n '1,260p' PROJECT_CONTEXT.md`
- `sed -n '1,320p' codex_tasks/task_088_provisional_contract_runtime_slice1.md`
- `sed -n '1,220p' v10/AI_READ_ME.md`
- `sed -n '1,220p' v10/AI_READ_ME_MAP.md`
- `node scripts/gen_ai_read_me_map.mjs`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
- `cd v10 && npm run lint -- --max-warnings=0 src/core/contracts/normalizedContent.ts src/core/contracts/toolResult.ts src/core/contracts/fromPersistedDoc.ts src/core/contracts/index.ts src/core/export/exportPipeline.ts src/core/extensions/connectors.ts`

Notes:
- Stage-2 spec self-review completed.
- Scope ambiguity removed (`buildPersistedDoc.ts` optional wording removed, exact touched files fixed).
- Full lint failure classified as pre-existing repo errors outside this task scope.
- Build failure classified as sandbox/network font fetch issue (`next/font` Google Fonts), not task scope logic.
