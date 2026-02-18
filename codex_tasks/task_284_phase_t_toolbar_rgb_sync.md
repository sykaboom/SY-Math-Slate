# Task 284: Phase T — toolbar-* CSS vars applyTheme 동기화

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-18

---

## 사전 감사 기록

```
[ ROOT CAUSE ]
applyTheme() → --theme-* CSS vars 설정 O
             → --toolbar-*-rgb CSS vars 설정 X
→ toolbar-* Tailwind 클래스 (bg-toolbar-surface, text-toolbar-text 등)는
  --toolbar-*-rgb를 직접 참조하므로 동적 테마 전환 후에도 frozen 상태.

[ SCOPE ]
23개 파일, 230 occurrences의 toolbar-* 클래스 사용 중.
className 교체 없이 applyTheme 확장만으로 전부 fix 가능.

[ EXISTING STRUCTURE ]
- tailwind.config.ts: toolbar-* Tailwind utilities 이미 정의됨
  (rgba(var(--toolbar-surface-rgb), <alpha-value>) 패턴)
- presets.ts: core-toolbar 모듈 토큰 존재 (surface, text, border, accent)
  → chip, menu-bg 토큰은 미정의
- applyTheme.ts: THEME_RGB_TOKEN_VARIABLES → --theme-*-rgb 유도
  → --toolbar-*-rgb 유도 없음

[ SHADOW VARS ]
--toolbar-shell-shadow, --toolbar-panel-shadow 등 합성 shadow 변수:
→ Phase T 범위 외. globals.css class-based 상태 유지.
```

---

## Goal (Base Required)

- What to change:
  - `presets.ts`의 `core-toolbar` 모듈에 `chip`, `menu-bg` 토큰 추가 (3개 프리셋 전부)
  - `applyTheme.ts`에 `TOOLBAR_RGB_ALIAS_VARIABLES` 정의 + `applyToolbarAliasRgbVariables()` 함수 추가
  - `applyTheme()` 호출 시 `--toolbar-*-rgb` vars 자동 동기화
- What must NOT change:
  - `toolbar-*` Tailwind 클래스 사용 컴포넌트 파일 무수정 (23개 파일 className 변경 없음)
  - `createThemeVariableApplier` 외부 API 서명 변경 없음
  - `THEME_GLOBAL_TOKEN_KEYS`, `THEME_PRESET_IDS` 구조 변경 없음
  - `--toolbar-shell-shadow`, `--toolbar-panel-shadow` 등 shadow 합성 변수 미포함

---

## Scope (Base Required)

Touched files/directories (write only):
- `v10/src/core/themes/presets.ts` — core-toolbar 모듈에 `chip`, `menu-bg` 추가
- `v10/src/core/theme/applyTheme.ts` — toolbar RGB alias 유도 로직 추가

Out of scope:
- 23개 컴포넌트 파일 className 변경 (Phase T 이후 선택적 cleanup 태스크)
- shadow 합성 변수 (`--toolbar-shell-shadow` 등) 동기화
- `THEME_MODULE_TOKEN_KEYS` 타입 확장 (ThemeModuleTokenMap은 이미 `& Record<string, string>` 허용)
- tailwind.config.ts 변경 없음

---

## toolbar-* → token 매핑

```
--toolbar-surface-rgb      ← core-toolbar.surface (module scoped)
--toolbar-text-rgb         ← core-toolbar.text    (module scoped)
--toolbar-border-rgb       ← core-toolbar.border  (module scoped)
--toolbar-active-bg-rgb    ← core-toolbar.accent  (module scoped)
--toolbar-chip-rgb         ← core-toolbar.chip    (module scoped, 신규)
--toolbar-menu-bg-rgb      ← core-toolbar.menu-bg (module scoped, 신규)
--toolbar-muted-rgb        ← global text-muted
--toolbar-active-text-rgb  ← global accent-text
--toolbar-danger-rgb       ← global danger
```

**프리셋별 chip / menu-bg 값:**

| preset    | chip                       | menu-bg                   |
|-----------|----------------------------|---------------------------|
| chalk     | rgba(255, 255, 255, 1)     | rgba(0, 0, 0, 1)          |
| parchment | rgba(148, 163, 184, 1)     | rgba(255, 255, 255, 1)    |
| notebook  | rgba(120, 148, 201, 1)     | rgba(20, 35, 70, 1)       |

*(globals.css 기존 클래스 값과 시각적으로 일치)*

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - `applyTheme.ts`는 core 레이어. features import 추가 금지.
  - 외부 API (`applyTheme`, `createThemeVariableApplier`, `resolveThemeTokens`) 서명 불변.
- Compatibility:
  - task_278 / task_279 완료 이후 실행 (applyTheme 기반 전제)
  - chalk 기본 상태 시각 회귀 없음 (chalk toolbar-* 값이 기존 :root 값과 일치)

---

## DAG / Wave Metadata (Base Required)

