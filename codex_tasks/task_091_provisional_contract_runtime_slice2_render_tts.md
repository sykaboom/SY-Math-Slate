# Task 091: Provisional Contract Runtime Slice 2 (RenderPlan + TTSScript)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-09

---

## Goal
- What to change:
  - `task_088` 이후 단계로 `RenderPlan`, `TTSScript` draft 계약 타입/가드를 `core/contracts`에 추가한다.
  - `ToolResult -> normalize -> contract` 경계에서 `normalized` payload를 `NormalizedContent | RenderPlan | TTSScript`로 분류/검증할 수 있게 한다.
  - cross-app 교환 관점에서 `RenderPlan`은 optional 유지(앱별 선택 사용), `TTSScript`는 표준 세그먼트 포맷을 고정한다.
- What must NOT change:
  - `1.0.0` freeze 진행 금지 (`draft` 단계 유지).
  - provider 벤더 분기 로직을 `features/**`나 store로 확장 금지.
  - 신규 dependency 추가 금지.
  - UI/layout 변경 금지.

---

## Scope (Codex must touch ONLY these)

Touched files/directories:
- `codex_tasks/task_091_provisional_contract_runtime_slice2_render_tts.md`
- `v10/src/core/contracts/renderPlan.ts` (new)
- `v10/src/core/contracts/ttsScript.ts` (new)
- `v10/src/core/contracts/toolResult.ts`
- `v10/src/core/contracts/index.ts`
- `v10/src/core/extensions/connectors.ts`
- `v10/src/core/export/exportPipeline.ts` (if contract union wiring needed)
- `v10/AI_READ_ME.md` (contract flow 설명 변경 시)
- `v10/AI_READ_ME_MAP.md` (구조 변경 반영 시)

Out of scope:
- MCP 서버 구현
- `math-pdf-builder-codex` 저장소 변경
- `v10/src/features/**` 및 `v10/src/features/store/**` 수정
- 실제 TTS 호출/합성 엔진 구현
- 실제 페이지 배치 알고리즘 구현(`autoLayout`) 변경

---

## Design Artifacts (required for layout/structure changes)
- [x] Layout / structure changes included: NO
- [x] SVG path in `design_drafts/`: N/A
- [x] SVG includes explicit `viewBox`: N/A
- [x] Tablet viewports considered (if applicable): N/A
- [x] Codex must verify SVG file exists before implementation: N/A

---

## Dependencies / Constraints
- New dependencies allowed: NO
- Preconditions:
  - `task_090_font_source_stabilization_no_network_build` 완료 전에는 `npm run build`가 폰트 fetch 이슈로 실패할 수 있다.
- Must align with:
  - `codex_tasks/task_071_mcp_ready_content_pipeline_spec.md`
  - `codex_tasks/task_085_crossapp_contract_provisional_freeze_policy.md`
  - `codex_tasks/task_088_provisional_contract_runtime_slice1.md`
  - `PROJECT_BLUEPRINT.md` section 6 (forward compatibility)
- Boundary rules:
  - provider/tool-specific 필드는 `ToolResult.raw` / `diagnostics`에만 허용
  - contract 본체는 vendor-neutral 유지
  - adapter 경계 외부(`features`/`store`)로 provider branching 전파 금지
- Compatibility:
  - additive-only 변화 원칙 유지 (`0.x-draft` 단계)
  - breaking이 필요하면 별도 task로 version bump + migration 계획 필수

---

## Slice-2 Contract Shape (draft)
### A) `RenderPlan` (`0.3.0-draft`)
Required:
- `type: "RenderPlan"`
- `version: "0.3.0-draft"`
- `pages[]`

Optional:
- `timeline`
- `hints`

### B) `TTSScript` (`0.3.0-draft`)
Required:
- `type: "TTSScript"`
- `version: "0.3.0-draft"`
- `segments[]` (`id`, `text`, `lang`)

Optional:
- `voiceHints`
- `timingHints`

