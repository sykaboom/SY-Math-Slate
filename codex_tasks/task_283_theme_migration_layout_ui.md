# Task 283: 테마 마이그레이션 — Phase 2-C (layout + ui 잔여)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-18

---

## 사전 감사 기록 (직접 Grep, 2026-02-18)

```
[ AUDIT ] 잔여 파일 6개 (task_279/281/282 이후 미처리분):

  text + border + bg:
  - features/layout/DataInputPanel.tsx
  - features/layout/PlayerBar.tsx
  - features/layout/Prompter.tsx

  bg 전용 (text/border 하드코딩 없음):
  - features/layout/OverviewStage.tsx
  - features/canvas/objects/ImageBlock.tsx
  - ui/components/dialog.tsx

[ NOTE ] dialog.tsx: ui/ 레이어. Radix UI wrapper.
         bg 색상만 교체. API/접근성 속성 불변.
[ NOTE ] ImageBlock.tsx: canvas/objects/ 레이어.
         이미지 로딩/렌더링 로직 불변, wrapper div bg만 교체.
[ PASS ] task_279 완료 후 theme-* 유틸리티 사용 가능
```

---

## Goal (Base Required)

- What to change:
  - 잔여 6개 파일의 하드코딩 색상 → `theme-*` 유틸리티 교체
  - Phase 2 전체 마이그레이션 완료
- What must NOT change:
  - `dialog.tsx` Radix UI API 및 접근성 속성 변경 없음
  - `ImageBlock.tsx` 이미지 렌더링 로직 변경 없음
  - className 문자열만 수정

---

## Scope (Base Required)

Touched files/directories (write only):
- `v10/src/features/chrome/layout/DataInputPanel.tsx`
- `v10/src/features/chrome/layout/PlayerBar.tsx`
- `v10/src/features/chrome/layout/Prompter.tsx`
- `v10/src/features/chrome/layout/OverviewStage.tsx`
- `v10/src/features/editor/canvas/objects/ImageBlock.tsx`
- `v10/src/ui/components/dialog.tsx`

Out of scope:
- mod-studio (task_281), input-studio + canvas 주요 파일 (task_282)
- `toolbar-*` 클래스 마이그레이션 (별도 태스크)
- dialog.tsx의 Radix UI 속성 변경

---

## 교체 매핑 규칙

task_281/282와 동일:
```
text-white/N   → text-theme-text/N
border-white/N → border-theme-border/N
bg-black/N     → bg-theme-surface/N
bg-white/N (≤15) → bg-theme-surface-soft
bg-white/N (>15) → bg-theme-surface/N
bg-gray-*      → bg-theme-surface
bg-white       → bg-theme-surface
```

**파일별 주의:**
- `dialog.tsx`: Radix 오버레이 배경(`bg-black/80` 등) → `bg-theme-surface/80`. `data-*` 속성, `role`, `aria-*` 불변.
- `ImageBlock.tsx`: 이미지 로딩 placeholder bg만 교체. `<img>` 또는 canvas 렌더링 불변.
- `OverviewStage.tsx`: 오버뷰 배경 overlay만 교체. 스케일/위치 계산 불변.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - `ui/components/dialog.tsx` → ui 레이어. features 또는 core import 추가 금지.
  - className만 수정.
- Compatibility:
  - task_279 완료(theme-* 유틸리티) 이후 실행
  - Phase 2 완료 = task_281 + task_282 + task_283 모두 완료 시

---

## DAG / Wave Metadata (Base Required)

