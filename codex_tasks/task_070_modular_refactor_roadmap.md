# Task 070: Modular Refactor Roadmap Spec (Planning-Only)

**Status:** PENDING
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

