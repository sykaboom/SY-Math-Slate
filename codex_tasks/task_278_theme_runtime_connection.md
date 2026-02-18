# Task 278: 테마 런타임 연결선 — Phase 1A

Status: PENDING
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-18

---

## 사전 감사 기록 (직접 Read/Grep, 2026-02-18)

```
[ PASS ] core/config/themeTokens.ts 존재 — 토큰 키 분류, 정규화 함수 완비
[ PASS ] core/themes/presets.ts 존재 — chalk/parchment/notebook 3개 프리셋 완비
[ PASS ] features/mod-studio/theme/themeIsolation.ts 존재
         applyThemeDraftPreview() — CSS Custom Property 주입 구현 완료
         --theme-{key} / --mod-{moduleId}-{key} 명명 규칙 확립
[ PASS ] features/mod-studio/theme/ThemeStudioSection.tsx 존재
         — 프리셋 선택 + 토큰 오버라이드 UI 이미 있음
[ FAIL ] useThemeStore 없음 — 앱 레벨 테마 상태 Zustand store 없음
[ FAIL ] ThemeProvider 없음 — 앱 시작 시 CSS var 초기화 컴포넌트 없음
[ FAIL ] localStorage 저장 없음 — 새로고침 시 테마 초기화됨
[ FAIL ] preferences schema 없음 — canvas ratio, panels, ink, viewer 설정 없음
[ PASS ] layout.tsx 확인 — 23줄, ThemeProvider 추가 위치 특정 가능 (body 내부)
```

---

## Goal (Base Required)

- What to change:
  - 기존 테마 계약(토큰 키, 프리셋, CSS var 주입)을 앱 레벨 런타임에 연결
  - `core/theme/applyTheme.ts` — 앱 레벨 CSS var 주입 함수 (core 레이어로 승격)
  - `core/theme/preferences.schema.ts` — preferences 타입 정의 (canvas/panels/ink/viewer/접근성)
  - `features/store/useThemeStore.ts` — 앱 전체 테마 상태 Zustand store + localStorage 저장
  - `features/theme/ThemeProvider.tsx` — 앱 마운트 시 테마 초기화 클라이언트 컴포넌트
  - `app/layout.tsx` — ThemeProvider 추가
  - `features/mod-studio/theme/themeIsolation.ts` — core/theme/applyTheme 재사용으로 소수정

- What must NOT change:
  - `core/config/themeTokens.ts` 수정 없음
  - `core/themes/presets.ts` 수정 없음
  - `useModStudioStore.ts` 수정 없음 (draft.theme은 Mod Studio 전용 유지)
  - 기존 컴포넌트의 렌더링 결과 변경 없음 (CSS var 초기값이 chalk preset 기본값과 동일하면 무변화)
  - themeIsolation.ts의 `applyThemeDraftPreview` 시그니처 변경 없음

---

## Scope (Base Required)

Touched files/directories:

**신규 (create):**
- `v10/src/core/theme/applyTheme.ts` — CSS var 주입 코어 함수
- `v10/src/core/theme/preferences.schema.ts` — ThemePreferences 타입
- `v10/src/features/store/useThemeStore.ts` — 앱 테마 Zustand store
- `v10/src/features/theme/ThemeProvider.tsx` — 클라이언트 초기화 컴포넌트

**수정 (write):**
- `v10/src/app/layout.tsx` — ThemeProvider 삽입
- `v10/src/features/mod-studio/theme/themeIsolation.ts` — applyTheme 재사용 소수정

Out of scope:
- 기존 컴포넌트의 Tailwind 하드코딩 교체 (Phase 1B)
- ThemePickerPanel UI (Phase 3)
- 테마 가져오기/내보내기 (Phase 3)
- workspace/document 레벨 실효 canvas ratio (별도 태스크)

---

## 상세 설계 (Codex 구현 참고)

### 1. `core/theme/applyTheme.ts`

