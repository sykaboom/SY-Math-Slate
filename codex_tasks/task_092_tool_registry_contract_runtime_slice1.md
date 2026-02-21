# Task 092: Tool Registry Contract Runtime Slice 1

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-09

---

## Goal
- What to change:
  - `Tool Registry`의 canonical contract 타입/가드를 `core`에 추가한다.
  - 도구 등록 데이터(`toolId`, `category`, `inputSchema`, `outputSchema`, `capabilities`, `execution`, `policy`)를 런타임에서 검증 가능하게 만든다.
  - `connectors` 경계에서 “등록된 tool만 실행” 규칙을 적용할 기반을 만든다.
- What must NOT change:
  - MCP 서버/네트워크 연동 구현 금지.
  - provider-specific 실행 로직을 `core`에 추가 금지.
  - UI/layout 변경 금지.
  - 신규 dependency 추가 금지.

---

## Scope (Codex must touch ONLY these)

Touched files/directories:
- `codex_tasks/task_092_tool_registry_contract_runtime_slice1.md`
- `v10/src/core/contracts/toolRegistry.ts` (new)
- `v10/src/core/contracts/index.ts`
- `v10/src/core/extensions/registry.ts`
- `v10/src/core/extensions/connectors.ts`
- `v10/src/core/extensions/manifest.ts` (if registry schema wiring needed)
- `v10/AI_READ_ME.md` (flow/contract 설명 변경 시)
- `v10/AI_READ_ME_MAP.md` (구조 변경 시)

Out of scope:
- `v10/src/features/**` 및 `v10/src/features/platform/store/**` 수정
- 실제 provider adapter 구현
- 인증키/요금제/비밀정보 저장 로직 추가
- cross-repo(`math-pdf-builder-codex`) 수정

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
- Must align with:
  - `codex_tasks/task_071_mcp_ready_content_pipeline_spec.md`
  - `codex_tasks/task_085_crossapp_contract_provisional_freeze_policy.md`
  - `codex_tasks/task_088_provisional_contract_runtime_slice1.md`
  - `codex_tasks/task_091_provisional_contract_runtime_slice2_render_tts.md`
  - `PROJECT_BLUEPRINT.md` section 6
- Boundary rules:
  - tool/provider/vendor 분기 로직은 adapter layer에만 위치
  - `core`는 계약 타입/가드/등록 상태 검증만 담당
  - `core`에서 외부 네트워크 호출 금지
- Compatibility:
  - draft 단계 additive-only 원칙 유지
  - breaking change 필요 시 별도 task에서 버전 증가 + migration 계획 필수

---

## Contract Shape (slice-1 draft)
Required fields:
- `toolId`: stable string ID
- `category`: `llm | tts | renderer | transformer | validator`
- `inputSchema`: JSON-safe schema descriptor
- `outputSchema`: JSON-safe schema descriptor
- `capabilities`: locale/media/token/size limits
- `execution`: `mcpServerId | endpointRef | localRuntimeId` 중 하나 이상
- `policy`: timeout/rate/cost/trust level

Rules:
- registry entry는 JSON-safe payload만 허용
- 비밀값(secret/token)은 entry 본문에 저장 금지
- `ToolResult` contract와 연결 가능한 output schema여야 함

---

## Speculative Defense Check
- [x] Any defensive branches added: NO
- [x] Evidence provided: YES (`task_071` tool registry 요구 + `085/088/091` 계약 확장 흐름)
- [x] Sunset criteria: YES (`v1 freeze` 시 draft 필드 재정의/정리)

---

## Documentation Update Check
- [x] Structure changes:
  - `node scripts/gen_ai_read_me_map.mjs`
  - `v10/AI_READ_ME_MAP.md` 반영 확인
- [x] Semantic / rule changes:
  - `v10/AI_READ_ME.md` tool registry contract flow 반영 확인

---

## Acceptance Criteria (must be testable)
- [x] AC-1: `toolRegistry` contract 타입 + runtime guard가 `core/contracts`에 추가된다.
- [x] AC-2: 필수 필드 누락/오타/타입 불일치 시 deterministic invalid 결과를 반환한다.
- [x] AC-3: `connectors`가 등록되지 않은 `toolId`를 차단하는 검증 경로를 가진다.
- [x] AC-4: contract body에 provider/vendor 전용 필드가 추가되지 않는다.
- [x] AC-5: `cd v10 && npm run lint` 실행 시 `error` 0을 유지한다.
- [x] AC-6: Scope 외 파일 수정이 없다.

---

