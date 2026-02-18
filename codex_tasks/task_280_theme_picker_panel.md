# Task 280: ThemePickerPanel — Phase 3-A

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-18
Revised: 2026-02-18 (보정: Block A YES, 닫기 동작, 아이콘, 정책 주석)

---

## 사전 감사 기록 (직접 Read/Grep, 2026-02-18)

```
[ PASS ] CORE_PANEL_POLICY_IDS — core/config/panel-policy.ts, 5개 항목, THEME_PICKER 없음
[ PASS ] CORE_PANEL_POLICY_SOURCE — 동일 파일, 5개 패널 정책, THEME_PICKER 없음
[ PASS ] CORE_SLOT_BINDINGS — features/extensions/ui/registerCoreSlots.ts:78, 5개 항목
[ PASS ] CoreWindowHostPanelAdapterOptions — windowing/panelAdapters.tsx:171
         → isModerationConsoleOpen, closeModerationConsole 패턴 존재 (THEME_PICKER도 동일 패턴 필요)
[ PASS ] buildCoreWindowHostPanelAdapters — panelAdapters.tsx:188, 패널별 명시적 엔트리
[ PASS ] handleToggleLauncherPanel — AppLayout.tsx:302
         → setWindowRuntimePanelOpenState(panelId, nextOpen) 직접 호출
         → 닫기 X버튼은 별도 closeThemePicker 콜백 필요 (context.setOpen(false) 불충분)
[ PASS ] ENTRY_ICON_BY_NAME — PanelLauncher.tsx:31
         → Keyboard, Captions, SlidersHorizontal만 등록
         → "Palette" 미지원 → PanelLauncher.tsx 수정 필요
[ PASS ] CoreSlotActivation — "always" | "layout-slot-cutover"
[ PASS ] UISlotName — "toolbar-bottom" 적합
[ PASS ] listThemePresets() — core/themes/presets.ts, chalk/parchment/notebook
[ PASS ] design_drafts/ 존재, 기존 명명: layout_<slug>_<width>x<height>.svg
[ FAIL ] useThemeStore — 미존재 (task_278 PENDING) → task_278 완료 후에만 구현 가능
```

---

## Goal (Base Required)

- What to change:
  - 사용자가 앱에서 직접 프리셋을 선택할 수 있는 ThemePickerPanel 패널 추가
  - PanelLauncher에서 "Theme" 버튼으로 열림, 선택 즉시 CSS var 전환 + localStorage 저장
  - Palette 아이콘 지원을 위해 PanelLauncher.tsx ENTRY_ICON_BY_NAME 확장
  - 닫기 동작: `closeThemePicker` 콜백 패턴 (context.setOpen 미사용)
- What must NOT change:
  - `useModStudioStore.draft.theme` 변경 없음 (Mod Studio 초안과 완전 분리)
  - `ThemeStudioSection.tsx` 수정 없음
  - 기존 5개 패널 동작 변경 없음
  - `buildCoreWindowHostPanelAdapters` 기존 파라미터 제거/변경 없음

---

## Scope (Base Required)

Touched files/directories:

**신규 (create):**
- `v10/src/features/theme/ThemePickerPanel.tsx` — 프리셋 선택 UI
- `design_drafts/layout_theme_picker_panel_280x210.svg` — 레이아웃 레드라인 SVG (Block A)

**수정 (write):**
- `v10/src/core/config/panel-policy.ts` — THEME_PICKER ID + 정책 추가
- `v10/src/features/extensions/ui/registerCoreSlots.ts` — CORE_SLOT_BINDINGS에 바인딩 추가
- `v10/src/features/layout/windowing/panelAdapters.tsx` — 옵션 타입 + 빌더 엔트리 추가
- `v10/src/features/layout/windowing/PanelLauncher.tsx` — Palette 아이콘 추가
- `v10/src/features/layout/AppLayout.tsx` — showThemePicker + closeThemePicker 전달

Out of scope:
- 고급 토큰 편집 UI (Phase 3-B)
- JSON import/export (Phase 3-C)
- Viewer 모드 노출 (별도 태스크)

---

## 상세 설계 (Codex 구현 참고)

### 레드라인 수치 (Block A 기준)

