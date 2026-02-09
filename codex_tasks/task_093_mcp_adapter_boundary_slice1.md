# Task 093: MCP Adapter Boundary Slice 1 (Core-Generic, Feature-Adapter)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-09

---

## Goal
- What to change:
  - 도구 실행 경계를 `core`와 `features`로 분리하는 adapter 인터페이스를 도입한다.
  - `core`는 generic 요청/응답 계약과 검증만 담당하고, tool/provider별 실행 로직은 `features` adapter 레이어로 이동 가능한 구조를 만든다.
  - `connectors`에서 adapter registry를 통해 실행 경로를 선택하도록 최소 런타임 흐름을 고정한다.
- What must NOT change:
  - 실제 MCP 서버 호출 구현 금지.
  - provider SDK 직접 연동 금지.
  - UI/layout 변경 금지.
  - 신규 dependency 추가 금지.

---

## Scope (Codex must touch ONLY these)

Touched files/directories:
- `codex_tasks/task_093_mcp_adapter_boundary_slice1.md`
- `v10/src/features/extensions/adapters/types.ts` (new)
- `v10/src/features/extensions/adapters/registry.ts` (new)
- `v10/src/features/extensions/adapters/mockAdapter.ts` (new, local deterministic adapter)
- `v10/src/features/extensions/adapters/index.ts` (new)
- `v10/src/core/extensions/connectors.ts`
- `v10/src/core/extensions/registry.ts` (if lookup integration needed)
- `v10/src/core/contracts/toolResult.ts` (if adapter response typing refinement needed)
- `v10/AI_READ_ME.md` (flow/레이어 설명 변경 시)
- `v10/AI_READ_ME_MAP.md` (구조 변경 시)

Out of scope:
- 실운영 LLM/TTS/MCP 네트워크 연결
- API key/secret 저장 및 인증 정책 구현
- `v10/src/features/layout/**` 및 UI 컴포넌트 수정
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
- Preconditions:
  - `task_092_tool_registry_contract_runtime_slice1` 완료 후 진행 권장 (registry contract 선행)
- Must align with:
  - `codex_tasks/task_071_mcp_ready_content_pipeline_spec.md`
  - `codex_tasks/task_085_crossapp_contract_provisional_freeze_policy.md`
  - `codex_tasks/task_092_tool_registry_contract_runtime_slice1.md`
  - `PROJECT_BLUEPRINT.md` section 6
- Boundary rules:
  - `core`에서 provider/tool 전용 분기 금지
  - adapter 구현은 `features/extensions/adapters/**`에 한정
  - `core`에서 외부 네트워크 호출 금지
- Compatibility:
  - draft 단계 additive-only 원칙
  - 기존 `resolveConnectorToolResult` contract 동작 유지

---

## Slice-1 Boundary Definition
Adapter interface (feature layer):
- `adapterId`
- `supports` (`llm|tts|renderer|validator`)
- `invoke(request) -> ToolResult`
- `health()` (optional)

Core connector role:
- registry에서 adapter 핸들 조회
- 요청 전달 전/후 계약 검증
- invalid/unknown adapter에 deterministic error 반환

Mock adapter role:
- 네트워크 없이 deterministic `ToolResult` 반환
- boundary/validation 테스트용 기준 구현

---

## Speculative Defense Check
- [x] Any defensive branches added: NO
- [x] Evidence provided: YES (`task_071`의 MCP adapter 요구 + `PROJECT_BLUEPRINT` 어댑터 경계 원칙)
- [x] Sunset criteria: YES (실제 adapter 도입 단계에서 mock adapter 축소/교체)

---

## Documentation Update Check
- [x] Structure changes:
  - `node scripts/gen_ai_read_me_map.mjs`
  - `v10/AI_READ_ME_MAP.md` 반영 확인
- [x] Semantic / rule changes:
  - `v10/AI_READ_ME.md`에 adapter 경계(core vs features) 반영 확인

---

## Acceptance Criteria (must be testable)
- [x] AC-1: `features/extensions/adapters/**`에 adapter 타입/registry/mock 구현이 추가된다.
- [x] AC-2: `core/extensions/connectors.ts`가 adapter lookup + ToolResult validation 흐름을 가진다.
- [x] AC-3: unknown adapter/tool 요청 시 deterministic error를 반환한다.
- [x] AC-4: `core/**`에 provider-specific 문자열/분기 로직이 추가되지 않는다.
- [x] AC-5: `cd v10 && npm run lint` 실행 시 `error` 0을 유지한다.
- [x] AC-6: Scope 외 파일 수정이 없다.

