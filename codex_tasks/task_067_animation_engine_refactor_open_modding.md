# Task 067: Animation Engine Refactor + Open Modding Contract

**Status:** COMPLETED  
**Priority:** P1 (Architecture / UX Stability / Extensibility)  
**Assignee:** Codex CLI  
**Dependencies:** Task 066, hotfix 041-044

## Context
- 현재 mixed(text+math) 애니메이션은 오버레이 복제 레이어 기반이라, step 종료 시 텍스트가 미세하게 위치 보정되며 "위로 튀는" 현상이 남아 있음.
- 단일 텍스트/수식 애니메이션 대비 mixed 경로의 코드 책임이 과도하게 크고 결합도가 높아, 추후 애니메이션 다양화와 사용자 커스터마이징 확장 시 유지보수 비용이 급증할 위험이 있음.
- 목표 제품 방향은 "modding 가능한 개방형 프로그램"이지만, 앱 전체 소스코드 공개가 전제는 아님.

## Goals
1. Mixed step 종료 시 텍스트 위치 스냅(미세 점프) 문제를 구조적으로 제거한다.
2. 텍스트/수식/혼합 애니메이션 실행 경로를 공통 런타임으로 정리해 복잡도를 낮춘다.
3. 애니메이션 로직을 `plan/measure/runtime/preset`로 분리해 사람 개발자와 AI 모두 유지보수하기 쉽게 만든다.
4. "형식중립(format-agnostic) modding 계약"을 정의한다.
5. 고급 사용자 커스터마이징은 앱 코어 소스 공개 없이도 가능한 구조로 설계한다.
6. 애니메이션 엔진 구현이 폰트 스타일링 구현과 직접 결합되지 않도록 경계를 명확히 분리한다.
7. Vercel preview + 태블릿 UX 검사 시 동작 안정성을 보장한다.

## Non-Goals
- 앱 전체 소스코드 공개/오픈소스 전환.
- 임의 JS 실행형 플러그인 시스템 (eval/new Function 기반) 도입.
- 마켓플레이스/서명 인프라/원격 배포 시스템의 완전 구현.
- 신규 외부 의존성 추가.
- 폰트 스타일링 기능 자체(폰트 UI/폰트 에셋/폰트 적용 정책)의 구현 완료.

## Scope (Files)
- `v10/src/features/canvas/ContentLayer.tsx`
- `v10/src/features/hooks/useSequence.ts`
- `v10/src/features/canvas/animation/MixedRevealBlock.tsx` (분해 또는 경량 래퍼화)
- `v10/src/features/canvas/animation/AnimatedTextBlock.tsx` (공용 primitive 추출 반영)
- `v10/src/features/canvas/animation/MathRevealBlock.tsx` (공용 primitive 추출 반영)
- `v10/src/features/canvas/animation/RichTextAnimator.tsx` (new)
- `v10/src/features/animation/model/animationProfile.ts` (new)
- `v10/src/features/animation/model/builtinProfiles.ts` (new)
- `v10/src/features/animation/plan/compileAnimationPlan.ts` (new)
- `v10/src/features/animation/plan/measureAnimationPlan.ts` (new)
- `v10/src/features/animation/runtime/playAnimationPlan.ts` (new)
- `v10/src/features/animation/runtime/types.ts` (new)
- `v10/src/features/animation/modding/modContract.ts` (new)
- `v10/src/features/animation/modding/normalizeModProfile.ts` (new)
- `v10/src/core/types/canvas.ts` (필요 시 최소 필드 확장)
- `v10/src/core/migrations/migrateToV2.ts` (필요 시 최소 migration 보강)
- `v10/AI_READ_ME.md` (규칙/핵심 플로우 변경 시)
- `v10/AI_READ_ME_MAP.md` (구조 변경 시 자동 갱신)

## Out of Scope
- `root/` 레거시 Vite 앱 변경
- 신규 패키지 설치
- 인증/결제/서버 연동 기반 모드 배포 시스템

## Detailed Design

### A) 실행 구조 리팩터링
- 기존 분기:
  - `ContentLayer`에서 `AnimatedTextBlock` / `MixedRevealBlock`를 직접 분기.
- 변경 후:
  - `ContentLayer`는 `RichTextAnimator` 하나만 호출.
  - `RichTextAnimator` 내부에서 텍스트/수식/혼합 여부를 plan 단계에서 판별.
  - 렌더/측정/재생이 서로 독립 모듈로 동작.

### B) Mixed 점프 제거 원칙
- 오버레이-원본 스왑으로 인한 라인 박스 불일치를 최소화한다.
- 원칙:
  - 가능하면 "동일 DOM에서 클립/마스크 진행" 우선.
  - 불가피한 오버레이 사용 시, 측정 기준을 원본 라인 박스와 동기화하고 스왑 타이밍을 단일화.
  - 종료 프레임에서 시각 상태와 실제 DOM 상태가 불일치하지 않도록 runtime에서 원자적 전환.

### C) Modding 계약 (형식중립)
- 내부 표준: `AnimationProfile` 타입(런타임이 이해하는 정규화 모델).
- 외부 입력 형식:
  - JSON만 강제하지 않음.
  - 어떤 형식이든 import 단계에서 `AnimationProfile`로 정규화 가능하면 허용.
- 정책:
  - "프로그램 전체 소스 공개" 없이도 profile/pack 단위 확장 가능.
  - 코어 엔진 API는 안정적 계약으로 제공.
  - 임의 실행 코드 삽입은 금지하고, 선언형 파라미터/조합 기반 확장을 우선.

