# Task 279: 테마 셸 레이어 마이그레이션 — Phase 1B

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-18

---

## 사전 감사 기록 (직접 Grep, 2026-02-18)

### 전체 하드코딩 분포 (TSX 파일 기준)

```
[ AUDIT ] text-(white|black|gray|slate|zinc|neutral) 사용 파일: 21개
[ AUDIT ] border-(white|black|gray|slate|zinc|neutral) 사용 파일: 19개
[ AUDIT ] bg-(white|black|gray|slate|zinc|neutral) 사용 파일: 23개
[ AUDIT ] toolbar-* CSS-var-backed (--toolbar-*-rgb 경유, --theme-* 미응답): 12개 파일, 132회
```

### 셸 레이어 우선 대상 (이 태스크 범위)

```
[ SHELL ] AppLayout.tsx — 13회 (text-white, border-white/10, bg-black/40, bg-white/5, bg-slate-app)
[ SHELL ] panelAdapters.tsx — 4회 (text-white/65~70, border-white/10~15, bg-black/35~45)
[ SHELL ] PanelLauncher.tsx — 9회 (text-white/55~80, border-white/15~35, bg-black/60~80)
```

### 나머지 (Out of scope, Phase 2)

```
[ DEFER ] features/mod-studio/** — 8개 파일 (ModStudioPanel, ModStudioShell, ThemeStudioSection, ...)
[ DEFER ] features/input-studio/** — 4개 파일
[ DEFER ] features/canvas/** — 3개 파일 (CanvasStage, ContentLayer, PasteHelperModal)
[ DEFER ] features/layout/DataInputPanel.tsx, PlayerBar.tsx, Prompter.tsx
[ DEFER ] toolbar-* 클래스 마이그레이션 (--theme-* 응답 여부 별도 태스크)
```

---

## Goal (Base Required)

- What to change:
  - `globals.css`에 `--theme-*-rgb` CSS var 추가 (fallback 값: 기존 `--toolbar-*-rgb` 값과 동일)
  - `tailwind.config.ts`에 `theme-*` Tailwind color 유틸리티 추가 (`rgba(var(--theme-*-rgb), <alpha-value>)` 패턴)
  - `applyTheme.ts`에 `--theme-*-rgb` 주입 확장 (task_278 applyTheme의 소수정)
  - `AppLayout.tsx` 셸 헤더 하드코딩 → `theme-*` 유틸리티로 교체
  - `panelAdapters.tsx` 패널 프레임 하드코딩 → `theme-*` 유틸리티로 교체
  - `PanelLauncher.tsx` 런처 하드코딩 → `theme-*` 유틸리티로 교체

- What must NOT change:
  - AppLayout.tsx의 레이아웃 구조, positioning, 이벤트 핸들러 변경 없음
  - panelAdapters.tsx, PanelLauncher.tsx props/API 변경 없음
  - 기존 `toolbar-*` Tailwind 유틸리티 제거 없음 (하위 호환 유지)
  - `bg-slate-app`, `swatch-*`, `neon-*` 유틸리티 변경 없음
  - chalk 프리셋 기본값이 현재 앱과 시각적으로 동일해야 함

---

## Scope (Base Required)

Touched files/directories:

**수정 (write):**
- `v10/src/app/globals.css` — `--theme-text-rgb`, `--theme-surface-rgb`, `--theme-border-rgb`, `--theme-accent-rgb` CSS var 추가 (dark/light 양쪽)
- `v10/tailwind.config.ts` — `theme-text`, `theme-surface`, `theme-border`, `theme-accent`, `theme-text-muted`, `theme-surface-soft` Tailwind color 유틸리티 추가
- `v10/src/core/theme/applyTheme.ts` — rgb var 주입 확장 (task_278에서 생성된 파일 소수정)
- `v10/src/features/layout/AppLayout.tsx` — 셸 헤더 하드코딩 교체 (~13회)
- `v10/src/features/layout/windowing/panelAdapters.tsx` — 패널 프레임 하드코딩 교체 (~4회)
- `v10/src/features/layout/windowing/PanelLauncher.tsx` — 런처 하드코딩 교체 (~9회)

Out of scope:
- `toolbar-*` 클래스 마이그레이션 (별도 태스크)
- `features/mod-studio/**`, `features/input-studio/**`, `features/canvas/**` 컴포넌트 (Phase 2)
- `DataInputPanel.tsx`, `PlayerBar.tsx`, `Prompter.tsx` (Phase 2)
- ThemePickerPanel UI (Phase 3)

---

## 상세 설계 (Codex 구현 참고)

### 1. `globals.css` 추가 — rgb var 추가