```typescript
// CSS var 주입 로직을 core 레이어로 승격.
// themeIsolation.ts의 applyThemeDraftPreview와 동일한 메커니즘.
// 차이점: lastApplied 트래킹을 클로저가 아닌 export된 함수로 관리.

export function applyTheme(
  globalTokens: ThemeGlobalTokenMap,
  moduleScopedTokens: ThemeModuleScopedTokenMap,
  presetId?: string
): void

// --theme-{key} 전역 토큰 주입
// --mod-{moduleId}-{key} 모듈 토큰 주입
// 이전 변수 cleanup (lastApplied 트래킹)
```

레이어 규칙: `core/` → `core/config/themeTokens`만 import. 외부 의존성 없음.

### 2. `core/theme/preferences.schema.ts`

```typescript
export type ThemePreferences = {
  canvas: {
    defaultRatio: '16:9' | '4:3' | 'A4' | 'free'  // 테마 추천값 (실효값 SSOT는 workspace/doc)
    background: 'solid' | 'grid' | 'dotted' | 'lined'
    defaultZoom: number  // 0.5 ~ 2.0
  }
  panels: {
    density: 'compact' | 'comfortable' | 'spacious'
  }
  ink: {
    defaultTool: 'pen' | 'laser' | 'eraser'
    defaultPenWidth: number   // 1 ~ 20
    defaultPenOpacity: number // 0.1 ~ 1.0
    smoothing: 'none' | 'light' | 'heavy'
  }
  viewer: {
    autoPlaySpeed: number  // 0.5 ~ 3.0
    showControls: 'always' | 'hover' | 'never'
    navigationStyle: 'arrows' | 'swipe' | 'both'
  }
  accessibility: {
    reduceMotion: boolean
    fontSize: 'small' | 'medium' | 'large'
  }
}

export const DEFAULT_THEME_PREFERENCES: ThemePreferences = { ... }
```

### 3. `features/store/useThemeStore.ts`

```typescript
interface ThemeStoreState {
  activePresetId: ThemePresetId
  globalTokenOverrides: ThemeGlobalTokenMap       // 사용자 오버라이드 (기본 빈 객체)
  moduleScopedOverrides: ThemeModuleScopedTokenMap
  preferences: ThemePreferences
  // actions
  setPreset: (presetId: ThemePresetId) => void    // preset 교체 + applyTheme 호출
  setTokenOverride: (key, value) => void          // 개별 토큰 오버라이드
  setPreferences: (partial: Partial<ThemePreferences>) => void
  resetToPreset: (presetId: ThemePresetId) => void // 오버라이드 초기화
  applyActiveTheme: () => void                    // CSS var 즉시 재적용
}

// localStorage 키: "sy-theme-v1"
// 저장 대상: activePresetId, globalTokenOverrides, moduleScopedOverrides, preferences
// 로드: store 초기화 시 localStorage에서 복원
// 중요: useModStudioStore.draft.theme과 완전히 분리 (Mod Studio 초안 ≠ 앱 활성 테마)
```

setPreset/setTokenOverride 호출 시 자동으로 applyTheme() 실행.

### 4. `features/theme/ThemeProvider.tsx`

```typescript
"use client"

// 앱 마운트 시 1회 실행:
// 1. useThemeStore.applyActiveTheme() 호출 → CSS var 초기화
// 2. useThemeStore 구독 → 상태 변경 시 자동 재적용 (불필요, setPreset이 이미 처리)
// React.children을 그대로 반환 (레이아웃 변경 없음)

export function ThemeProvider({ children }: { children: React.ReactNode })
```

### 5. `app/layout.tsx` 수정

```tsx
// Before:
<body className="antialiased">{children}</body>

// After:
<body className="antialiased">
  <ThemeProvider>{children}</ThemeProvider>
</body>
```

ThemeProvider는 "use client"이므로 body 내부에서만 사용 가능. layout.tsx는 Server Component 유지.

### 6. `themeIsolation.ts` 소수정

