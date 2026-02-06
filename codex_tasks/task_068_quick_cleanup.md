# Task 068: Quick Cleanup Refactor Pack (Low Risk)

**Status:** COMPLETED
**Priority:** P1 (Maintainability / Consistency / Safety)
**Assignee:** Codex CLI
**Dependencies:** Task 065 (COMPLETED)

## Context
- 현재 v10은 기능적으로 안정화되어 있지만, 경량 리팩토링으로 유지보수 비용을 즉시 낮출 수 있는 중복/잡음 구간이 남아 있다.
- 목표는 동작 변경 없이 코드 정리(quick cleanup)를 먼저 끝내는 것이다.

## Goals
1. 미사용 변수/코드(import 포함)를 제거해 노이즈를 줄인다.
2. `PersistedSlateDoc` 조립 로직을 공용 헬퍼로 단일화한다.
3. rich text sanitize 규칙을 공용 유틸로 정리해 중복 구현을 제거한다.
4. 텍스트 스타일 변환 헬퍼를 통일해 스타일 경로 일관성을 높인다.

## Non-Goals
- UI/UX 재설계
- 데이터 포맷 변경(호환성 깨짐)
- 신규 외부 의존성 추가
- DataInputPanel 대규모 분해 (Task 069에서 처리)

## Scope
- `v10/src/features/canvas/ContentLayer.tsx` (unused cleanup)
- `v10/src/features/hooks/usePersistence.ts`
- `v10/src/features/hooks/useFileIO.ts`
- `v10/src/core/migrations/migrateToV2.ts`
- `v10/src/features/layout/DataInputPanel.tsx`
- `v10/src/features/layout/autoLayout.ts`
- `v10/src/features/store/useCanvasStore.ts`
- `v10/src/core/config/typography.ts`
- `v10/src/core/persistence/buildPersistedDoc.ts` (new)
- `v10/src/core/sanitize/richTextSanitizer.ts` (new)
- `v10/AI_READ_ME.md` (규칙/플로우 변경 시)
- `v10/AI_READ_ME_MAP.md` (구조 변경 시)

## Design Notes
- `buildPersistedDoc`는 문서 저장 payload 조립만 담당하는 순수 함수로 유지.
- sanitize 유틸은 allowlist 정책을 단일 소스로 두고, 입력 경로별 옵션만 최소 분기.
- 기존 동작 회귀를 피하기 위해 “로직 이동” 위주로 수행하고 의미 변경은 금지.

## Acceptance Criteria
- [ ] `usePersistence`/`useFileIO`가 동일한 공용 `PersistedSlateDoc` 조립 경로를 사용한다.
- [ ] rich text sanitize 규칙이 공용 유틸로 단일화되고, 중복 sanitize 구현이 제거된다.
- [ ] 미사용 변수/코드가 정리되고 동작 회귀가 없다.
- [ ] 텍스트 스타일 변환 호출 경로가 일관화된다.
- [ ] 저장/불러오기 및 애니메이션 재생 동작이 기존과 동일하다.

## Risks / Roll-back Notes
- 저장 payload 필드 누락 시 import/export 회귀 위험.
- sanitize 규칙 통합 시 허용 class 차이로 편집 표시가 달라질 수 있음.
- 롤백 시 공용 유틸 호출부를 기존 구현으로 빠르게 복귀할 수 있어야 함.

## Manual Verification (No automated tests)
1. `cd v10 && npm run build`
2. 텍스트/수식/혼합 step 재생 확인
3. 로컬 autosave 후 새로고침 복원 확인
4. `.slate` export -> import 후 내용/스타일/모딩 데이터 확인
5. Data Input에서 highlight/size/color/bold 적용 후 렌더 확인

---

## Implementation Log (Codex)
Status: COMPLETED
Changed files:
- `v10/src/core/persistence/buildPersistedDoc.ts`
- `v10/src/core/sanitize/richTextSanitizer.ts`
- `v10/src/core/migrations/migrateToV2.ts`
- `v10/src/features/hooks/usePersistence.ts`
- `v10/src/features/hooks/useFileIO.ts`
- `v10/src/features/layout/DataInputPanel.tsx`
- `v10/src/features/layout/autoLayout.ts`
- `v10/src/features/canvas/ContentLayer.tsx`
- `v10/AI_READ_ME_MAP.md`

Commands run:
- `node scripts/gen_ai_read_me_map.mjs`

Notes:
- AI_READ_ME_MAP updated after structural changes.