## Manual Verification Steps
1) Contract 생성 확인
   - Command / path: `rg --files v10/src/core/contracts | rg 'toolRegistry'`
   - Expected result: `toolRegistry.ts` 존재
   - Covers: AC-1

2) Guard 동작 확인
   - Command / path: valid/invalid registry payload 샘플로 guard 호출
   - Expected result: valid true / invalid deterministic result
   - Covers: AC-2

3) Connector 경계 확인
   - Command / path: `rg -n "toolId|registry|registered" v10/src/core/extensions/connectors.ts`
   - Expected result: unregistered tool 차단 흐름 존재
   - Covers: AC-3

4) Boundary 확인
   - Command / path: `rg -n "openai|anthropic|ollama|gemini" v10/src/core/contracts v10/src/core/extensions`
   - Expected result: core 계약 본문에 provider 하드코딩 없음
   - Covers: AC-4

5) Quality/Scope 확인
   - Command / path: `cd v10 && npm run lint`, `git diff --name-only`
   - Expected result: lint error 0, scope 내 파일만 변경
   - Covers: AC-5, AC-6

---

## Risks / Roll-back Notes
- Risks:
  - registry schema를 과도하게 상세화하면 draft 단계 변경 비용 증가
  - execution/policy 필드 정의가 불명확하면 adapter 경계가 다시 흐려질 수 있음
- Roll-back:
  - `toolRegistry.ts` 신규 파일 제거 + `index.ts` export 회수로 원복 가능
  - `connectors` wiring은 별도 커밋으로 분리하여 선택 revert 가능하게 유지

---

## Approval Gate (mandatory)
- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (e.g. "승인: 진행")

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)
Status: COMPLETED

Changed files:
- `codex_tasks/task_092_tool_registry_contract_runtime_slice1.md`
- `v10/src/core/contracts/toolRegistry.ts` (new)
- `v10/src/core/contracts/index.ts`
- `v10/src/core/extensions/registry.ts`
- `v10/src/core/extensions/connectors.ts`
- `v10/AI_READ_ME.md`
- `v10/AI_READ_ME_MAP.md`

Commands run:
- `node scripts/gen_ai_read_me_map.mjs`
- `npm run lint` (in `v10/`)
- `npm run build` (in `v10/`, escalated due sandbox Turbopack process 제한)
- `rg --files v10/src/core/contracts | rg 'toolRegistry\\.ts|renderPlan\\.ts|ttsScript\\.ts|toolResult\\.ts'`
- `rg -n "validateToolRegistryEntry|invalid-tool-id|invalid-category|missing-execution-target|invalid-policy-timeout|forbidden-secret-field" v10/src/core/contracts/toolRegistry.ts`
- `rg -n "resolveRegisteredConnectorToolResult|executeRegisteredToolRequest|resolveToolExecutionAdapterId|unknown-adapter|unregistered-tool|validateToolResult" v10/src/core/extensions/connectors.ts`
- `rg -n "openai|anthropic|ollama|gemini" v10/src/core/contracts v10/src/core/extensions`
- `cd v10 && rm -rf /tmp/task092-tool-registry && npx tsc src/core/contracts/toolRegistry.ts --module commonjs --target es2022 --outDir /tmp/task092-tool-registry --skipLibCheck --moduleResolution node --pretty false`
- `node - <<'NODE' ... validateToolRegistryEntry(valid/invalid) ... NODE`
- `git status --short -- codex_tasks/task_092_tool_registry_contract_runtime_slice1.md v10/src/core/contracts/toolRegistry.ts v10/src/core/contracts/index.ts v10/src/core/extensions/registry.ts v10/src/core/extensions/connectors.ts v10/src/core/extensions/manifest.ts v10/AI_READ_ME.md v10/AI_READ_ME_MAP.md`

Manual verification notes:
- AC-1: `toolRegistry.ts` 신규 생성 및 `contracts/index.ts` export 연결 확인.
- AC-2: runtime 샘플 검증 결과 `valid.ok=true`, invalid 샘플은 deterministic 결과 `invalid-tool-id @ toolId`.
- AC-3: `resolveRegisteredConnectorToolResult` / `executeRegisteredToolRequest`에 `unregistered-tool` 차단 경로 확인.
- AC-4: `core/contracts` + `core/extensions`에서 provider-specific 문자열 매치 없음.
- AC-5: `npm run lint` 결과 `error 0` (warning 8, pre-existing).
- AC-6: scope 파일 기준 `git status --short -- <scope>`로 범위 내 변경만 확인.

Notes:
- 본 태스크는 MCP 연결 자체가 아니라 “연결 가능한 계약 경계”를 먼저 고정하는 단계다.