```
패널 전체:   280 × 210 px
헤더 바:     280 × 36 px  (title + X버튼)
콘텐츠 영역: 280 × 174 px (패딩 포함)
프리셋 카드: 3개 수평 배치, 각 카드 약 80 × 90 px
  - 상단 스와치 영역: 80 × 48 px (surface + accent + text 3색 줄)
  - 하단 이름 텍스트: 약 14px

defaultPosition: { x: 40, y: 64 }   (헤더 하단 기준)
rememberPosition: true
```

### 1. `core/config/panel-policy.ts` 추가

```typescript
THEME_PICKER: "core.theme-picker.panel",

[CORE_PANEL_POLICY_IDS.THEME_PICKER]: {
  slot: "toolbar-bottom",
  behavior: {
    displayMode: "windowed",
    movable: true,
    defaultPosition: { x: 40, y: 64 },
    rememberPosition: true,
    defaultOpen: false,
    roleOverride: {
      host:    { visible: true, defaultOpen: false },
      student: { visible: true, defaultOpen: false }, // 개인 설정 → 양 역할 허용
    },
  },
},
```

`CORE_EDIT_ONLY_PANEL_POLICY_IDS`에 추가하지 않음 (편집 전용 아님).

### 2. `features/extensions/ui/registerCoreSlots.ts` 추가

```typescript
{
  panelId: CORE_PANEL_POLICY_IDS.THEME_PICKER,
  component: ThemePickerPanel,
  activation: "layout-slot-cutover",
  registerInSlotRuntime: !LAYOUT_SLOT_CUTOVER_ENABLED,
  launcher: {
    launcherId: "core-launcher-panel-theme-picker",
    title: "Theme",
    description: "Opens the theme preset picker.",
    icon: "Palette",  // PanelLauncher.tsx에 추가 후 사용 가능
  },
},
```

### 3. `features/layout/windowing/PanelLauncher.tsx` 수정

```typescript
// 기존 import에 Palette 추가
import { Captions, Keyboard, LayoutGrid, Palette, PanelLeftOpen, SlidersHorizontal } from "lucide-react";

// ENTRY_ICON_BY_NAME에 추가
const ENTRY_ICON_BY_NAME: Record<string, LucideIcon> = {
  Keyboard,
  Captions,
  SlidersHorizontal,
  Palette,  // ← 추가
};
```

### 4. `features/layout/windowing/panelAdapters.tsx` 추가

```typescript
// CoreWindowHostPanelAdapterOptions 타입에 추가
showThemePicker: boolean;
closeThemePicker: () => void;  // windowRuntimePanelOpenState 업데이트용

// buildCoreWindowHostPanelAdapters에 추가
const themePickerContract = resolveCorePanelContract(
  CORE_PANEL_POLICY_IDS.THEME_PICKER, runtimeRole, options.layoutSlotCutoverEnabled
);
if (themePickerContract && themePickerContract.visible && options.showThemePicker) {
  modules.push({
    panelId: themePickerContract.panelId,
    slot: themePickerContract.slot,
    behavior: themePickerContract.behavior,
    size: { width: 280, height: 210 },
    className: "pointer-events-auto",
    render: (context) => (
      <WindowPanelShell
        title="Theme"
        context={context}
        onRequestClose={options.closeThemePicker}  // ← context.setOpen 대신
      >
        <ThemePickerPanel />
      </WindowPanelShell>
    ),
  });
}
```

**닫기 동작 설계 근거:**
`context.setOpen(false)`는 WindowHost 내부 runtime만 업데이트하고 AppLayout의
`windowRuntimePanelOpenState`를 갱신하지 않는다. 다음 렌더에서 `isOpen: windowRuntimePanelOpenState[panelId] === true`로 재계산되어 패널이 다시 열린다.
`closeThemePicker: () => setWindowRuntimePanelOpenState(CORE_PANEL_POLICY_IDS.THEME_PICKER, false)`
를 통해 AppLayout 상태를 직접 갱신해야 SSOT 일관성 유지.

### 5. `features/layout/AppLayout.tsx` 수정