- Wave ID: W3-theme-migration
- Depends on tasks: [task_279]
- Enables tasks: [Phase 2 마이그레이션 완료 선언, Phase 3-B 착수 가능]
- Parallel group: G3-theme (task_280, task_281, task_282와 파일 충돌 없음 → 동시 실행)
- Max parallel slots: 6
- Verification stage: `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count: 6
- Files shared with other PENDING tasks: 없음
- Cross-module dependency: YES (ui/components/dialog.tsx — ui 레이어)
  - className만 수정이므로 실질적 cross-module 위험 없음
- Parallelizable sub-units: 0
- Estimated single-agent duration: ~25min
- Recommended mode: DELEGATED (single-agent lane)
- Batch-eligible: YES (Wave 3, task_280/281/282와 동시)
- Rationale: 파일 수 가장 적음. dialog.tsx의 Radix 패턴 인지 후 단일 에이전트 순차 처리.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- Execution mode: DELEGATED
- Delegation chain scope: task_283 only
- Assigned roles:
  - Implementer-A: 6개 파일 순차 교체
  - Reviewer+Verifier: Codex final gate
- File ownership lock plan: 6개 파일 Implementer-A 단독 소유
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
  - v10/AI_READ_ME.md Phase 2 마이그레이션 완료 기록
    (task_281 + task_282 + task_283 모두 완료 시 "Phase 2 DONE" 표기)

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: 6개 파일에서 `text-(white|black|gray|slate|zinc|neutral)\b` 매치 없음
- [ ] AC-2: 6개 파일에서 `border-(white|black|gray|slate|zinc|neutral)\b` 매치 없음
- [ ] AC-3: 6개 파일에서 `bg-(white|black|gray|slate|zinc|neutral)\b` 매치 없음
- [ ] AC-4: parchment 전환 시 DataInputPanel, PlayerBar, Prompter 색상 변경 확인
- [ ] AC-5: `dialog.tsx` Radix 접근성 속성 불변 (aria-*, data-*, role 변경 없음)
- [ ] AC-6: `npm run lint` 통과
- [ ] AC-7: `npm run build` 통과

---

## Manual Verification Steps (Base Required)

1) Step: 하드코딩 제거 확인
   - Command:
     ```
     grep -n "text-white\b\|text-black\|border-white/\|bg-black/\|bg-white/\|bg-gray\|bg-slate\b" \
       v10/src/features/chrome/layout/DataInputPanel.tsx \
       v10/src/features/chrome/layout/PlayerBar.tsx \
       v10/src/features/chrome/layout/Prompter.tsx \
       v10/src/features/chrome/layout/OverviewStage.tsx \
       v10/src/features/editor/canvas/objects/ImageBlock.tsx \
       v10/src/ui/components/dialog.tsx
     ```
   - Expected: 매치 없음
   - Covers: AC-1, AC-2, AC-3

2) Step: 테마 전환 확인
   - Command: parchment 전환 → PlayerBar, Prompter, DataInputPanel 시각 확인
   - Expected: 색상이 parchment 팔레트 반영
   - Covers: AC-4

3) Step: dialog 접근성 확인
   - Command: `grep -n "aria-\|data-\|role=" v10/src/ui/components/dialog.tsx`
   - Expected: 기존 속성 그대로 (변경 없음)
   - Covers: AC-5

4) Step: 빌드 확인
   - Command: `cd v10 && npm run lint && npm run build`
   - Covers: AC-6, AC-7

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - `dialog.tsx` 오버레이 bg 교체 시 Radix Portal 렌더링 깊이 문제 발생 가능
    → className만 교체, Portal/forwardRef 구조 불변 확인
  - Phase 2 완료 후에도 `toolbar-*` 클래스는 잔존 (--theme-* 미응답)
    → 미완료 범위임을 AI_READ_ME.md에 명시
- Roll-back: `git revert <commit>` 한 줄

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received

> Prerequisite: task_279 COMPLETED.
> Phase 2 완료 조건: task_281 + task_282 + task_283 모두 COMPLETED.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/features/chrome/layout/DataInputPanel.tsx`
- `v10/src/features/chrome/layout/PlayerBar.tsx`
- `v10/src/features/chrome/layout/Prompter.tsx`
- `v10/src/features/chrome/layout/OverviewStage.tsx`
- `v10/src/features/editor/canvas/objects/ImageBlock.tsx`
- `v10/src/ui/components/dialog.tsx`

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
- 대상 6개 파일의 하드코딩 색상 패턴(text/border/bg) 제거 확인.
- `dialog.tsx`의 Radix 접근성 속성(`aria-*`, `data-*`, `role`) 유지 확인.