`applyThemeDraftPreview`가 내부 중복 구현 대신 `core/theme/applyTheme`를 호출하도록 변경.
외부 시그니처(`applyThemeDraftPreview(globalTokens, moduleScopedTokens, presetId)`) 변경 없음.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - `core/theme/` → `core/config/`, `core/themes/`만 import 가능 (core 레이어 규칙)
  - `features/store/useThemeStore` → `core/theme/`, `core/config/`, `core/themes/` import (features→core OK)
  - `features/theme/ThemeProvider` → `features/store/useThemeStore` import (features→features OK)
  - `app/layout.tsx` → `features/theme/ThemeProvider` import (app→features OK)
  - `features/mod-studio/theme/themeIsolation` → `core/theme/applyTheme` import (features→core OK)
- Compatibility:
  - chalk preset이 앱 기본값(dark board)이므로, ThemeProvider 추가 후 현재 앱 외관 변화 없어야 함
  - localStorage 없을 시 chalk preset 기본 적용

---

## DAG / Wave Metadata (Base Required)

- Wave ID: W1-theme
- Depends on tasks: []
- Enables tasks: [task_279 (Phase 1B 하드코딩 감사 + 셸 마이그레이션), Phase 3 ThemePickerPanel]
- Parallel group: G2-ui
- Max parallel slots: 6
- Verification stage for this task: `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count: 6 (4 create + 2 write)
- Files shared with other PENDING tasks:
  - `app/layout.tsx`: 다른 PENDING 태스크와 충돌 없음
  - 나머지 신규 파일: 충돌 없음
- Cross-module dependency: YES (core → features → app 방향)
- Parallelizable sub-units: 0
  - applyTheme 먼저 → preferences schema → useThemeStore → ThemeProvider → layout.tsx 순 (순차)
- Estimated single-agent duration: ~40min
- Recommended mode: DELEGATED (single-agent lane)
- Batch-eligible: YES (다른 PENDING 태스크와 파일 충돌 없음)
- Rationale:
  - 파일 간 의존성이 순차적이므로 단일 에이전트가 전체 흐름을 파악하며 구현해야 안전.
  - 레이어 경계 위반 위험이 있어 구현 중 applyTheme → themeIsolation 변경 순서 중요.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- Execution mode: DELEGATED
- Delegation chain scope:
  - task_278 only
- Assigned roles:
  - Implementer-A: 전체 구현 (core/theme 신규 → store → provider → layout → themeIsolation 수정)
  - Reviewer+Verifier: Codex final gate
- File ownership lock plan:
  - 6개 파일 전부 Implementer-A 단독 소유
- Parallel slot plan:
  - 내부 병렬 없음 (single-agent sequential)
- Scheduler plan:
  - Slot allocation mode: DYNAMIC
  - Slot priority rule: dependency-first
  - Requested orchestration mode: max orchestration mode on
  - Initial slot split: 1 executor + 0 reviewer (task local)
  - Ready-queue refill trigger: task 완료 시 task_279 runnable 전환
  - Agent close/reuse policy: 완료 즉시 close
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
  - [x] Structure changes:
    - 신규 디렉토리: `v10/src/core/theme/`, `v10/src/features/theme/`
    - `node scripts/gen_ai_read_me_map.mjs` 실행 필요
  - [x] Semantic/rule changes:
    - v10/AI_READ_ME.md에 "Theme System" 섹션 추가:
      - applyTheme SSOT: `core/theme/applyTheme.ts`
      - 앱 테마 상태 SSOT: `features/store/useThemeStore.ts`
      - Mod Studio 테마 초안: `useModStudioStore.draft.theme` (앱 활성 테마와 분리)
      - CSS var 명명: `--theme-{key}` / `--mod-{moduleId}-{key}`
      - preferences.canvas.defaultRatio = 테마 추천값; 실효값 SSOT = workspace/doc 설정

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: `core/theme/applyTheme.ts`가 존재하고 `applyTheme()` export됨
- [ ] AC-2: `core/theme/preferences.schema.ts`가 존재하고 `ThemePreferences`, `DEFAULT_THEME_PREFERENCES` export됨
- [ ] AC-3: `features/store/useThemeStore.ts`가 존재하고 `useThemeStore` export됨
  - `activePresetId`, `preferences`, `setPreset`, `setPreferences`, `applyActiveTheme` 포함
- [ ] AC-4: `features/theme/ThemeProvider.tsx`가 존재하고 "use client" + `ThemeProvider` export됨
- [ ] AC-5: `app/layout.tsx`의 body에 `<ThemeProvider>`가 children을 감쌈
- [ ] AC-6: 앱 시작 시 chalk preset의 CSS var(`--theme-surface`, `--theme-accent` 등)가 `document.documentElement.style`에 주입됨
- [ ] AC-7: `localStorage["sy-theme-v1"]` 저장/복원 동작
  - presetId를 parchment로 변경 → 새로고침 → parchment 유지
- [ ] AC-8: `useModStudioStore.draft.theme`은 변경 없음 (분리 유지)
- [ ] AC-9: `themeIsolation.ts`의 `applyThemeDraftPreview` 시그니처 변경 없음
- [ ] AC-10: `npm run lint` 통과
- [ ] AC-11: `npm run build` 통과

---

## Manual Verification Steps (Base Required)

1) Step: CSS var 주입 확인
   - Command / click path: 브라우저 DevTools → Elements → `<html>` style attribute
   - Expected result: `--theme-surface`, `--theme-accent`, `--mod-core-toolbar-surface` 등 존재
   - Covers: AC-6

2) Step: localStorage 저장 확인
   - Command / click path: `useThemeStore.getState().setPreset("parchment")` → 새로고침 → DevTools Application → localStorage `sy-theme-v1`
   - Expected result: `activePresetId: "parchment"` 유지, parchment CSS var 적용
   - Covers: AC-7

3) Step: Mod Studio 분리 확인
   - Command / click path: `grep -n "useModStudioStore\|draft\.theme" v10/src/features/store/useThemeStore.ts`
   - Expected result: 매치 없음 (useThemeStore는 ModStudio와 무관)
   - Covers: AC-8

4) Step: 레이어 규칙 확인
   - Command / click path: `bash scripts/check_layer_rules.sh`
   - Expected result: PASS
   - Covers: 레이어 경계 위반 없음

5) Step: 빌드 확인
   - Command / click path: `cd v10 && npm run lint && npm run build`
   - Expected result: 에러 없이 통과
   - Covers: AC-10, AC-11

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - ThemeProvider가 SSR에서 실행되면 `document` 참조로 오류 발생
    → "use client" + `typeof document !== 'undefined'` 가드 필수
  - chalk preset 기본값이 현재 앱 CSS와 정확히 일치하지 않으면 미묘한 색상 변화 발생
    → AC-6 검증 시 기존 앱과 시각적 비교 필요
  - themeIsolation.ts 수정 시 Mod Studio 테마 미리보기 동작 깨질 수 있음
    → `applyThemeDraftPreview` 시그니처/동작 보존 확인 필수 (AC-9)
  - `lastApplied` 트래킹이 applyTheme와 applyThemeDraftPreview 간 독립적이어야 함
    → 두 함수가 동일 CSS var를 쓰므로 Mod Studio 미리보기 → 앱 테마 재적용 시 cleanup 검증
- Roll-back:
  - ThemeProvider 제거, useThemeStore 삭제, layout.tsx 원복, themeIsolation.ts 원복
  - `git revert <commit>` 한 줄로 복원

---

## Approval Gate (Base Required)

- [ ] Spec self-reviewed by Codex
- [ ] Explicit user approval received

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: PENDING

Changed files:
- ...

Commands run:
- ...

## Gate Results (Codex fills)

- Lint: N/A
- Build: N/A
- Script checks: N/A

## Failure Classification (Codex fills when any gate fails)

- N/A

Manual verification notes:
- N/A

Notes:
- Phase 1A: 기존 core/config/themeTokens, core/themes/presets, themeIsolation 재사용 전제.
- 신규 생성이 아닌 "연결선 4개" 작업.
- Phase 1B (하드코딩 교체)는 task_279에서 처리.
