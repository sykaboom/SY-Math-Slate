# Task 094: Contract Fixtures + Migration Guard (Draft Phase)

Status: PARKED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-09
Parking note: 2026-02-09 기준 비블로커로 분류. `task_090~093` 완료 후 재검토.

---

## Goal
- What to change:
  - `NormalizedContent`, `RenderPlan`, `TTSScript`, `ToolResult`의 draft 계약용 fixture 세트를 추가한다.
  - 계약 버전/형태 변경 시 깨짐을 조기 감지할 수 있는 migration guard 유틸을 도입한다.
  - guard 결과를 기반으로 `additive` vs `breaking` 판정을 명시적으로 기록 가능한 구조를 만든다.
- What must NOT change:
  - v1 freeze(1.0.0) 확정 금지.
  - provider/tool 전용 분기 로직을 `core`에 추가 금지.
  - UI/layout 변경 금지.
  - 신규 dependency 추가 금지.

---

## Scope (Codex must touch ONLY these)

Touched files/directories:
- `codex_tasks/task_094_contract_fixtures_and_migration_guard.md`
- `v10/src/core/contracts/fixtures/normalizedContent.fixture.ts` (new)
- `v10/src/core/contracts/fixtures/renderPlan.fixture.ts` (new)
- `v10/src/core/contracts/fixtures/ttsScript.fixture.ts` (new)
- `v10/src/core/contracts/fixtures/toolResult.fixture.ts` (new)
- `v10/src/core/contracts/fixtures/index.ts` (new)
- `v10/src/core/contracts/migrationGuard.ts` (new)
- `v10/src/core/contracts/index.ts`
- `v10/AI_READ_ME.md` (contract verification flow 변경 시)
- `v10/AI_READ_ME_MAP.md` (구조 변경 시)

Out of scope:
- `v10/src/features/**` 및 UI 컴포넌트 수정
- 실제 cross-repo migration 실행
- MCP 서버/adapter 네트워크 구현
- CI 파이프라인 대규모 개편

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
  - `task_091`/`task_092` 완료 후 진행 권장 (계약 표면 확정도 상승)
- Must align with:
  - `codex_tasks/task_071_mcp_ready_content_pipeline_spec.md`
  - `codex_tasks/task_085_crossapp_contract_provisional_freeze_policy.md`
  - `codex_tasks/task_088_provisional_contract_runtime_slice1.md`
  - `PROJECT_BLUEPRINT.md` section 6
- Boundary rules:
  - fixture/migration guard는 `core/contracts` 내부에서만 동작
  - provider/vendor 고유 필드는 fixture 본체에 포함 금지
  - 데이터는 JSON-safe 원칙 준수
- Compatibility:
  - draft 단계에서는 additive 변경 우선
  - breaking 판단 시 버전 bump 필요 신호를 guard 결과로 명시

---

## Fixture + Guard Definition
Fixture set:
- valid fixture: 각 계약 타입별 최소/확장 payload
- invalid fixture: 필수 필드 누락, 타입 오류, 버전 불일치 케이스

Migration guard output:
- `kind`: `additive | breaking | invalid`
- `reasons`: 판정 근거 목록
- `recommendedAction`: `keep-version | bump-minor | bump-major-and-migrate`

Usage:
- 계약 가드 함수와 결합해 변경 전/후 fixture 검사
- 계약 변경 task에서 판정 결과를 Implementation Log에 기록

---

## Speculative Defense Check
- [x] Any defensive branches added: NO
- [x] Evidence provided: YES (draft 단계 계약 확장 지속 + 향후 freeze 준비 필요)
- [x] Sunset criteria: YES (v1 freeze 후 guard 정책 재정의 또는 축소)

---

## Documentation Update Check
- [ ] Structure changes:
  - `node scripts/gen_ai_read_me_map.mjs`
  - `v10/AI_READ_ME_MAP.md` 반영 확인
- [ ] Semantic / rule changes:
  - `v10/AI_READ_ME.md`에 fixture/guard 운영 흐름 반영 확인

---

## Acceptance Criteria (must be testable)
- [ ] AC-1: 계약별 fixture 파일(유효/무효 샘플 포함)이 추가된다.
- [ ] AC-2: `migrationGuard`가 additive/breaking/invalid를 deterministic하게 판정한다.
- [ ] AC-3: version bump 권고(`keep/minor/major+migrate`)가 guard 결과로 제공된다.
- [ ] AC-4: provider/vendor 전용 필드가 fixture 계약 본문에 포함되지 않는다.
- [ ] AC-5: `cd v10 && npm run lint` 실행 시 `error` 0을 유지한다.
- [ ] AC-6: Scope 외 파일 수정이 없다.

---

## Manual Verification Steps
1) Fixture 파일 확인
   - Command / path: `rg --files v10/src/core/contracts/fixtures`
   - Expected result: 5개 파일 생성 확인
   - Covers: AC-1

2) Guard 판정 확인
   - Command / path: valid/additive/breaking/invalid 샘플 입력으로 `migrationGuard` 호출
   - Expected result: 각 케이스별 예상 `kind`/`recommendedAction` 반환
   - Covers: AC-2, AC-3

3) Boundary 확인
   - Command / path: `rg -n "openai|anthropic|ollama|gemini|vendor|provider" v10/src/core/contracts/fixtures`
   - Expected result: 계약 본문에 provider 특화 필드 없음
   - Covers: AC-4

4) Quality/Scope 확인
   - Command / path: `cd v10 && npm run lint`, `git diff --name-only`
   - Expected result: lint error 0, scope 내 파일만 변경
   - Covers: AC-5, AC-6

---

## Risks / Roll-back Notes
- Risks:
  - fixture가 실제 계약보다 느리게 업데이트되면 false positive 증가
  - guard 기준이 너무 엄격하면 additive 변경도 breaking으로 과판정 가능
- Roll-back:
  - fixture 파일은 타입별로 분리해 개별 revert 가능
  - `migrationGuard.ts`는 단일 파일로 분리해 정책 rollback 용이

---

## Approval Gate (mandatory)
- [x] Spec self-reviewed by Codex
- [ ] Explicit user approval received (e.g. "승인: 진행")

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)
Status: PARKED

Changed files:
- `codex_tasks/task_094_contract_fixtures_and_migration_guard.md`

Commands run:
- `sed -n '1,260p' /home/sykab/.codex/skills/sy-slate-protocol-compat/SKILL.md`
- `sed -n '1,260p' codex_tasks/task_092_tool_registry_contract_runtime_slice1.md`
- `sed -n '1,260p' codex_tasks/task_093_mcp_adapter_boundary_slice1.md`

Manual verification notes:
- Spec stage only. Implementation not started.

Notes:
- 목적은 “지금 당장 freeze”가 아니라 “freeze 가능한 품질 근거를 누적”하는 것이다.
