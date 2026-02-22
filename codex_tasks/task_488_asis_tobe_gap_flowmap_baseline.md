# Task 488: AS-IS / TO-BE / GAP 순서도 맵 기준선 작성

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: root/
Date: 2026-02-22

---

## Goal (Base Required)
- What to change:
  - 현재 코드베이스의 실제 구조(AS-IS), 목표 구조(TO-BE), 어긋남(GAP)을 같은 축으로 비교 가능한 문서 세트로 고정한다.
  - 폴더/TS·TSX 파일/함수·변수·메서드 흐름을 “순서도 중심”으로 명시해, 이후 리팩토링을 데이터 기반으로 지시 가능하게 만든다.
- What must NOT change:
  - 앱 런타임 동작/화면/로직/정책 코드 변경 금지.
  - 코드 리팩토링 및 import 경로 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/docs/architecture/00_AsIs_SystemFlowMap.md` (new)
- `v10/docs/architecture/01_ToBe_EngineModFlowMap.md` (new)
- `v10/docs/architecture/02_Gap_Register_And_RiskMap.md` (new)
- `v10/docs/architecture/03_Refactor_DAG_ExecutionPlan.md` (new)
- `v10/docs/architecture/ModEngine.md` (update: 본 문서군 링크/SSOT 포인터 정합)
- `v10/docs/architecture/ModularizationDependencyFlow.md` (update: 현재 맵과 목표 맵 참조 정합)

Out of scope:
- `v10/src/**` 코드 수정
- build/lint 결과를 바꾸는 모든 코드 변경
- 신규 의존성 설치
- task_489+ 구현 스코프(실제 리팩토링)

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - 문서화는 실제 코드 기준이어야 하며, 추측/희망 구조를 AS-IS에 혼입하지 않는다.
  - TO-BE는 “core always-on / mod optional / one-way dependency” 원칙을 명시한다.
  - GAP은 증거(파일/함수 참조) 기반으로만 작성한다.
- Compatibility:
  - 기존 아키텍처 문서(`ModEngine.md`, `ModularizationDependencyFlow.md`)를 삭제하지 않고 참조 관계로 보강한다.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-MAP-BASELINE
- Depends on tasks:
  - `[]`
- Enables tasks:
  - `task_489`~`task_49x` 리팩토링 웨이브 설계/분할
- Parallel group:
  - G-DOCS-ARCH
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `mid`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 6
- Files shared with other PENDING tasks:
  - unknown (문서 중심, 코드 충돌 낮음)
- Cross-module dependency:
  - NO (read-only 분석 + 문서 작성)
- Parallelizable sub-units:
  - 2 (AS-IS 수집 / TO-BE·GAP 정리)
- Estimated single-agent duration:
  - `~35min`
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - NO
- Rationale:
  - 단일 저자가 동일 용어·축을 유지해야 문서 정합성이 높다. 병렬 작성 시 용어 drift 위험이 큼.

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: NO

---

## Optional Block B — Delegated Execution

- [ ] Applies: NO

If NO:
- Execution mode: MANUAL

---

## Optional Block C — Hotfix Exception

- [ ] Applies: NO

---

## Optional Block D — Speculative Defense Check

- [ ] Applies: NO

---

## Optional Block E — Documentation Update Check

- [x] Applies: YES
- [ ] Structure changes (file/folder add/move/delete):
  - 문서 파일 추가만 수행 (코드 구조 변경 아님)
  - `node scripts/gen_ai_read_me_map.mjs` 실행 불필요 (코드베이스 구조 불변)
- [x] Semantic/rule changes:
  - `v10/AI_READ_ME.md` 업데이트 불필요 (동작/구조 코드 변화 없음)
  - `v10/docs/architecture/*` 내 SSOT 포인터만 보강

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: AS-IS 문서가 폴더→파일→핵심 함수/상태→호출 흐름(텍스트 순서도)으로 구성되고, 최소 3개 핵심 런타임 경로(부팅/툴바/모드 라우팅)를 포함한다.
- [ ] AC-2: TO-BE 문서가 one-way dependency 규칙(허용/금지 import 방향)과 core/mod/features 책임 경계를 명시한다.
- [ ] AC-3: GAP 문서가 High/Medium/Low로 분류된 어긋남 목록과 근거 파일 경로를 포함한다.
- [ ] AC-4: DAG 문서가 “맵 기반 리팩토링 순서”를 단계별(선행조건/차단요인/검증포인트)로 명시한다.
- [ ] AC-5: 기존 `ModEngine.md`, `ModularizationDependencyFlow.md`에 신규 문서군으로의 링크/참조가 추가되어 문서 탐색 경로가 단일화된다.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `ls -1 v10/docs/architecture`
   - Expected result:
     - `00_`, `01_`, `02_`, `03_` 문서가 생성되어 있다.
   - Covers: AC-1, AC-2, AC-3, AC-4

2) Step:
   - Command / click path:
     - `rg -n "AS-IS|TO-BE|GAP|DAG|one-way|forbidden import|core always-on" v10/docs/architecture/*.md`
   - Expected result:
     - 핵심 키워드가 문서별로 존재한다.
   - Covers: AC-1, AC-2, AC-3, AC-4

3) Step:
   - Command / click path:
     - `rg -n "00_AsIs_SystemFlowMap|01_ToBe_EngineModFlowMap|02_Gap_Register_And_RiskMap|03_Refactor_DAG_ExecutionPlan" v10/docs/architecture/ModEngine.md v10/docs/architecture/ModularizationDependencyFlow.md`
   - Expected result:
     - 기존 문서에서 신규 문서군 참조가 확인된다.
   - Covers: AC-5

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - AS-IS와 TO-BE 경계가 섞이면 이후 구현 태스크가 잘못 분할될 수 있다.
  - 용어 불일치(`mode` vs `mod`, `package` vs `template`)가 남으면 재혼선 발생.
- Roll-back:
  - 신규 문서 4개 삭제 + 기존 문서 링크 수정 revert (문서 변경 only, 코드 무영향).

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/docs/architecture/00_AsIs_SystemFlowMap.md` (new)
- `v10/docs/architecture/01_ToBe_EngineModFlowMap.md` (new)
- `v10/docs/architecture/02_Gap_Register_And_RiskMap.md` (new)
- `v10/docs/architecture/03_Refactor_DAG_ExecutionPlan.md` (new)
- `v10/docs/architecture/ModEngine.md` (updated links)
- `v10/docs/architecture/ModularizationDependencyFlow.md` (updated links)

Commands run (only if user asked or required by spec):
- `ls -1 v10/docs/architecture`
- `rg -n "AS-IS|TO-BE|GAP|DAG|one-way|forbidden import|core always-on" v10/docs/architecture/*.md`
- `rg -n "00_AsIs_SystemFlowMap|01_ToBe_EngineModFlowMap|02_Gap_Register_And_RiskMap|03_Refactor_DAG_ExecutionPlan" v10/docs/architecture/ModEngine.md v10/docs/architecture/ModularizationDependencyFlow.md`

## Gate Results (Codex fills)

- Lint:
  - N/A (docs-only task)
- Build:
  - N/A (docs-only task)
- Script checks:
  - PASS (manual verification commands in spec executed)

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - None
- Newly introduced failures:
  - None
- Blocking:
  - NO
- Mitigation:
  - N/A

Manual verification notes:
- AC-1 PASS: `00_AsIs_SystemFlowMap.md` created with boot/toolbar/mod routing flow.
- AC-2 PASS: `01_ToBe_EngineModFlowMap.md` documents one-way dependency rules and ownership.
- AC-3 PASS: `02_Gap_Register_And_RiskMap.md` includes High/Medium/Low gaps with file evidence.
- AC-4 PASS: `03_Refactor_DAG_ExecutionPlan.md` defines ordered DAG phases, blockers, and checks.
- AC-5 PASS: `ModEngine.md`, `ModularizationDependencyFlow.md` link to 00~03 map set.

Notes:
- This task intentionally performed no `v10/src/**` code edits.