```css
/* @theme inline 블록 내부, 기존 --theme-text 선언 아래에 추가 */
/* Phase 1B: 불투명도 변형을 지원하는 rgb 튜플 변수 */
--theme-text-rgb: var(--toolbar-text-rgb);       /* fallback: 255, 255, 255 */
--theme-surface-rgb: var(--toolbar-surface-rgb); /* fallback: 15, 23, 42 */
--theme-border-rgb: var(--toolbar-border-rgb);   /* fallback: 255, 255, 255 */
--theme-accent-rgb: var(--toolbar-active-bg-rgb); /* fallback: 255, 255, 0 */
```

`[data-theme="light"]` 블록: 자동으로 `--toolbar-*-rgb` 값이 교체되므로 별도 추가 불필요.

### 2. `tailwind.config.ts` 추가

```typescript
// 기존 colors: { ... } 안에 추가
"theme-text":         "rgba(var(--theme-text-rgb), <alpha-value>)",
"theme-text-muted":   "rgba(var(--theme-text-rgb), 0.62)",  // muted는 고정 opacity
"theme-surface":      "rgba(var(--theme-surface-rgb), <alpha-value>)",
"theme-surface-soft": "var(--theme-surface-soft)",          // semantic soft overlay
"theme-border":       "rgba(var(--theme-border-rgb), <alpha-value>)",
"theme-accent":       "rgba(var(--theme-accent-rgb), <alpha-value>)",
```

이 패턴으로 `bg-theme-surface/40`, `text-theme-text/50`, `border-theme-border/10` 등 opacity 변형 지원.

### 3. `applyTheme.ts` 소수정 (task_278에서 생성됨)

```typescript
// applyTheme() 함수에 --theme-*-rgb 주입 추가
// 프리셋 globalTokens에서 surface/text/border/accent의 rgb 튜플을 추출해 주입
// 예: chalk.surface = "rgba(15, 23, 42, 0.92)" → rgb tuple = "15, 23, 42"
// 정규식으로 rgba(r, g, b, a) → "r, g, b" 추출

// 주입 형식:
// document.documentElement.style.setProperty('--theme-surface-rgb', 'r, g, b')
// document.documentElement.style.setProperty('--theme-text-rgb', 'r, g, b')
// document.documentElement.style.setProperty('--theme-border-rgb', 'r, g, b')
// document.documentElement.style.setProperty('--theme-accent-rgb', 'r, g, b')
```

rgb 추출 실패 시 fallback: CSS var alias가 globals.css에 정의되어 있으므로 안전.

### 4. AppLayout.tsx 교체 예시

```
text-white           → text-theme-text
text-white/50        → text-theme-text/50
border-white/10      → border-theme-border/10
border-white/15      → border-theme-border/15
border-white/20      → border-theme-border/20
bg-black/40          → bg-theme-surface/40
bg-black/60          → bg-theme-surface/60
bg-white/5           → bg-theme-surface-soft
bg-white/10          → bg-theme-surface-soft
```

`bg-slate-app`은 유지 (별도 CSS var, 변경 범위 밖).

### 5. panelAdapters.tsx, PanelLauncher.tsx 교체

동일 매핑 규칙 적용. 패널 프레임 컨테이너의 `border-white/15 bg-black/45` → `border-theme-border/15 bg-theme-surface/45` 등.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - `globals.css`: `@theme inline` 블록 내에서만 CSS var 추가
  - `tailwind.config.ts`: `theme.extend.colors`에만 추가, 기존 항목 제거 없음
  - `applyTheme.ts`: core 레이어 규칙 유지 (외부 의존성 추가 없음)
  - AppLayout, panelAdapters, PanelLauncher: className 문자열만 수정, 로직 변경 없음
- Compatibility:
  - chalk 프리셋의 rgb 값과 기존 globals.css `--toolbar-*-rgb` 값이 일치해야 시각적 변화 없음
  - task_278의 applyTheme이 먼저 실행되어야 `--theme-*-rgb` 동적 주입 가능
  - globals.css fallback이 있으므로 task_278 미실행 시에도 UI 정상 동작

---

## DAG / Wave Metadata (Base Required)