### E) Animation vs Font 경계
- 애니메이션 엔진은 글꼴 선택/로드/테마 결정 로직을 소유하지 않는다.
- 애니메이션 런타임은 "현재 렌더된 DOM 메트릭"을 사용해 동작하며, 특정 폰트 이름이나 스타일 클래스에 하드코딩 의존하지 않는다.
- 향후 폰트 커스터마이징 task와 병행되어도 애니메이션 엔진 코어 모듈 수정 없이 profile/입력값만으로 동작하도록 설계한다.

### D) Vercel + 태블릿 기준
- 배포 타겟은 `v10/`.
- 로컬과 Vercel preview 간 레이아웃/애니메이션 결과가 크게 다르지 않아야 함.
- 터치 환경(iPad/Android 태블릿)에서 재생 시 mixed 텍스트 점프가 재현되지 않아야 함.

## Dependencies / Constraints
- New dependencies: **NO**
- Guardrails:
  - No `eval`, `new Function`
  - No `window` globals
  - `innerHTML` 경로는 기존 sanitize 흐름 유지
  - JSON-safe persistence 원칙 유지
- Layer rules:
  - `core` -> only `core`
  - `features` -> `core` + `ui`
  - `app` -> `features` + `ui`

## Documentation Update Check
- [ ] 구조 변경(파일/폴더 추가·이동·삭제) 발생 시: `node scripts/gen_ai_read_me_map.mjs` 실행하여 `v10/AI_READ_ME_MAP.md` 갱신 여부 확인
- [ ] 규칙/의미 변경(레이어 규칙, 불변조건, 핵심 플로우 등) 발생 시: `v10/AI_READ_ME.md` 갱신 여부 확인

## Acceptance Criteria
- [ ] Mixed step 종료 시 텍스트가 위로 튀는 미세 점프가 재현되지 않는다.
- [ ] 텍스트 전용 step 기존 품질(43/44) 유지.
- [ ] 수식 전용 step 기존 품질 유지.
- [ ] `pause/skip/stop/speed` 동작이 기존과 동일하게 유지된다.
- [ ] `ContentLayer`가 텍스트 애니메이션 컴포넌트를 다중 분기하지 않고 단일 진입점(`RichTextAnimator`)을 사용한다.
- [ ] modding 계약(`AnimationProfile`)이 코드에 명시되고, 형식중립 정규화 경로가 존재한다.
- [ ] 애니메이션 코어 모듈에 폰트 이름/폰트 로더/폰트 클래스 하드코딩이 없다.
- [ ] Vercel preview에서 빌드 성공 및 태블릿 재생 UX 수동 검사 통과.

## Manual Verification Steps (No automated tests)
1. 로컬 빌드 확인
   - `cd v10 && npm run build`
2. 로컬 재생 확인
   - 혼합 문장(텍스트+수식+텍스트) step 재생
   - 종료 프레임에서 텍스트 수직 스냅 유무 확인
3. 제어 신호 확인
   - `pause`, `resume`, `skip`, `stop`, 속도 변경 각각 확인
4. Vercel preview 배포 확인
   - Project Root: `v10`
   - Preview URL에서 동일 시나리오 점검
5. 태블릿 실기기 확인
   - iPad 또는 Android 태블릿에서 mixed step 재생
   - 점프/깜빡임/커서 불연속 유무 확인

## Risks / Rollback Notes
- Risk: 런타임 분리 과정에서 기존 효과(하이라이트, 커서 타이밍) 체감이 바뀔 수 있음.
- Risk: 측정/렌더 경계 조정 중 회귀 발생 가능.
- Rollback:
  - `ContentLayer`에서 기존 분기(`AnimatedTextBlock`/`MixedRevealBlock`)로 즉시 복귀 가능하도록 진입점 유지.
  - `RichTextAnimator`를 feature flag 또는 단일 분기 스위치로 비활성화 가능한 구조로 유지.

---

## Implementation Log (Codex fills)
**Status:** COMPLETED
**Changed files:**  
- `codex_tasks/task_067_animation_engine_refactor_open_modding.md`
- `v10/src/features/canvas/ContentLayer.tsx`
- `v10/src/features/canvas/animation/MixedRevealBlock.tsx`
- `v10/src/features/canvas/animation/RichTextAnimator.tsx`
- `v10/src/features/hooks/useSequence.ts`
- `v10/src/features/animation/model/animationProfile.ts`
- `v10/src/features/animation/model/builtinProfiles.ts`
- `v10/src/features/animation/plan/compileAnimationPlan.ts`
- `v10/src/features/animation/plan/measureAnimationPlan.ts`
- `v10/src/features/animation/runtime/types.ts`
- `v10/src/features/animation/runtime/playAnimationPlan.ts`
- `v10/src/features/animation/modding/modContract.ts`
- `v10/src/features/animation/modding/normalizeModProfile.ts`
- `v10/AI_READ_ME.md`
- `v10/AI_READ_ME_MAP.md`

**Commands run (only if user asked):**  
- `node scripts/gen_ai_read_me_map.mjs`

**Notes:**  
- 본 작업은 "개방형 modding"을 목표로 하되, 앱 전체 소스 공개를 요구하지 않는 계약형 확장 구조를 전제로 한다.
- `ContentLayer` active text 렌더 경로를 `RichTextAnimator` 단일 진입점으로 통합함.
- Mixed 경로는 기존 오버레이 복제 방식 대신 plan/measure/runtime 기반 실행으로 전환함.
- Animation core는 폰트명/폰트로더 하드코딩 없이 DOM 메트릭 기반으로 동작하도록 분리함.
- 로컬 빌드/태블릿/Vercel 재생 검증은 아직 실행하지 않았으며, 다음 단계 수동 검증이 필요함.