### C) `ToolResult.normalized` union
- `NormalizedContent | RenderPlan | TTSScript`
- guard로 payload type narrowing 지원

---

## Speculative Defense Check
- [x] Any defensive branches added: NO
- [x] Evidence provided: YES (`task_071/085/088`의 단계적 계약 확장 필요)
- [x] Sunset criteria: YES (`v1 freeze` task에서 draft 버전/필드 재정의)

---

## Documentation Update Check
- [x] Structure changes:
  - `node scripts/gen_ai_read_me_map.mjs`
  - `v10/AI_READ_ME_MAP.md` 반영 확인
- [x] Semantic / rule changes:
  - `v10/AI_READ_ME.md` contract flow 반영 확인

---

## Acceptance Criteria (must be testable)
- [x] AC-1: `RenderPlan`, `TTSScript` 타입 + runtime guard 모듈이 `v10/src/core/contracts/`에 추가된다.
- [x] AC-2: `ToolResult.normalized`가 slice-2 union을 수용하고, deterministic validation 결과를 반환한다.
- [x] AC-3: provider-specific 필드가 contract body에 유입되지 않는다.
- [x] AC-4: 샘플 payload 3종(`NormalizedContent`, `RenderPlan`, `TTSScript`)을 guard 통과 기준으로 검증할 수 있다.
- [x] AC-5: `cd v10 && npm run lint` 실행 시 `error` 0을 유지한다.
- [x] AC-6: scope 외 파일 수정이 없다.
- [x] AC-7: `cd v10 && npm run build`를 실행하고, 실패 시 원인을 `new`/`pre-existing`으로 분류해 기록한다.

Baseline evidence (2026-02-09, before implementation):
- `rg --files v10/src/core/contracts` 결과: `renderPlan.ts`, `ttsScript.ts` 미존재
- `v10/src/core/contracts/index.ts` 현재 export: `normalizedContent`, `toolResult`, `fromPersistedDoc`
- `v10/src/core/export/exportPipeline.ts` 현재 `ToolResult.normalized`를 `validateNormalizedContent` 단일 경로로 검증
- `cd v10 && npm run lint` 결과: `0 errors`, `8 warnings`
- `cd v10 && npm run build` 결과: `next/font/google` fetch 실패(`Geist Mono`, `Noto Sans KR`)

---

## Manual Verification Steps
1) Contract 파일 생성/노출 확인
   - Command / path: `rg --files v10/src/core/contracts`
   - Expected result: `renderPlan.ts`, `ttsScript.ts` 포함
   - Covers: AC-1

2) Guard 동작 확인
   - Command / path: 구현된 guard 함수에 valid/invalid payload 샘플 주입
   - Expected result: valid true / invalid deterministic error
   - Covers: AC-2, AC-4

3) Boundary 확인
   - Command / path: `rg -n "provider|vendor|openai|anthropic|ollama" v10/src/core/contracts`
   - Expected result: contract body에 tool/provider 특화 필드 없음
   - Covers: AC-3

4) Quality/Scope 확인
   - Command / path: `cd v10 && npm run lint`, `git diff --name-only`
   - Expected result: lint error 0, scope 내 파일만 변경
   - Covers: AC-5, AC-6

5) Build 결과 분류 확인
   - Command / path: `cd v10 && npm run build`
   - Expected result: 성공 또는 실패 원인 분류(`new` vs `pre-existing`)가 로그에 명시
   - Covers: AC-7

---

## Risks / Roll-back Notes
- Risks:
  - draft 계약 확장으로 type surface가 커져 후속 migration 부담이 증가할 수 있음
  - `connectors` wiring이 과도하면 adapter 책임 경계가 흐려질 수 있음
- Roll-back:
  - `renderPlan.ts`, `ttsScript.ts` 신규 파일만 제거하고 `toolResult` union 변경을 되돌리는 파일 단위 롤백 가능
  - integration wiring(`connectors`, `exportPipeline`)은 별도 커밋 단위로 분리해 revert 가능하도록 유지

