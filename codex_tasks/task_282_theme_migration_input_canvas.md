# Task 282: 테마 마이그레이션 — Phase 2-B (input-studio + canvas)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-18

---

## 사전 감사 기록 (직접 Grep, 2026-02-18)

```
[ AUDIT ] input-studio + canvas 하드코딩 대상 파일 7개:
  - features/input-studio/components/InputStudioActionsSection.tsx (text+border+bg)
  - features/input-studio/components/InputStudioBlocksSection.tsx  (text+bg)
  - features/input-studio/components/InputStudioRawSection.tsx     (text+border+bg)
  - features/input-studio/components/InputStudioHeaderSection.tsx  (text+border+bg)
  - features/canvas/CanvasStage.tsx                                (text+bg)
  - features/canvas/PasteHelperModal.tsx                           (text+border+bg)
  - features/canvas/ContentLayer.tsx                               (text+bg)

[ NOTE ] CanvasStage.tsx: 캔버스 배경 색상은 별도 처리 (bg-slate-app 유지)
         text/border className만 교체 대상
[ NOTE ] ContentLayer.tsx: 컨텐츠 레이어 오버레이 색상만 교체 (캔버스 드로잉 영역 불변)
[ PASS ] task_279 완료 후 theme-* 유틸리티 사용 가능
```

---

## Goal (Base Required)

- What to change:
  - input-studio 4개 파일, canvas 3개 파일의 하드코딩 색상 → `theme-*` 유틸리티 교체
- What must NOT change:
  - 모든 컴포넌트의 로직, props, 레이아웃 구조 변경 없음
  - `CanvasStage.tsx`의 `bg-slate-app` 유지 (캔버스 배경은 별도 CSS var)
  - 드로잉/렌더링 로직, SVG/Canvas API 호출 변경 없음
  - className 문자열만 수정

---

## Scope (Base Required)

Touched files/directories (write only):
- `v10/src/features/editor/input-studio/components/InputStudioActionsSection.tsx`
- `v10/src/features/editor/input-studio/components/InputStudioBlocksSection.tsx`
- `v10/src/features/editor/input-studio/components/InputStudioRawSection.tsx`
- `v10/src/features/editor/input-studio/components/InputStudioHeaderSection.tsx`
- `v10/src/features/editor/canvas/CanvasStage.tsx`
- `v10/src/features/editor/canvas/PasteHelperModal.tsx`
- `v10/src/features/editor/canvas/ContentLayer.tsx`

Out of scope:
- mod-studio 파일 (task_281)
- layout + ui 파일 (task_283)
- `bg-slate-app` 교체 (별도 태스크)
- 드로잉/Canvas API 로직

---

## 교체 매핑 규칙

task_281과 동일한 매핑 적용:
```
text-white → text-theme-text
text-white/N → text-theme-text/N
border-white/N → border-theme-border/N
bg-black/N → bg-theme-surface/N
bg-white/N (≤15) → bg-theme-surface-soft
bg-white/N (>15) → bg-theme-surface/N
bg-slate-app → 유지 (교체 금지)
```

**canvas 파일 주의:**
- `CanvasStage.tsx`: 캔버스 wrapper div의 배경/텍스트 className만 교체. canvas element 속성 불변.
- `ContentLayer.tsx`: 오버레이/UI 레이어 className만 교체. 렌더링 파이프라인 불변.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - className 문자열만 수정. import 변경 없음.
  - `bg-slate-app` 교체 금지
- Compatibility:
  - task_279 완료(theme-* 유틸리티) 이후에만 실행
  - chalk 기본값 시각 회귀 없음

---

## DAG / Wave Metadata (Base Required)

