# Task 281: 테마 마이그레이션 — Phase 2-A (mod-studio)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-18

---

## 사전 감사 기록 (직접 Grep, 2026-02-18)

```
[ AUDIT ] mod-studio 하드코딩 대상 파일 8개 (text/border/bg 기준):
  - features/mod-studio/theme/ThemeStudioSection.tsx   (text+border+bg)
  - features/mod-studio/policy/PolicyStudioSection.tsx  (text+border+bg)
  - features/mod-studio/modules/ModuleStudioSection.tsx (text+border+bg)
  - features/mod-studio/publish/PublishStudioSection.tsx(text+border+bg)
  - features/mod-studio/core/ModStudioPanel.tsx        (text+border+bg)
  - features/mod-studio/core/ModStudioShell.tsx        (text+border+bg)
  - features/mod-studio/io/IoStudioSection.tsx         (text+border+bg)
  - features/mod-studio/layout/LayoutStudioSection.tsx (text+border+bg)

[ PASS ] task_279 완료 후 theme-* Tailwind 유틸리티 사용 가능
         (bg-theme-surface, text-theme-text, border-theme-border 등)
[ NOTE ] ThemeStudioSection.tsx: 내부 applyThemeDraftPreview 로직 변경 없음
         wrapper UI의 className만 교체 (미리보기 메커니즘 불변)
[ NOTE ] mod-studio 파일 간 파일 충돌 없음 → 태스크 내부 병렬 가능
         (단일 에이전트로 순차 처리가 효율적, 파일 수 적음)
```

---

## Goal (Base Required)

- What to change:
  - mod-studio 8개 파일의 하드코딩된 Tailwind 색상 클래스를 `theme-*` 유틸리티로 교체
  - 테마 변경 시 mod-studio 패널 전체가 새 팔레트를 즉시 반영
- What must NOT change:
  - 모든 컴포넌트의 로직, props, 레이아웃 구조 변경 없음
  - `ThemeStudioSection.tsx`의 `applyThemeDraftPreview` 로직 변경 없음
  - className 문자열만 수정, JSX 구조 및 렌더링 로직 불변

---

## Scope (Base Required)

Touched files/directories (write only):
- `v10/src/features/mod-studio/theme/ThemeStudioSection.tsx`
- `v10/src/features/mod-studio/policy/PolicyStudioSection.tsx`
- `v10/src/features/mod-studio/modules/ModuleStudioSection.tsx`
- `v10/src/features/mod-studio/publish/PublishStudioSection.tsx`
- `v10/src/features/mod-studio/core/ModStudioPanel.tsx`
- `v10/src/features/mod-studio/core/ModStudioShell.tsx`
- `v10/src/features/mod-studio/io/IoStudioSection.tsx`
- `v10/src/features/mod-studio/layout/LayoutStudioSection.tsx`

Out of scope:
- input-studio, canvas, layout 파일 (task_282, task_283)
- `toolbar-*` 클래스 마이그레이션 (별도 태스크)
- applyThemeDraftPreview 로직 변경

---

## 교체 매핑 규칙

```
text-white           → text-theme-text
text-white/N         → text-theme-text/N
text-gray-*          → text-theme-text-muted  (또는 text-theme-text/62)
text-black           → text-theme-text
border-white/N       → border-theme-border/N
border-gray-*        → border-theme-border
bg-black/N           → bg-theme-surface/N
bg-white/N           → bg-theme-surface/N  (N ≤ 15) 또는 bg-theme-surface-soft
bg-gray-*/bg-slate-* → bg-theme-surface
bg-white             → bg-theme-surface
bg-black             → bg-theme-surface
```

**판단 원칙:**
- 낮은 opacity bg (white/5 ~ white/10) → `bg-theme-surface-soft` 사용
- 고정 opacity가 의미 있는 경우 (예: bg-black/60 overlay) → `bg-theme-surface/60` 사용
- 판단 불확실 시 더 진한(opaque) 쪽 선택

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - 8개 파일 모두 `features/mod-studio/` 레이어 내부. 레이어 규칙 변경 없음.
  - className 문자열만 수정. import/export 변경 없음.
- Compatibility:
  - task_279 완료(theme-* 유틸리티 추가) 이후에만 실행 가능
  - chalk 프리셋 기본값과 현재 하드코딩 색상이 시각적으로 동일해야 함 (회귀 없음)

---

## DAG / Wave Metadata (Base Required)

- Wave ID: W3-theme-migration
- Depends on tasks: [task_279]
  - task_279: theme-* Tailwind 유틸리티 (tailwind.config.ts, globals.css) 필요