- Wave ID: W2-theme-shell
- Depends on tasks: [task_278]
- Enables tasks: [Phase 2 theme 전체 컴포넌트 마이그레이션, Phase 3 ThemePickerPanel]
- Parallel group: G2-ui
- Max parallel slots: 6
- Verification stage for this task: `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count: 6
- Files shared with other PENDING tasks:
  - `applyTheme.ts`: task_278에서 생성 후 이 태스크가 소수정 — task_278 완료 후 단독 소유
  - `AppLayout.tsx`: task_277 COMPLETED 이후 변경 없음. task_279 단독 소유.
  - `panelAdapters.tsx`, `PanelLauncher.tsx`: 다른 PENDING 태스크와 충돌 없음
- Cross-module dependency: YES (app-layer CSS / tailwind config → features/layout)
- Parallelizable sub-units: 1
  - globals.css + tailwind.config 수정 → applyTheme 확장 → 3개 컴포넌트 교체 (순차)
  - 컴포넌트 3개는 서로 독립적이나 파일 수가 적어 단일 에이전트가 효율적
- Estimated single-agent duration: ~30min
- Recommended mode: DELEGATED (single-agent lane)
- Batch-eligible: YES (task_278 완료 후 즉시 실행 가능, 다른 PENDING 태스크와 파일 충돌 없음)
- Rationale:
  - className 교체가 주 작업. 매핑 규칙이 명확하므로 단일 에이전트 순차 실행으로 충분.
  - globals.css → tailwind.config → applyTheme → 컴포넌트 순서 의존성 있어 순차가 안전.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- Execution mode: DELEGATED
- Delegation chain scope:
  - task_279 only
- Assigned roles:
  - Implementer-A: globals.css + tailwind.config + applyTheme 확장 + 3개 컴포넌트 교체
  - Reviewer+Verifier: Codex final gate
- File ownership lock plan:
  - 6개 파일 전부 Implementer-A 단독 소유
- Parallel slot plan:
  - 내부 병렬 없음 (single-agent sequential)
- Scheduler plan:
  - Slot allocation mode: DYNAMIC
  - Slot priority rule: dependency-first (task_278 완료 직후 투입)
  - Requested orchestration mode: max orchestration mode on
  - Initial slot split: 1 executor + 0 reviewer (task local)
  - Ready-queue refill trigger: task_278 완료 이벤트 시 즉시 실행 큐 등록
  - Agent close/reuse policy: 완료 즉시 close 후 슬롯 반납
  - Heartbeat policy:
    - Soft ping threshold: ~90s
    - Reassignment threshold: 4~6m (무출력 + 무diff)
    - Long-running exceptions: lint/build/typecheck
  - Reassignment safety rule: 2회 ping 무응답 + lock-critical 아님 + long-run 예외 아님
- Delegated closeout metrics:
  - Peak active slots: 1
  - Average active slots: 1
  - Slot refill count: 1
  - Reassignment count: 0 (target)

---

## Optional Block C — Hotfix Exception

- [x] Applies: NO

---

## Optional Block D — Speculative Defense Check

- [x] Applies: NO

---

## Optional Block E — Documentation Update Check

- [x] Applies: YES
- If YES:
  - [x] Structure changes: 없음 (신규 파일 없음)
  - [x] Semantic/rule changes:
    - v10/AI_READ_ME.md Theme System 섹션에 추가:
      - Phase 1B 완료 사실 기록
      - 셸 레이어 마이그레이션 완료 파일 목록
      - 미완료 파일 목록 (Phase 2 대상)
      - `--theme-*-rgb` CSS var 추가 사실 및 용도

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: `globals.css`에 `--theme-text-rgb`, `--theme-surface-rgb`, `--theme-border-rgb`, `--theme-accent-rgb` CSS var 추가됨
- [ ] AC-2: `tailwind.config.ts`에 `theme-text`, `theme-surface`, `theme-border`, `theme-accent` Tailwind color 추가됨
- [ ] AC-3: `applyTheme.ts`가 `--theme-*-rgb` CSS var를 주입함
  - `setProperty('--theme-surface-rgb', ...)` 형태 확인
- [ ] AC-4: `AppLayout.tsx` 셸 헤더에 `text-white`, `border-white/*`, `bg-black/*` 직접 사용 없음
  - `text-theme-text`, `border-theme-border/*`, `bg-theme-surface/*` 교체 확인
- [ ] AC-5: `panelAdapters.tsx` 패널 프레임에 동일 교체 완료
- [ ] AC-6: `PanelLauncher.tsx` 런처에 동일 교체 완료
- [ ] AC-7: chalk 프리셋 기본값에서 앱 외관 변화 없음 (시각 회귀 없음)
  - `npm run dev` → 현재 앱과 동일한 색상
- [ ] AC-8: parchment 프리셋으로 전환 시 셸 레이어 색상이 변경됨
  - AppLayout 헤더, panelAdapters 프레임, PanelLauncher가 parchment 팔레트 반영
- [ ] AC-9: `npm run lint` 통과
- [ ] AC-10: `npm run build` 통과

---

## Manual Verification Steps (Base Required)

1) Step: CSS var 추가 확인
   - Command / click path: `grep -n "theme-text-rgb\|theme-surface-rgb\|theme-border-rgb\|theme-accent-rgb" v10/src/app/globals.css`
   - Expected result: 4개 변수 선언 존재
   - Covers: AC-1

2) Step: Tailwind color 확인
   - Command / click path: `grep -n "theme-text\|theme-surface\|theme-border\|theme-accent" v10/tailwind.config.ts`
   - Expected result: 6개 이상 컬러 엔트리 존재
   - Covers: AC-2

3) Step: applyTheme rgb 주입 확인
   - Command / click path: `grep -n "theme-surface-rgb\|theme-text-rgb" v10/src/core/theme/applyTheme.ts`
   - Expected result: `setProperty` 호출 확인
   - Covers: AC-3

4) Step: 셸 레이어 하드코딩 제거 확인
   - Command / click path:
     ```
     grep -n "text-white\b\|bg-black/\|border-white/" v10/src/features/layout/AppLayout.tsx
     grep -n "text-white\b\|bg-black/\|border-white/" v10/src/features/layout/windowing/panelAdapters.tsx
     grep -n "text-white\b\|bg-black/\|border-white/" v10/src/features/layout/windowing/PanelLauncher.tsx
     ```
   - Expected result: 매치 없음 (모두 theme-* 유틸리티로 교체)
   - Covers: AC-4, AC-5, AC-6

5) Step: 시각 회귀 확인 (chalk 기본)
   - Command / click path: `npm run dev` → 호스트 모드 → 헤더/패널/런처 색상 확인
   - Expected result: 현재 앱과 동일한 다크 UI
   - Covers: AC-7

6) Step: 프리셋 반영 테스트 (스토어 전역 심볼 의존 없음)
   - Command / click path:
     - DevTools Console:
       ```js
       const raw = JSON.parse(localStorage.getItem("sy-theme-v1") ?? "{}");
       localStorage.setItem(
         "sy-theme-v1",
         JSON.stringify({ ...raw, activePresetId: "parchment" })
       );
       location.reload();
       ```
     - 화면 재로딩 후 AppLayout 헤더/패널/런처 색상 확인
   - Expected result: AppLayout 헤더, 패널 프레임, 런처가 parchment 팔레트로 변경
   - Covers: AC-8

7) Step: 레이어 규칙 + 빌드 확인
   - Command / click path: `bash scripts/check_layer_rules.sh && cd v10 && npm run lint && npm run build`
   - Expected result: 모두 통과
   - Covers: AC-9, AC-10

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - chalk 프리셋의 rgba 값에서 rgb 튜플 추출 실패 시 `--theme-*-rgb`가 주입되지 않음
    → globals.css fallback이 있으므로 기존 toolbar-*-rgb 값 사용 → 앱 동작은 정상
    → AC-8 (parchment 전환) 동작 실패로 확인 가능
  - `text-theme-text/50` 등 opacity 변형이 빌드 시 생성되지 않을 경우
    → tailwind.config에서 `rgba(var(--theme-text-rgb), <alpha-value>)` 패턴 정확히 사용 필요
    → 빌드 전 `npx tailwindcss --content "./src/**/*.tsx" -o /tmp/out.css --minify` 로 유틸리티 생성 확인
  - `bg-slate-app` 유지 필요 — 캔버스 배경 영역은 이번 교체 대상 아님
    → grep으로 `bg-slate-app` 잔존 여부 확인 후 보고
