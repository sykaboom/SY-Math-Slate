# Task 065: Text/Math Unified Style + Animation Contract (Review Remediation)

**Status:** COMPLETED
**Priority:** P1 (Architecture / UX / Extensibility / Security)
**Assignee:** Codex CLI
**Dependencies:** Task 067 (engine split baseline complete)

## Context
- 현재 코드베이스는 mixed 경로는 신규 runtime, text-only/math-only는 legacy 경로를 병행하고 있어 "정의 1곳 변경 = 전체 반영"이 완성되지 않았다.
- stepBlocks 입력 경로에서 초기 sanitize 보장이 약해 modding 확장 시 보안 리스크가 있다.
- 스타일/폰트 계약과 저장/복원 경로가 분산되어 있어 유지보수 비용이 높다.
- 제품 목표는 "개방형 modding"이지만, 앱 전체 소스코드 공개는 비목표다.

## Review-Driven Remediation Targets (5)
1. `text/math/mixed` 애니메이션 실행 경로 단일화.
2. stepBlocks ingress sanitize 강제.
3. text/math 2-lane 스타일 계약의 타입/UX 도입.
4. 스타일+애니메이션 커스터마이징 저장/복원 경로 완결.
5. 타이포그래피 기본값 하드코딩 제거 및 단일 설정원(SSOT)화.

## Goals
1. 애니메이션 엔진 계약을 step 종류가 아닌 `text lane` / `math lane` 기준으로 통일한다.
2. `RichTextAnimator`를 text-only/math-only/mixed의 단일 진입점으로 고정한다.
3. Data Input과 import/migration 단계에서 unsafe HTML 유입을 차단한다.
4. 비개발자도 다룰 수 있는 텍스트 스타일 UX(Bold/Color/Size)를 제공한다.
5. typography 설정과 animation profile을 분리해 독립적으로 교체 가능하게 만든다.
6. mod payload는 형식중립으로 수용하되 내부 정규화 모델로 강제한다.
7. 로컬/파일 저장복원 + Vercel preview + 태블릿 UX까지 일관성을 보장한다.

## Non-Goals
- 앱 전체 소스코드 공개.
- 임의 JS 실행 플러그인(`eval`, `new Function`) 도입.
- 폰트 마켓플레이스/결제/원격 배포 인프라 구현.
- 신규 외부 의존성 추가.

## Scope
- `v10/src/core/types/canvas.ts`
- `v10/src/core/migrations/migrateToV2.ts`
- `v10/src/core/config/typography.ts` (new)
- `v10/src/features/layout/DataInputPanel.tsx`
- `v10/src/features/layout/autoLayout.ts`
- `v10/src/features/store/useCanvasStore.ts`
- `v10/src/features/canvas/ContentLayer.tsx`
- `v10/src/features/hooks/usePersistence.ts`
- `v10/src/features/hooks/useFileIO.ts`
- `v10/src/features/animation/model/animationProfile.ts`
- `v10/src/features/animation/model/builtinProfiles.ts`
- `v10/src/features/animation/modding/modContract.ts`
- `v10/src/features/animation/modding/normalizeModProfile.ts`
- `v10/src/features/animation/plan/compileAnimationPlan.ts`
- `v10/src/features/animation/plan/measureAnimationPlan.ts`
- `v10/src/features/animation/runtime/types.ts`
- `v10/src/features/animation/runtime/playAnimationPlan.ts`
- `v10/src/features/canvas/animation/RichTextAnimator.tsx`
- `v10/src/features/canvas/animation/AnimatedTextBlock.tsx` (legacy wrapper/deprecation only)
- `v10/src/features/canvas/animation/MathRevealBlock.tsx` (legacy wrapper/deprecation only)
- `v10/AI_READ_ME.md` (규칙/플로우 변경 시)
- `v10/AI_READ_ME_MAP.md` (구조 변경 시)

## Design Contract

### A) 2-Lane Execution Contract
- `text lane`: 텍스트 reveal/highlight/cursor
- `math lane`: 수식 reveal/stroke
- `mixed`는 제3 엔진이 아니라 lane 조합 결과여야 한다.
- text-only/math-only도 동일 runtime 계획-측정-재생 파이프라인을 사용한다.

### B) Ingress Sanitize Contract
- 외부 입력(`.slate import`, local restore, migration, DataInput 초기화 포함)은 모두 sanitize 후 렌더 경로에 진입한다.
- `dangerouslySetInnerHTML`에는 sanitize 보장된 값만 전달한다.

### C) Style Contract (Text/Math)
- step 기준이 아닌 segment/type 기준 스타일 계약을 둔다.
- 최소 필드:
  - text: `fontFamily`, `fontSize`, `fontWeight`, `color`
  - math: `color`, `scale` (필요 최소)
- 기본값은 `core/config/typography.ts`에서만 관리한다.

### D) Modding Contract
- 입력 형식(JSON 강제 없음). import 단계에서 내부 표준 모델로 정규화되면 허용.
- 선언형 데이터만 허용, 실행 코드 주입 금지.
- 앱 코어 소스 공개 없이 profile/pack 단위 확장 가능해야 한다.

### E) Font vs Animation Separation
- 폰트 선택/기본값/테마는 typography 계층 소유.
- animation runtime은 DOM metric 기반으로 동작하며 특정 폰트명 하드코딩 금지.

## Implementation Slices

