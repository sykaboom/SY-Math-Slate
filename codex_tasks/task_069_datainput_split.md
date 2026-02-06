# Task 069: DataInputPanel Lightweight Split (Behavior-Preserving)

**Status:** PENDING
**Priority:** P1 (Maintainability / Developer Velocity)
**Assignee:** Codex CLI
**Dependencies:** Task 068 (권장 선행), Task 065 (COMPLETED)

## Context
- `DataInputPanel.tsx`는 현재 입력/정규화/selection 명령/미디어 처리/UI 렌더를 한 파일에서 처리해 읽기/수정 비용이 높다.
- 동작은 유지하면서 파일 책임을 분리하는 경량 구조 개선이 필요하다.

## Goals
1. `DataInputPanel`의 도메인별 책임을 분리한다.
2. 로직 분리 후에도 현재 UX와 단축 작업 흐름(수식/하이라이트/스타일/미디어/브레이크)을 그대로 유지한다.
3. 향후 기능 추가 시 “한 모듈 수정”으로 끝나는 구조를 만든다.

## Non-Goals
- Data Input UI 재디자인
- 신규 기능 추가
- 저장 포맷 변경
- animation/runtime 로직 변경

## Scope
- `v10/src/features/layout/DataInputPanel.tsx`
- `v10/src/features/layout/dataInput/segmentCommands.ts` (new)
- `v10/src/features/layout/dataInput/blockDraft.ts` (new)
- `v10/src/features/layout/dataInput/mediaIO.ts` (new)
- `v10/src/features/layout/dataInput/types.ts` (new, 필요 시)
- `v10/AI_READ_ME.md` (규칙/핵심 플로우 변경 시)
- `v10/AI_READ_ME_MAP.md` (구조 변경 시)

## Split Plan
### A) Segment Commands
- 선택 영역 래핑/수식 삽입/스타일 클래스 적용 명령 분리

### B) Block Draft Normalization
- block/segment 정렬 및 sanitize 정규화 로직 분리

### C) Media IO
- 이미지/비디오 파일/URL 로드 보조 로직 분리

### D) Panel Shell
- `DataInputPanel.tsx`는 상태 조립 + UI wiring 중심으로 축소

## Acceptance Criteria
- [ ] `DataInputPanel.tsx`의 책임이 분해되어 파일 복잡도가 감소한다.
- [ ] 텍스트 편집/하이라이트/수식/폰트 스타일 적용 흐름이 기존과 동일하게 동작한다.
- [ ] 이미지/비디오 추가/삭제/순서 변경이 기존과 동일하게 동작한다.
- [ ] 줄바꿈/단나눔/페이지 브레이크 및 Auto Layout 적용이 기존과 동일하다.
- [ ] 보안 규칙(sanitize after input)과 저장/복원 호환성이 유지된다.

## Risks / Roll-back Notes
- 분리 과정에서 ref/selection wiring 누락 시 버튼 무반응 위험.
- 미디어 로더 분리 시 async 흐름 누락 가능.
- 롤백 시 `DataInputPanel.tsx` 단일 파일로 임시 복귀 가능한 분리 단위를 유지.

## Manual Verification (No automated tests)
1. `cd v10 && npm run build`
2. Data Input에서 텍스트 입력 -> 스타일(Bold/Color/Size/Font) 적용 확인
3. 선택 영역에 `$$`/`HL` 적용 확인
4. 이미지/비디오(file+url) 추가/삭제/재정렬 확인
5. 줄바꿈/단나눔/페이지 삽입 후 Auto Layout 결과 확인
6. 저장 후 reload 및 `.slate` import/export 회귀 확인