---

## Manual Verification Steps
1) Adapter 파일 생성 확인
   - Command / path: `rg --files v10/src/features/extensions/adapters`
   - Expected result: `types.ts`, `registry.ts`, `mockAdapter.ts`, `index.ts` 존재
   - Covers: AC-1

2) Connector 경계 확인
   - Command / path: `rg -n "adapter|registry|invoke|validateToolResult" v10/src/core/extensions/connectors.ts`
   - Expected result: lookup -> invoke -> validate 흐름 존재
   - Covers: AC-2

3) Unknown adapter 경로 확인
   - Command / path: connector 호출 샘플(unknown id) 실행
   - Expected result: deterministic error code/message
   - Covers: AC-3

4) Boundary 확인
   - Command / path: `rg -n "openai|anthropic|ollama|gemini" v10/src/core`
   - Expected result: core에 provider-specific 하드코딩 없음
   - Covers: AC-4

5) Quality/Scope 확인
   - Command / path: `cd v10 && npm run lint`, `git diff --name-only`
   - Expected result: lint error 0, scope 내 파일만 변경
   - Covers: AC-5, AC-6

---

## Risks / Roll-back Notes
- Risks:
  - adapter 인터페이스가 과도하게 추상화되면 초기 개발 속도 저하
  - core/feature 경계 설계가 불명확하면 중복 레지스트리 가능성
- Roll-back:
  - `features/extensions/adapters/**` 신규 파일 제거 + `connectors` lookup 변경만 revert
  - mock adapter는 독립 파일로 유지해 선택적 revert 가능

---

## Approval Gate (mandatory)
- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (e.g. "승인: 진행")

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)
Status: COMPLETED

Changed files:
- `codex_tasks/task_093_mcp_adapter_boundary_slice1.md`
- `v10/src/features/extensions/adapters/types.ts` (new)
- `v10/src/features/extensions/adapters/registry.ts` (new)
- `v10/src/features/extensions/adapters/mockAdapter.ts` (new)
- `v10/src/features/extensions/adapters/index.ts` (new)
- `v10/src/core/extensions/connectors.ts`
- `v10/src/core/extensions/registry.ts`
- `v10/AI_READ_ME.md`
- `v10/AI_READ_ME_MAP.md`

Commands run:
- `sed -n '1,260p' /home/sykab/.codex/skills/sy-slate-tool-registry-mcp/SKILL.md`
- `sed -n '1,260p' /home/sykab/.codex/skills/sy-slate-protocol-compat/SKILL.md`
- `sed -n '1,260p' /home/sykab/.codex/skills/sy-slate-architecture-guardrails/SKILL.md`
- `node scripts/gen_ai_read_me_map.mjs`
- `npm run lint` (in `v10/`)
- `npm run build` (in `v10/`, escalated due sandbox Turbopack process 제한)
- `rg --files v10/src/features/extensions/adapters`
- `rg -n "adapter|registry|invoke|validateToolResult|unknown-adapter|adapter-invoke-failed" v10/src/core/extensions/connectors.ts`
- `rg -n "openai|anthropic|ollama|gemini" v10/src/core v10/src/features/extensions/adapters`
- `git status --short -- codex_tasks/task_093_mcp_adapter_boundary_slice1.md v10/src/features/extensions/adapters/types.ts v10/src/features/extensions/adapters/registry.ts v10/src/features/extensions/adapters/mockAdapter.ts v10/src/features/extensions/adapters/index.ts v10/src/core/extensions/connectors.ts v10/src/core/extensions/registry.ts v10/src/core/contracts/toolResult.ts v10/AI_READ_ME.md v10/AI_READ_ME_MAP.md`

Manual verification notes:
- AC-1: `features/extensions/adapters/**` 4개 파일 생성 확인.
- AC-2: `executeRegisteredToolRequest`에 adapter lookup -> invoke -> `resolveConnectorToolResult` 검증 흐름 확인.
- AC-3: `connectors.ts`에 deterministic 오류 코드 `unknown-adapter`, `unregistered-tool`, `adapter-invoke-failed` 분기 확인.
- AC-4: `core/**` + adapter 경로에 provider-specific 문자열 매치 없음.
- AC-5: `npm run lint` 결과 `error 0` (warning 8, pre-existing).
- AC-6: scope 파일 기준 `git status --short -- <scope>`로 범위 내 변경 확인.

Notes:
- 목적은 “도구 연결 구현”이 아니라 “경계 고정 + 스파게티 방지”다.