- Enables tasks: [Phase 3-B 고급 토큰 편집 접근 (mod-studio 전체 테마 응답 전제)]
- Parallel group: G3-theme (task_280, task_282, task_283과 파일 충돌 없음 → 동시 실행)
- Max parallel slots: 6
- Verification stage for this task: `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count: 8
- Files shared with other PENDING tasks: 없음 (mod-studio 파일은 이 태스크 단독 소유)
- Cross-module dependency: NO (mod-studio 내부만)
- Parallelizable sub-units: 0 (단일 에이전트 순차 효율적)
- Estimated single-agent duration: ~35min
- Recommended mode: DELEGATED (single-agent lane)
- Batch-eligible: YES
  - task_279 완료 후 task_280/282/283과 동시에 Wave 3에서 병렬 실행 가능
  - 파일 충돌 없음
- Rationale:
  - className 교체 주 작업. 매핑 규칙이 명확하나 파일 8개의 컨텍스트를 파악하며
    opacity 판단 일관성을 유지하려면 단일 에이전트 순차가 안전.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: NO (className 교체만, 레이아웃 지오메트리 변경 없음)

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- Execution mode: DELEGATED
- Delegation chain scope: task_281 only
- Assigned roles:
  - Implementer-A: 8개 파일 순차 교체
  - Reviewer+Verifier: Codex final gate
- File ownership lock plan: 8개 파일 Implementer-A 단독 소유
- Parallel slot plan: 내부 병렬 없음 (single-agent sequential)
- Scheduler plan:
  - Slot allocation mode: DYNAMIC
  - Slot priority rule: dependency-first
  - Requested orchestration mode: max orchestration mode on
  - Initial slot split: 1 executor + 0 reviewer
  - Ready-queue refill trigger: task_279 완료 시 Wave 3 동시 등록 (task_280/282/283과 함께)
  - Agent close/reuse policy: 완료 즉시 close
  - Heartbeat policy: Soft ping ~90s / Reassignment 4~6m / 예외: lint/build
  - Reassignment safety rule: 2회 무응답 + lock-critical 아님
- Delegated closeout metrics:
  - Peak: 1 / Average: 1 / Refill: 1 / Reassignment: 0 (target)

---

## Optional Block C — Hotfix Exception

- [x] Applies: NO

---

## Optional Block D — Speculative Defense Check

- [x] Applies: NO

---

## Optional Block E — Documentation Update Check

- [x] Applies: YES
- [x] Structure changes: 없음
- [x] Semantic/rule changes:
  - v10/AI_READ_ME.md Phase 2 마이그레이션 진행 현황에 task_281 완료 기록

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: 8개 파일에서 `text-(white|black|gray|slate|zinc|neutral)\b` 매치 없음
- [ ] AC-2: 8개 파일에서 `border-(white|black|gray|slate|zinc|neutral)\b` 매치 없음
- [ ] AC-3: 8개 파일에서 `bg-(white|black|gray|slate|zinc|neutral)\b` 매치 없음
- [ ] AC-4: parchment 프리셋 전환 시 mod-studio 패널 색상 변경 확인
- [ ] AC-5: `ThemeStudioSection.tsx`의 applyThemeDraftPreview 동작 불변
- [ ] AC-6: `npm run lint` 통과
- [ ] AC-7: `npm run build` 통과

---

## Manual Verification Steps (Base Required)

1) Step: 하드코딩 제거 확인
   - Command:
     ```
     grep -n "text-white\b\|text-black\|text-gray\|border-white/\|border-gray\|bg-black/\|bg-white/\|bg-gray\|bg-slate" \
       v10/src/features/mod-studio/theme/ThemeStudioSection.tsx \
       v10/src/features/mod-studio/core/ModStudioPanel.tsx \
       v10/src/features/mod-studio/core/ModStudioShell.tsx
     ```
   - Expected: 매치 없음
   - Covers: AC-1, AC-2, AC-3

2) Step: 테마 전환 시각 확인
   - Command: `npm run dev` → parchment 선택 → mod-studio 패널 열기
   - Expected: 패널 배경/텍스트/테두리가 parchment 팔레트로 변경
   - Covers: AC-4

3) Step: ThemeStudioSection 미리보기 동작 확인
   - Command: Mod Studio → Theme 탭 → 프리셋 변경 → 미리보기 적용 확인
   - Expected: applyThemeDraftPreview 정상 작동
   - Covers: AC-5

4) Step: 빌드 확인
   - Command: `cd v10 && npm run lint && npm run build`
   - Expected: 통과
   - Covers: AC-6, AC-7

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - opacity 판단 오류: `bg-black/60`을 `bg-theme-surface-soft`로 교체하면 너무 밝아짐
    → 60% overlay는 `bg-theme-surface/60` 사용. 10% 이하는 `bg-theme-surface-soft`.
  - chalk 기본값과 색상 차이: 교체 후 chalk 테마에서 색상이 달라 보이면 시각 회귀
    → 단계별 grep 확인 후 chalk 상태에서 비교
- Roll-back:
  - 8개 파일 className 원복
  - `git revert <commit>` 한 줄로 복원

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received

> Implementation MUST NOT begin until both boxes are checked.
> Prerequisite: task_279 COMPLETED.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/features/mod-studio/theme/ThemeStudioSection.tsx`
- `v10/src/features/mod-studio/policy/PolicyStudioSection.tsx`
- `v10/src/features/mod-studio/modules/ModuleStudioSection.tsx`
- `v10/src/features/mod-studio/publish/PublishStudioSection.tsx`
- `v10/src/features/mod-studio/core/ModStudioPanel.tsx`
- `v10/src/features/mod-studio/core/ModStudioShell.tsx`
- `v10/src/features/mod-studio/io/IoStudioSection.tsx`
- `v10/src/features/mod-studio/layout/LayoutStudioSection.tsx`

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
- 대상 8개 파일의 하드코딩 색상 패턴(text/border/bg) 제거 확인.
- `ThemeStudioSection` 미리보기 동작(`applyThemeDraftPreview`) 경로 불변 확인.