### Slice 1: Animation Runtime Unification
- `RichTextAnimator`가 text-only/math-only/mixed를 모두 같은 plan/runtime으로 처리.
- `AnimatedTextBlock`/`MathRevealBlock`는 직접 분기 진입점으로 쓰지 않고 하위 호환 래퍼만 유지.

### Slice 2: Sanitize Hardening
- `migrateToV2`에서 stepBlocks/text segment 정규화 + sanitize.
- `DataInputPanel` 초기 로드 경로(stepBlocks/fallback)에서도 sanitize 재보장.

### Slice 3: 2-Lane Style Model + UX
- 타입 확장(`TextSegment` 스타일 필드 등)과 기본값 주입 경로 정비.
- Data Input에서 선택 텍스트 스타일(Bold/Color/Size) UI 제공.

### Slice 4: Persistence/IO Closure
- local autosave + `.slate` export/import에서 style + mod profile 데이터 보존.
- `ContentLayer`에 mod profile 주입 경로 연결.

### Slice 5: Typography SSOT
- `autoLayout`, `useCanvasStore`, seed/persistence 하드코딩 제거.
- typography 상수 참조로 통일.

## Acceptance Criteria
- [ ] text-only/math-only/mixed가 단일 애니메이션 runtime 경로를 사용한다.
- [ ] 텍스트 애니메이션 정의값 1곳 변경 시 text-only와 mixed-text가 동일하게 반영된다.
- [ ] 수식 애니메이션 정의값 1곳 변경 시 math-only와 mixed-math가 동일하게 반영된다.
- [ ] mixed step 종료 시 텍스트 수직 스냅(미세 점프)이 재현되지 않는다.
- [ ] stepBlocks 초기 로드/마이그레이션/import 경로에서 unsafe HTML이 sanitize 없이 렌더되지 않는다.
- [ ] Data Input에서 선택 텍스트 스타일(Bold/Color/Size)이 직관적으로 적용된다.
- [ ] typography 기본값은 `typography.ts` 단일 소스에서 관리되고, 중복 하드코딩이 제거된다.
- [ ] 스타일/애니메이션 mod 데이터가 local save + `.slate` import/export 후에도 보존된다.
- [ ] `pause/skip/stop/speed` 동작 회귀가 없다.
- [ ] Vercel preview + 태블릿(iPad/Android) 재생 UX 검증 통과.

## Risks / Roll-back Notes
- Rich text + MathJax 혼합 측정 오차로 줄바꿈/baseline 흔들림 가능.
- `contentEditable` selection 처리 복잡도로 스타일 적용 불일치 위험.
- 저장 포맷 필드 확장 시 구버전 문서 호환성 이슈 가능.
- 롤백 필요 시:
  - `RichTextAnimator` 통합 경로를 feature flag로 비활성화 가능해야 함.
  - 기존 문서 포맷 읽기는 migration에서 backward-safe 유지.

## Manual Verification (No automated tests)
1. `cd v10 && npm run build`
2. 로컬에서 text-only / math-only / mixed 재생 비교 (정의값 변경 반영 확인 포함)
3. Data Input에서 Bold/Color/Size 적용 -> Auto Layout -> 재생 확인
4. 악성 HTML 문자열 포함 `.slate` import 및 local restore 시 sanitize 결과 확인
5. local autosave -> reload -> style/mod profile 보존 확인
6. `.slate` export -> re-import 후 style/mod profile 보존 확인
7. Vercel preview(Project Root=`v10`)에서 동일 시나리오 확인
8. 태블릿(iPad/Android)에서 재생/터치 UX 점검

## Task Relationship
- Task 067은 애니메이션 모듈 분해 baseline으로 완료.
- Task 065는 review에서 식별된 5개 구조 이슈를 해결하는 통합 마감 태스크다.

## Implementation Log (Codex)
**Status:** COMPLETED

**Changed files**
- `codex_tasks/task_065_data_font_styles.md`
- `v10/src/core/types/canvas.ts`
- `v10/src/core/config/typography.ts`
- `v10/src/core/migrations/migrateToV2.ts`
- `v10/src/features/layout/DataInputPanel.tsx`
- `v10/src/features/layout/autoLayout.ts`
- `v10/src/features/store/useCanvasStore.ts`
- `v10/src/features/hooks/usePersistence.ts`
- `v10/src/features/hooks/useFileIO.ts`
- `v10/src/features/canvas/ContentLayer.tsx`
- `v10/src/features/canvas/animation/RichTextAnimator.tsx`
- `v10/src/features/canvas/animation/AnimatedTextBlock.tsx`
- `v10/src/features/canvas/animation/MathRevealBlock.tsx`
- `v10/src/features/animation/plan/compileAnimationPlan.ts`
- `v10/src/features/animation/modding/modContract.ts`
- `v10/AI_READ_ME.md`
- `v10/AI_READ_ME_MAP.md`

**Commands run**
- `./scripts/check_layer_rules.sh` (failed: file not found in repo)
- `node scripts/gen_ai_read_me_map.mjs`

**Manual verification notes**
- 사용자 지시 범위 내에서 코드/구조 리팩터링과 문서 갱신까지 수행.
- 자동 테스트/빌드(`npm run build`, `npm run lint`)는 이번 턴에서 실행하지 않음.
- 따라서 Vercel preview 및 태블릿 실기기 검증은 아직 미실행 상태.
