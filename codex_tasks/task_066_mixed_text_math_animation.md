# Task 066: Mixed Text+Math Sequential Animation

**Status:** COMPLETED  
**Priority:** P2 (UX/Animation)  
**Assignee:** Codex CLI  
**Dependencies:** None

## Context
한 블록 안에 텍스트와 수식이 섞여 있을 때도 서로 다른 애니메이션 스타일로 진행되길 원함.  
요구: 텍스트 → 수식 → 텍스트 순서로 **순차 애니메이션**.

## Goals
1. 한 텍스트 블록 내부에서 **텍스트와 수식을 순차적으로 애니메이션**한다.
2. 텍스트 구간은 기존 `AnimatedTextBlock` 스타일(리빌 + 하이라이트 2-pass).
3. 수식 구간은 기존 `MathRevealBlock` 스타일(스캔 리빌).
4. **레이아웃/줄바꿈 유지**: 애니메이션 중에도 줄바꿈/폭이 흔들리지 않는다.
5. 하이라이터 커서/스타일은 기존 유지.

## Non-Goals
- 데이터 모델(블록 분할) 변경
- 하이라이터 커서/스타일 변경
- 신규 의존성 추가
- MathJax 자체 렌더링 규칙 변경

## Scope (Files)
- `v10/src/features/editor/canvas/animation/MixedRevealBlock.tsx` (신규)
- `v10/src/features/editor/canvas/ContentLayer.tsx` (혼합 블록 감지 + MixedRevealBlock 사용)
- (필요 시) `v10/src/features/editor/canvas/animation/AnimatedTextBlock.tsx` (유틸 재사용/조정)

## Detailed Design
- `MixedRevealBlock`는 **MathJax typeset 이후 DOM**을 기반으로 텍스트 런 / 수식 런을 분해한다.
  - `mjx-container`는 수식 런으로 취급한다.
  - `mjx-container` 외부의 텍스트 노드/인라인 노드는 텍스트 런으로 묶는다.
- 런 순서대로 애니메이션을 진행한다:
  - 텍스트 런: 타이핑/리빌 애니메이션
  - 수식 런: MathReveal 방식
- 각 런의 애니메이션 종료 시 다음 런으로 진행.
- 전체 런 완료 시 `onDone` 호출.
- `skipSignal/stopSignal` 동작은 기존과 동일.
- 커서(Chalk) 이동도 런 기준으로 이어진다.
- **레이아웃 유지**를 위해 비활성 런은 `visibility: hidden`을 사용하고 공간은 유지한다.

## Acceptance Criteria
- [ ] 한 블록 안의 텍스트/수식이 **순차적으로** 다른 애니메이션으로 표현된다.
- [ ] 레이아웃/줄바꿈이 애니메이션 도중 흔들리지 않는다.
- [ ] 하이라이트(hl-yellow/hl-cyan) 애니메이션은 기존과 동일하게 동작한다.
- [ ] 수식 전용 블록은 기존 `MathRevealBlock` 동작 유지.
- [ ] 텍스트 전용 블록은 기존 `AnimatedTextBlock` 동작 유지.
- [ ] `skip/stop` 동작 정상.
- [ ] 혼합 블록은 **math + text 구간을 모두 포함**할 때만 MixedReveal가 적용된다.

## Risks / Rollback
- MathJax typeset 타이밍 지연 시 런 진행이 늦어질 수 있음.
- 문제 발생 시 MixedRevealBlock 사용을 비활성화하고 기존 분기 로직으로 롤백.

## Manual Verification Notes
- 텍스트+수식 혼합 문장에서 순차 애니메이션 확인.
- 줄바꿈/레이아웃 안정성 확인.
- 하이라이트 애니메이션 유지 확인.
- 수식만 있는 문장은 기존 MathReveal와 동일한 느낌인지 확인.

---

## Completion Notes
**Changed Files**
- `v10/src/features/editor/canvas/animation/MixedRevealBlock.tsx`
- `v10/src/features/editor/canvas/ContentLayer.tsx`

**Commands Run**
- None.

**Manual Verification Notes**
- 혼합 블록에서 텍스트 → 수식 → 텍스트 순차 애니메이션 확인.
- 하이라이트(hl-yellow/hl-cyan) 애니메이션 유지 여부 확인.
- 수식 전용/텍스트 전용 블록 동작이 기존과 동일한지 확인.
- 수식이 포함된 스텝에서 자동 재생이 다음 스텝으로 정상 진행되는지 확인.
- 혼합 블록 애니메이션 중/후 위치가 흔들리거나 보정되는지 확인.

**Revision Notes**
- 혼합 블록은 단일 DOM(Typeset 결과)에서 직접 애니메이션하여 레이아웃 보정/튐 현상을 제거.
- 혼합 텍스트 런에서 `spans` 안전 가드 추가로 `classList` undefined 런타임 에러 방지.
- `ContentLayer`의 `MixedRevealBlock` 호출부에서 미사용 `layoutMode` prop 제거.
- 혼합 텍스트 런 리빌을 per-char 토글에서 런 clip-path 와이프 방식으로 변경하여 프레임 안정화.
- 혼합 텍스트 런에서 clip-path 초기화 후 표시하도록 순서 조정 및 `contentRef`를 inline-block으로 맞춰 텍스트 단일 스텝 UX와 정합.
- 혼합 텍스트 런을 라인 세그먼트 래퍼로 감싸고 clip-path를 세그먼트에 적용하여 이전 텍스트/수식이 사라지는 현상 방지.
- 혼합 텍스트 런 리빌을 오버레이 클론 방식으로 전환해 원본 DOM 재정렬을 방지.
- 수식 리빌을 센터 블룸+팝(blur/scale/opacity) 방식으로 변경.
- 오버레이 좌표를 보드 좌표계(스케일 보정)로 계산해 클론/원본 위치 점프 현상 완화.