- Wave ID: W4-phase-t
- Depends on tasks: [task_279]
- Enables tasks: [Phase 5 착수, Phase 3-B 착수]
- Parallel group: G4-phase-t (단독 태스크)
- Max parallel slots: 1
- Verification stage: `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count: 2
- Files shared with other PENDING tasks: 없음
- Cross-module dependency: NO (core 레이어 내부)
- Parallelizable sub-units: 0
- Estimated single-agent duration: ~15min
- Recommended mode: DELEGATED (single-agent lane)
- Batch-eligible: YES (task_278/279 완료 후 즉시)
- Rationale: 2파일, 명확한 매핑 규칙. parseRgbTuple 로직 재사용 패턴.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- Execution mode: DELEGATED
- Delegation chain scope: task_284 only
- Assigned roles:
  - Implementer-A: presets.ts + applyTheme.ts 수정
  - Reviewer+Verifier: Codex final gate
- File ownership lock plan: 2개 파일 Implementer-A 단독
- Parallel slot plan: 내부 병렬 없음
- Scheduler plan:
  - Slot allocation mode: DYNAMIC
  - Slot priority rule: dependency-first
  - Requested orchestration mode: max orchestration mode on
  - Initial slot split: 1 executor + 0 reviewer
  - Ready-queue refill trigger: task_279 완료 시
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
  - `v10/AI_READ_ME.md`: Phase T 완료 기록 (toolbar-* 클래스 테마 반응성 확보)

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: chalk 프리셋 적용 시 `--toolbar-surface-rgb`, `--toolbar-text-rgb`, `--toolbar-border-rgb`, `--toolbar-active-bg-rgb`, `--toolbar-chip-rgb`, `--toolbar-menu-bg-rgb`, `--toolbar-muted-rgb`, `--toolbar-active-text-rgb`, `--toolbar-danger-rgb` 전부 document.documentElement.style에 설정됨
- [ ] AC-2: parchment 프리셋 전환 시 동일 9개 변수가 parchment 값으로 업데이트됨
- [ ] AC-3: notebook 프리셋 전환 시 동일 9개 변수가 notebook 값으로 업데이트됨
- [ ] AC-4: chalk → parchment 전환 후 FloatingToolbar, ModerationConsolePanel 등 toolbar-* 클래스 사용 컴포넌트가 시각적으로 parchment 팔레트 반영
- [ ] AC-5: `createThemeVariableApplier` 외부 API 서명 불변 (기존 호출 사이트 수정 없음)
- [ ] AC-6: `npm run lint` 통과
- [ ] AC-7: `npm run build` 통과

---

## Manual Verification Steps (Base Required)

1) Step: CSS var 설정 확인
   - Command:
     ```
     # DevTools Console (chalk 프리셋 상태):
     getComputedStyle(document.documentElement).getPropertyValue('--toolbar-surface-rgb')
     # Expected: "15, 23, 42"
     ```
   - Covers: AC-1

2) Step: parchment 전환 후 CSS var 확인
   - Command:
     ```
     # applyTheme(parchmentTokens, {}, 'parchment') 호출 후:
     getComputedStyle(document.documentElement).getPropertyValue('--toolbar-surface-rgb')
     # Expected: "236, 223, 188" (core-toolbar.surface의 RGB)
     ```
   - Covers: AC-2

3) Step: 시각 전환 확인
   - Command: 앱 실행 → ThemePicker에서 parchment 선택 → FloatingToolbar 색상 확인
   - Expected: toolbar 배경/텍스트/테두리가 parchment 팔레트 반영
   - Covers: AC-4

4) Step: 빌드 확인
   - Command: `cd v10 && npm run lint && npm run build`
   - Covers: AC-6, AC-7

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - chalk 기존 `--toolbar-surface-rgb: 15, 23, 42` (DP) 과 core-toolbar.surface rgb tuple `15, 23, 42` 일치해야 함
    → parseRgbTuple("rgba(15, 23, 42, 0.9)") = "15, 23, 42" 확인
  - applyToolbarAliasRgbVariables 에서 moduleScopedTokens["core-toolbar"] 누락 시 조용히 skip
    → AC-1에서 DevTools로 확인
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
- `v10/src/core/themes/presets.ts`
- `v10/src/core/theme/applyTheme.ts`
- `codex_tasks/task_284_phase_t_toolbar_rgb_sync.md`

Commands run:
- `cd v10 && npm run lint && npm run build`

## Gate Results (Codex fills)

- Lint: PASS
- Build: PASS
- Script checks: Not run (N/A for this task scope)

## Failure Classification (Codex fills when any gate fails)

- none

Manual verification notes:
- `core-toolbar` preset tokens now include `chip`/`menu-bg` for chalk/parchment/notebook per spec table.
- `applyTheme.ts` now derives all 9 toolbar RGB alias vars from resolved global/module tokens via `TOOLBAR_RGB_ALIAS_VARIABLES` + `applyToolbarAliasRgbVariables()`.
- Build gates passed; interactive UI/DevTools visual confirmation was not executed in this CLI run.