```typescript
const showThemePicker = !isPresentation;
// 정책 주석: showThemePicker는 현재 세션 컨텍스트(프레젠테이션 모드 아님)만 제어.
// 역할 기반 가시성은 CORE_PANEL_POLICY_SOURCE.roleOverride가 담당.
// 향후 역할별 제어 필요 시 roleVisibilityPolicy에 showThemePicker 필드 추가.

// buildCoreWindowHostPanelAdapters 호출에 추가
{
  ...기존 파라미터,
  showThemePicker,
  closeThemePicker: () =>
    setWindowRuntimePanelOpenState(CORE_PANEL_POLICY_IDS.THEME_PICKER, false),
}
// useMemo 의존성 배열에 showThemePicker 추가
```

### 6. `features/theme/ThemePickerPanel.tsx` — 신규

```typescript
"use client";

// imports: useThemeStore (task_278), listThemePresets (core/themes/presets), useMemo
// 레이어: features/ → features/store (OK), core/themes (OK)

export function ThemePickerPanel() {
  const activePresetId = useThemeStore((s) => s.activePresetId);
  const setPreset = useThemeStore((s) => s.setPreset);
  const presets = useMemo(() => listThemePresets(), []);

  return (
    // 3개 프리셋 카드 수평 배열
    // 각 카드: 색상 스와치 (preset.globalTokens.surface/accent/text inline style) + 이름
    // 활성 카드: border-theme-accent 하이라이트
    // 클릭: setPreset(presetId) → 즉시 CSS var 전환
  );
}
```

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO (lucide-react Palette는 이미 번들 내 포함)
- Boundary rules:
  - `ThemePickerPanel.tsx`: `features/store/useThemeStore` + `core/themes/presets` import (OK)
  - `panel-policy.ts`: core 레이어, 외부 import 없음
  - `registerCoreSlots.ts`, `panelAdapters.tsx`: features→features, features→core (OK)
  - `PanelLauncher.tsx`: lucide-react Palette import 추가만 (기존 의존성 범위 내)
- Compatibility:
  - `CORE_EDIT_ONLY_PANEL_POLICY_IDS`에 THEME_PICKER 추가 금지
  - 기존 5개 CORE_SLOT_BINDINGS 항목 변경 없음

---

## DAG / Wave Metadata (Base Required)

- Wave ID: W3-theme-ux
- Depends on tasks: [task_278, task_279]
  - task_278: useThemeStore, setPreset 함수 필요
  - task_279: theme-* Tailwind 유틸리티 필요 (ThemePickerPanel className)