- Roll-back:
  - globals.css, tailwind.config, applyTheme.ts, 3개 컴포넌트 원복
  - `git revert <commit>` 한 줄로 복원

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received

> Implementation MUST NOT begin until both boxes are checked.
> Prerequisite: task_278 COMPLETED.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/app/globals.css`
- `v10/tailwind.config.ts`
- `v10/src/core/theme/applyTheme.ts`
- `v10/src/features/layout/AppLayout.tsx`
- `v10/src/features/layout/windowing/panelAdapters.tsx`
- `v10/src/features/layout/windowing/PanelLauncher.tsx`

Commands run:
- `bash scripts/check_layer_rules.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`

## Gate Results (Codex fills)

- Lint: PASS
- Build: PASS
- Script checks: PASS (`check_layer_rules`)

## Failure Classification (Codex fills when any gate fails)

- N/A

Manual verification notes:
- `--theme-*-rgb` 변수와 tailwind `theme-*` 컬러 유틸리티 추가 확인.
- AppLayout/panelAdapters/PanelLauncher의 `text-white|bg-black/|border-white/` 직접 사용 제거 확인.
- parchment 전환(localStorage 기반) 시 셸 레이어 색상 반영 확인.

Notes:
- Phase 1B: Phase 1A (task_278) 완료 후 실행.
- 감사 완료 (2026-02-18): 21/19/23개 파일 하드코딩 확인, 셸 레이어 3개 파일 우선 교체.
- 나머지 18+ 파일은 Phase 2 마이그레이션 태스크에서 처리.
