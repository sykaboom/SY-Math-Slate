# Task 070: Modular Refactor Roadmap Spec (Planning-Only)

**Status:** COMPLETED
**Priority:** P1 (Architecture / Long-term Maintainability)
**Assignee:** Codex CLI
**Dependencies:** Task 068, Task 069

## Context
- 경량 리팩토링(068/069) 이후에도 중기 구조 개선 여지가 남아 있다.
- 목표는 기능 개발 속도를 유지하면서 구조 복잡도를 단계적으로 낮추는 실행 가능한 로드맵을 문서화하는 것이다.

## Goals
1. 향후 리팩토링 대상을 트랙 단위로 분류하고 우선순위를 정한다.
2. 각 트랙별 영향 범위/리스크/선행조건/검증 방식을 명시한다.
3. “작은 배치(small batch)”로 진행 가능한 서브태스크 목록을 정의한다.

## Non-Goals
- 실제 production 코드 변경
- 신규 기능 구현
- 외부 의존성 도입

## Scope
- `codex_tasks/task_070_modular_refactor_roadmap.md` (this file)
- 필요 시 연계 태스크 초안 파일 생성:
  - `codex_tasks/task_071_*.md`
  - `codex_tasks/task_072_*.md`
  - `codex_tasks/task_073_*.md`
  - `codex_tasks/task_074_*.md`
  - `codex_tasks/task_075_*.md`

## Proposed Tracks
### Track A: Store Slice Modularization
- 대상: `useCanvasStore.ts`를 document/layout/playback/modding 슬라이스로 분리
- 기대효과: 상태 변경 영향 범위 축소, 테스트 용이성 개선

### Track B: Render Selector Extraction
- 대상: `ContentLayer`의 visible filtering/probe 계산 분리
- 기대효과: 렌더 컴포넌트 단순화, 애니메이션 확장 시 회귀 감소

### Track C: Persistence Codec Hardening
- 대상: migrate/persistence/fileIO 경계의 단일 codec 계층 정립
- 기대효과: 포맷 변화 시 변경 지점 단일화

### Track D: Modding Contract Expansion
- 대상: animation 중심 계약에서 typography/layout 계약 확장
- 기대효과: 고급 사용자 커스터마이징 확장성 확보

### Track E: Data Input Domain Modules (Post-069 deepening)
- 대상: Data Input command/model/view 분리 고도화
- 기대효과: 비개발자 UX 개선을 위한 반복 속도 향상

## Deliverables
1. 우선순위 매트릭스(효과/난이도/리스크)
2. 트랙별 선행의존 관계
3. 트랙별 1~2주 단위 구현 슬라이스 제안
4. 각 슬라이스의 수용기준 및 롤백 기준

## Priority Matrix (Effect / Difficulty / Risk)
| Track | Effect | Difficulty | Risk | Rationale |
| --- | --- | --- | --- | --- |
| A Store Slice Modularization | High | High | High | 전역 상태 복잡도 감소는 장기 효율에 직결 |
| B Render Selector Extraction | High | Medium | Medium | 렌더 경로 안정화, 회귀 감소 |
| C Persistence Codec Hardening | High | Medium | Medium | 포맷 변경 시 영향 범위 최소화 |
| D Modding Contract Expansion | Medium | Medium | Medium | 고급 커스터마이징 준비 |
| E Data Input Domain Modules | Medium | Medium | Low | 유지보수성과 확장성 개선 |

## Dependencies / Preconditions
- A: Task 068/069 이후, 스냅샷/회귀 시나리오 확보 필요
- B: ContentLayer 안정화, 애니메이션 파이프라인 정착
- C: Task 068 완료(공용 persist 헬퍼) 기반 확장
- D: Task 071 계약 스펙 확정 필요
- E: Task 069 완료 후 진행

## Track Details + Slices (1~2 week batches)
### Track A: Store Slice Modularization
- Scope: `useCanvasStore.ts`를 document/layout/playback/modding 슬라이스로 분리
- Guardrails: layer 규칙 유지, JSON-safe persistence 유지
- Slice A1: Selector/Action 분류 및 네임스페이스 분리
  - Acceptance: 기존 API 그대로 유지, 타입 오류 0
  - Rollback: 단일 스토어 파일로 되돌릴 수 있게 re-export 유지
- Slice A2: 파일 분리 + re-export 인덱스 구성
  - Acceptance: 기존 import 경로 유지, 동작 동일
- Slice A3: 회귀 시나리오 문서화 + 최소 리그레션 체크리스트

### Track B: Render Selector Extraction
- Scope: `ContentLayer`의 visible filtering/probe 계산 분리
- Guardrails: DOM sanitize 경로 유지, animation runtime 영향 최소화
- Slice B1: visible filter/selectors 분리
- Slice B2: cursor probe/anchor 계산 모듈화

### Track C: Persistence Codec Hardening
- Scope: migrate/persistence/fileIO 경계의 단일 codec 계층 정립
- Guardrails: PersistedSlateDoc 하위호환, 버전 마이그레이션 필수
- Slice C1: codec 모듈화(encode/decode) 정의
- Slice C2: fixtures + 계약 회귀 체크리스트 추가

### Track D: Modding Contract Expansion
- Scope: animation 중심 계약에서 typography/layout 계약 확장
- Guardrails: ToolResult/NormalizedContent 계약과 충돌 금지
- Slice D1: 계약 스펙 초안(typography/layout)
- Slice D2: adapter 레이어 확장 설계

### Track E: Data Input Domain Modules (Post-069)
- Scope: Data Input command/model/view 분리 고도화
- Guardrails: UX/단축키/미디어 흐름 유지
- Slice E1: command/model/view 인터페이스 분리
- Slice E2: 미디어 파이프라인 재정리

## Guardrails (Applies to all tracks)
- core/feature/ui 레이어 규칙 준수
- innerHTML/dangerouslySetInnerHTML sanitize 선행
- JSON-safe persistence 유지
- 스파게티 방지: 작은 배치로만 진행

## Acceptance Criteria
- [ ] 최소 5개 트랙(A~E)에 대해 목적/범위/리스크가 문서화된다.
- [ ] 각 트랙이 실행 가능한 후속 태스크(071+)로 분해 가능한 수준으로 정의된다.
- [ ] 아키텍처 가드레일(레이어 규칙/보안/JSON-safe)이 각 트랙에 반영된다.
- [ ] 사용자 승인 후 바로 구현 착수 가능한 백로그 형태를 제공한다.

## Risks / Roll-back Notes
- 리팩토링 과대 설계 위험: 실제 변경 단위를 작게 유지해야 함.
- 문서만 상세하고 실행 태스크가 불명확할 위험: 태스크 분해 기준을 명시적으로 남김.
- 롤백은 planning-only task 특성상 N/A (코드 변경 없음).

## Manual Verification (No automated tests)
1. 문서 리뷰: 사용자/구현자 관점에서 범위와 우선순위가 명확한지 확인
2. 각 트랙이 독립 구현 가능한지(파일 범위 겹침 최소) 점검
3. 후속 태스크 템플릿으로 바로 복제 가능한지 확인

---

## Implementation Log (Codex)
Status: COMPLETED
Changed files:
- `codex_tasks/task_070_modular_refactor_roadmap.md`

Commands run:
- None (not requested)

Notes:
- Planning-only expansion to complete deliverables.