- Wave ID: W3-theme-migration
- Depends on tasks: [task_279]
- Enables tasks: [Phase 2 전체 마이그레이션 완료]
- Parallel group: G3-theme (task_280, task_281, task_283과 파일 충돌 없음 → 동시 실행)
- Max parallel slots: 6
- Verification stage: `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count: 7
- Files shared with other PENDING tasks: 없음
- Cross-module dependency: NO (input-studio + canvas 내부)
- Parallelizable sub-units: 0 (단일 에이전트 순차)
- Estimated single-agent duration: ~30min
- Recommended mode: DELEGATED (single-agent lane)
- Batch-eligible: YES (Wave 3, task_280/281/283과 동시)
- Rationale: task_281과 동일. className 교체 주 작업, canvas 파일 주의사항 파악 위해 단일 에이전트 순차.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: NO (className 교체만)

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- Execution mode: DELEGATED
- Delegation chain scope: task_282 only
- Assigned roles:
  - Implementer-A: 7개 파일 순차 교체
  - Reviewer+Verifier: Codex final gate
- File ownership lock plan: 7개 파일 Implementer-A 단독 소유
- Parallel slot plan: 내부 병렬 없음
- Scheduler plan:
  - Slot allocation mode: DYNAMIC
  - Slot priority rule: dependency-first
  - Requested orchestration mode: max orchestration mode on
  - Initial slot split: 1 executor + 0 reviewer
  - Ready-queue refill trigger: task_279 완료 시 Wave 3 동시 등록
  - Agent close/reuse policy: 완료 즉시 close
  - Heartbeat / Reassignment: task_281과 동일
- Delegated closeout metrics: Peak 1 / Average 1 / Refill 1 / Reassignment 0

---

## Optional Block C — Hotfix Exception

- [x] Applies: NO

---

## Optional Block D — Speculative Defense Check

- [x] Applies: NO

---

## Optional Block E — Documentation Update Check

- [x] Applies: YES
- [x] Semantic/rule changes:
  - v10/AI_READ_ME.md Phase 2 마이그레이션 현황에 task_282 완료 기록

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: 7개 파일에서 `text-(white|black|gray|slate|zinc|neutral)\b` 매치 없음
- [ ] AC-2: 7개 파일에서 `border-(white|black|gray|slate|zinc|neutral)\b` 매치 없음
- [ ] AC-3: 7개 파일에서 `bg-(white|black|gray|slate|zinc|neutral)\b` 매치 없음
  - 단, `CanvasStage.tsx`의 `bg-slate-app`은 허용 (교체 대상 아님)
- [ ] AC-4: parchment 전환 시 input-studio, 모달 등 UI 색상 변경 확인
- [ ] AC-5: 캔버스 드로잉 기능 정상 동작 (캔버스 영역 시각 회귀 없음)
- [ ] AC-6: `npm run lint` 통과
- [ ] AC-7: `npm run build` 통과

---

## Manual Verification Steps (Base Required)

1) Step: 하드코딩 제거 확인
   - Command:
     ```
     grep -rn "text-white\b\|text-black\|border-white/\|bg-black/\|bg-white/" \
       v10/src/features/editor/input-studio/components/ \
       v10/src/features/editor/canvas/CanvasStage.tsx \
       v10/src/features/editor/canvas/PasteHelperModal.tsx \
       v10/src/features/editor/canvas/ContentLayer.tsx
     ```
   - Expected: 매치 없음
   - Covers: AC-1, AC-2, AC-3

2) Step: bg-slate-app 유지 확인
   - Command: `grep -n "bg-slate-app" v10/src/features/editor/canvas/CanvasStage.tsx`
   - Expected: 잔존 (교체하지 않음)
   - Covers: AC-3 예외

3) Step: 테마 전환 시각 확인
   - Command: parchment 전환 → Input Studio 패널 열기 → UI 색상 확인
   - Expected: input-studio 패널 UI가 parchment 팔레트 반영
   - Covers: AC-4

4) Step: 캔버스 기능 확인
   - Command: 캔버스에서 드로잉, 텍스트 입력 등 기본 기능 확인
   - Expected: 기능 이상 없음
   - Covers: AC-5

5) Step: 빌드 확인
   - Command: `cd v10 && npm run lint && npm run build`
   - Covers: AC-6, AC-7

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - `CanvasStage.tsx`에서 canvas element style 속성과 혼동하여 잘못된 교체 발생 가능
    → React className prop만 교체, `style={}` 속성 및 canvas API 호출 불변 확인
  - `ContentLayer.tsx` 오버레이 교체 시 캔버스 드로잉과 색상 충돌 가능
    → chalk 테마에서 오버레이 색상이 기존과 동일한지 AC-5에서 확인
- Roll-back: `git revert <commit>` 한 줄

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received

> Prerequisite: task_279 COMPLETED.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/features/editor/input-studio/components/InputStudioActionsSection.tsx`
- `v10/src/features/editor/input-studio/components/InputStudioBlocksSection.tsx`
- `v10/src/features/editor/input-studio/components/InputStudioRawSection.tsx`
- `v10/src/features/editor/input-studio/components/InputStudioHeaderSection.tsx`
- `v10/src/features/editor/canvas/CanvasStage.tsx`
- `v10/src/features/editor/canvas/PasteHelperModal.tsx`
- `v10/src/features/editor/canvas/ContentLayer.tsx`

Commands run:
- `bash scripts/check_layer_rules.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`

## Gate Results (Codex fills)

- Lint: PASS
- Build: PASS
- Script checks: PASS (`check_layer_rules`)

## Failure Classification (Codex fills when any gate fails)

- none

Manual verification notes:
- 대상 7개 파일의 하드코딩 색상 패턴(text/border/bg) 제거 확인.
- `CanvasStage`의 캔버스 동작 로직은 미변경이며 드로잉 동작 정상 확인.
- spec의 `bg-slate-app` 예외는 허용 조건으로 처리(현 파일 기준 해당 클래스 직접 사용 없음).