---

## Approval Gate (mandatory)
- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (e.g. "승인: 진행")

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)
Status: COMPLETED

Changed files:
- `codex_tasks/task_091_provisional_contract_runtime_slice2_render_tts.md`
- `v10/src/core/contracts/renderPlan.ts` (new)
- `v10/src/core/contracts/ttsScript.ts` (new)
- `v10/src/core/contracts/toolResult.ts`
- `v10/src/core/contracts/index.ts`
- `v10/src/core/extensions/connectors.ts`
- `v10/src/core/export/exportPipeline.ts`
- `v10/AI_READ_ME.md`
- `v10/AI_READ_ME_MAP.md`

Commands run:
- `git status --short`
- `sed -n '1,220p' codex_tasks/task_091_provisional_contract_runtime_slice2_render_tts.md`
- `sed -n '1,220p' /home/sykab/.codex/skills/sy-slate-protocol-compat/SKILL.md`
- `sed -n '1,220p' /home/sykab/.codex/skills/sy-slate-tool-registry-mcp/SKILL.md`
- `sed -n '1,260p' /home/sykab/.codex/skills/sy-slate-architecture-guardrails/SKILL.md`
- `sed -n '1,280p' v10/src/core/contracts/toolResult.ts`
- `sed -n '1,260p' v10/src/core/contracts/renderPlan.ts`
- `sed -n '1,260p' v10/src/core/contracts/ttsScript.ts`
- `sed -n '1,260p' v10/src/core/contracts/index.ts`
- `sed -n '1,320p' v10/src/core/extensions/connectors.ts`
- `sed -n '1,280p' v10/src/core/export/exportPipeline.ts`
- `sed -n '1,300p' v10/src/core/contracts/normalizedContent.ts`
- `rg -n "ToolResult|RenderPlan|TTSScript|normalized" v10/AI_READ_ME.md | head -n 40`
- `sed -n '130,240p' v10/AI_READ_ME.md`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
- `cd v10 && rm -rf /tmp/task091-contracts && npx tsc src/core/contracts/normalizedContent.ts src/core/contracts/renderPlan.ts src/core/contracts/ttsScript.ts src/core/contracts/toolResult.ts --module commonjs --target es2022 --outDir /tmp/task091-contracts --esModuleInterop --skipLibCheck --moduleResolution node --pretty false`
- `node - <<'NODE' ... validateToolResult sample payloads ... NODE`
- `rg -n "provider|vendor|openai|anthropic|ollama" v10/src/core/contracts`
- `bash scripts/check_layer_rules.sh`
- `node scripts/gen_ai_read_me_map.mjs`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`

Manual verification notes:
- `validateToolResult` sample 결과:
  - `NormalizedContent`: `ok`
  - `RenderPlan`: `ok`
  - `TTSScript`: `ok`
  - invalid `RenderPlan(stepIndex=-1)`: `fail invalid-normalized @ normalized.pages[0].steps[0].stepIndex`
- `rg -n "provider|vendor|openai|anthropic|ollama" v10/src/core/contracts` 결과: 매치 없음 (contract body vendor-neutral 유지)
- `cd v10 && npm run lint`: `0 errors`, 기존 warning 8개 유지
- `cd v10 && npm run build`: sandbox 제약으로 실패 (`creating new process -> binding to a port -> Operation not permitted`), 현재 환경의 pre-existing 제약으로 분류
- `bash scripts/check_layer_rules.sh`: 스크립트 파일 부재(`No such file or directory`)로 실행 불가. lint + 수동 boundary 점검으로 대체
- 작업 중 레포에는 기존 미커밋 변경(task089/090 관련)이 이미 존재했으며, 본 task 구현 변경은 spec scope 파일로 한정

Notes:
- 목적은 v1 freeze가 아니라 draft slice 확장이다.