- Enables tasks: [Phase 3-B 고급 토큰 편집, Phase 3-C JSON import/export]
- Parallel group: G3-theme (task_281, task_282, task_283과 파일 충돌 없음 → 동시 실행 가능)
- Max parallel slots: 6
- Verification stage for this task: `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count: 7 (2 create + 5 write)
- Files shared with other PENDING tasks:
  - `AppLayout.tsx`: task_279 write 완료 후 단독 소유
  - `panelAdapters.tsx`: task_279 write 완료 후 단독 소유
  - `PanelLauncher.tsx`: task_279 write 완료 후 단독 소유
  - 나머지: 다른 PENDING 태스크와 충돌 없음
- Cross-module dependency: YES (core/config → features/extensions → features/layout)
- Parallelizable sub-units: 0 (policy → registerCoreSlots → PanelLauncher → panelAdapters → AppLayout → component 순차)
- Estimated single-agent duration: ~40min
- Recommended mode: DELEGATED (single-agent lane)
- Batch-eligible: YES (task_278 + task_279 완료 후, task_281/282/283과 파일 충돌 없음 → Wave 3 동시 실행)
- Rationale:
  - 파일 간 의존성 순차적. 닫기 동작 설계가 SSOT 제약을 가지므로 단일 에이전트가 전체 맥락 파악 필수.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: YES
- [x] SVG path: `design_drafts/layout_theme_picker_panel_280x210.svg`
  - Codex가 구현 착수 전 생성 또는 존재 확인
- [x] SVG viewBox: `0 0 280 210`
- [x] Tablet viewport checks:
  - 768×1024: 패널 280×210, 위치 (40,64) → 여백 충분 ✓
  - 820×1180: ✓
  - 1024×768: 높이 768, 패널 상단 64 + 210 = 274 → 여백 494 ✓
  - 1180×820: ✓
- [x] Numeric redlines:
  - 패널 전체: 280 × 210 px
  - 헤더: 전체 너비 × 36 px
  - 콘텐츠: 전체 너비 × 174 px (padding 8px 사방)
  - 프리셋 카드 3개: 각 약 80 × 90 px, gap 8px
  - 스와치 영역: 카드 너비 × 48 px (3색 줄)
  - 카드 텍스트: 12px, 중앙 정렬
  - defaultPosition: { x: 40, y: 64 }

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- Execution mode: DELEGATED
- Delegation chain scope: task_280 only
- Assigned roles:
  - Implementer-A: 전체 구현 (SVG 생성 → policy → registerCoreSlots → PanelLauncher → panelAdapters → AppLayout → ThemePickerPanel)
  - Reviewer+Verifier: Codex final gate
- File ownership lock plan: 7개 파일 전부 Implementer-A 단독 소유
- Parallel slot plan: 내부 병렬 없음 (single-agent sequential)
- Scheduler plan:
  - Slot allocation mode: DYNAMIC
  - Slot priority rule: dependency-first (task_279 완료 직후, task_281/282/283과 동시 투입)
  - Requested orchestration mode: max orchestration mode on
  - Initial slot split: 1 executor + 0 reviewer
  - Ready-queue refill trigger: task_279 완료 이벤트 시 Wave 3 전체 동시 등록
  - Agent close/reuse policy: 완료 즉시 close
  - Heartbeat policy:
    - Soft ping: ~90s
    - Reassignment: 4~6m
    - Long-run 예외: lint/build/typecheck
  - Reassignment safety rule: 2회 ping 무응답 + lock-critical 아님
- Delegated closeout metrics:
  - Peak active slots: 1 / Average: 1 / Refill: 1 / Reassignment: 0 (target)

---

## Optional Block C — Hotfix Exception

- [x] Applies: NO

---

## Optional Block D — Speculative Defense Check

- [x] Applies: NO

---

## Optional Block E — Documentation Update Check

- [x] Applies: YES
- [x] Structure changes:
  - `features/theme/ThemePickerPanel.tsx` 추가 → `node scripts/gen_ai_read_me_map.mjs` 실행
- [x] Semantic/rule changes:
  - v10/AI_READ_ME.md Theme System 섹션 추가:
    - ThemePickerPanel SSOT: `features/theme/ThemePickerPanel.tsx`
    - 진입점: PanelLauncher → "Theme" 버튼 (host + student)
    - 닫기 SSOT: `windowRuntimePanelOpenState` (context.setOpen 직접 호출 금지)

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: `panel-policy.ts`에 `THEME_PICKER = "core.theme-picker.panel"` + 정책 추가됨
- [ ] AC-2: `registerCoreSlots.ts`의 CORE_SLOT_BINDINGS에 ThemePickerPanel + launcher 바인딩 추가됨
- [ ] AC-2-1: ThemePicker binding에 `registerInSlotRuntime: !LAYOUT_SLOT_CUTOVER_ENABLED` 가드가 포함됨 (중복 렌더 방지)
- [ ] AC-3: `PanelLauncher.tsx`의 ENTRY_ICON_BY_NAME에 `Palette` 추가됨
- [ ] AC-4: PanelLauncher에서 "Theme" 항목이 Palette 아이콘과 함께 표시됨
- [ ] AC-5: ThemePickerPanel이 chalk/parchment/notebook 3개 카드를 표시함
- [ ] AC-6: 프리셋 카드 클릭 시 CSS var 즉시 전환됨
  - `--theme-surface` 값이 document.documentElement.style에서 변경됨 확인
- [ ] AC-7: 새로고침 후 선택 프리셋 유지 (localStorage 저장)
- [ ] AC-8: 활성 카드 하이라이트 표시 (border 또는 체크 아이콘)
- [ ] AC-9: X버튼 닫기 후 PanelLauncher 배지/재오픈 상태 정상 (재오픈 시 패널 표시됨)
- [ ] AC-10: `useModStudioStore.draft.theme` 변화 없음 (분리 확인)
- [ ] AC-11: `npm run lint` 통과
- [ ] AC-12: `npm run build` 통과

---

## Manual Verification Steps (Base Required)

1) Step: 정책 + 바인딩 확인
   - Command: `grep -n "THEME_PICKER\|theme-picker\|Palette\|registerInSlotRuntime" v10/src/core/config/panel-policy.ts v10/src/features/extensions/ui/registerCoreSlots.ts v10/src/features/layout/windowing/PanelLauncher.tsx`
   - Expected: 각 파일에 추가 확인
   - Covers: AC-1, AC-2, AC-2-1, AC-3

2) Step: PanelLauncher UI + Palette 아이콘
   - Command: `npm run dev` → PanelLauncher 열기 → "Theme" + Palette 아이콘 확인
   - Expected: Palette 아이콘 렌더링, LayoutGrid 폴백 아님
   - Covers: AC-4

3) Step: 프리셋 전환
   - Command: ThemePickerPanel → "parchment" 클릭 → DevTools Elements `<html>` style 확인
   - Expected: `--theme-surface` 값 parchment 팔레트로 변경
   - Covers: AC-5, AC-6

4) Step: localStorage 저장
   - Command: "notebook" 선택 → 새로고침 → ThemePickerPanel 열어 "notebook" 활성 확인
   - Covers: AC-7, AC-8

5) Step: 닫기 동작 SSOT 확인
   - Command: ThemePickerPanel X버튼 → 닫힘 → PanelLauncher "Theme" 다시 클릭 → 재오픈
   - Expected: 재오픈 시 정상 표시, 닫힌 상태 PanelLauncher 배지 반영
   - Covers: AC-9

6) Step: Mod Studio 분리
   - Command: `grep -n "useModStudioStore" v10/src/features/theme/ThemePickerPanel.tsx`
   - Expected: 매치 없음
   - Covers: AC-10

7) Step: 레이어 규칙 + 빌드
   - Command: `bash scripts/check_layer_rules.sh && cd v10 && npm run lint && npm run build`
   - Expected: 모두 통과
   - Covers: AC-11, AC-12

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - `closeThemePicker` 누락 시 X버튼 클릭 후 패널 재오픈 버그 발생
    → AC-9 단계에서 명시적으로 확인
  - `CORE_EDIT_ONLY_PANEL_POLICY_IDS`에 실수로 추가 시 student 역할에서 패널 숨겨짐
    → 추가 금지. student visible: true 정책 적용 확인
  - `useThemeStore` 미완성 상태(task_278 미완)에서 구현 시작 시 빌드 실패
    → task_278 COMPLETED 확인 후 착수
- Roll-back:
  - ThemePickerPanel 삭제, panel-policy + registerCoreSlots + panelAdapters + AppLayout + PanelLauncher 원복
  - `git revert <commit>` 한 줄로 복원

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received

> Implementation MUST NOT begin until both boxes are checked.
> Prerequisite: task_278 COMPLETED AND task_279 COMPLETED.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/features/theme/ThemePickerPanel.tsx` (create)
- `design_drafts/layout_theme_picker_panel_280x210.svg` (create)
- `v10/src/core/config/panel-policy.ts`
- `v10/src/features/extensions/ui/registerCoreSlots.ts`
- `v10/src/features/layout/windowing/panelAdapters.tsx`
- `v10/src/features/layout/windowing/PanelLauncher.tsx`
- `v10/src/features/layout/AppLayout.tsx`

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

Notes:
- 보정 사항: Block A YES (레드라인 추가), 닫기 동작 closeThemePicker 패턴, Palette 아이콘 PanelLauncher 추가, showThemePicker 정책 주석.
- Phase 3-B (고급 토큰 편집), Phase 3-C (JSON import/export)는 별도 스펙.
Manual verification notes:
- PanelLauncher에 `Theme` 항목 + `Palette` 아이콘 표시 확인.
- ThemePickerPanel에서 chalk/parchment/notebook 선택 시 즉시 테마 반영 확인.
- X 버튼 닫기 후 재오픈이 `windowRuntimePanelOpenState` SSOT와 일치하는지 확인.
