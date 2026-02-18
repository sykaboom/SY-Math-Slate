# Task 290: Phase 3-B — 고급 토큰 편집기 (Advanced Token Editor)

Status: PENDING
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-18

---

## 사전 감사 기록

```
[ PREREQUISITE ]
- task_279 COMPLETED: --theme-* CSS vars 및 theme-* Tailwind utilities 완성
- task_280 COMPLETED: ThemePickerPanel (3개 프리셋 선택 UI)
- ThemeStudioSection.tsx: applyThemeDraftPreview() 이미 존재
  → 실시간 테마 미리보기 메커니즘 재사용 가능
- THEME_GLOBAL_TOKEN_KEYS: 18개 토큰 (surface, text, border, accent 등)
- themeTokens.ts: ThemeGlobalTokenMap, ThemeModuleTokenKey 구조 완성

[ GOAL ]
Phase 3-A = 3개 프리셋 중 선택 (사용자 편의)
Phase 3-B = 각 --theme-* 토큰을 직접 편집 (전문가 모드)
  → 각 토큰에 color picker / hex input 제공
  → 실시간 미리보기 (applyThemeDraftPreview 재사용)
  → 커스텀 프리셋으로 저장
```

---

## Goal (Base Required)

- What to change:
  - `TokenEditorPanel.tsx` — 고급 토큰 편집 패널 (ThemeStudioSection 내부 또는 독립)
  - `TokenColorPicker.tsx` — 단일 토큰 color picker + hex/rgba input
  - `useTokenDraftStore.ts` — 편집 중인 토큰 draft 상태 관리
  - `saveTokenDraftAsPreset()` — draft → custom preset 저장 (localStorage)
  - `presets.ts` 수정: custom preset 로드 지원 (localStorage에서 읽기)
  - `ThemePickerPanel.tsx` 수정: custom preset 목록 표시 + 삭제
- What must NOT change:
  - `THEME_GLOBAL_TOKEN_KEYS` 타입 구조 변경 없음
  - `applyThemeDraftPreview()` 기존 동작 변경 없음
  - 기본 3개 프리셋 (chalk/parchment/notebook) 수정 불가

---

## Scope (Base Required)

Touched files/directories (create):
- `v10/src/features/mod-studio/theme/TokenEditorPanel.tsx`
- `v10/src/features/mod-studio/theme/TokenColorPicker.tsx`
- `v10/src/features/store/useTokenDraftStore.ts`

Touched files/directories (write):
- `v10/src/features/mod-studio/theme/ThemeStudioSection.tsx` — TokenEditorPanel 통합 (고급 모드 탭)
- `v10/src/core/themes/presets.ts` — custom preset 로드 지원
- `v10/src/features/layout/ThemePickerPanel.tsx` — custom preset 목록 표시

Out of scope:
- 모듈 스코프 토큰 편집 (core-toolbar, mod-studio 모듈별 토큰) — 별도 태스크
- JSON import/export (Phase 3-C)
- AI 테마 제안 (Phase 4)

---

## UI 설계

```
ThemeStudioSection 내:
  [Basic | Advanced] 탭

Advanced 탭:
  토큰 그룹:
  ┌─ Surface ─────────────────────────────┐
  │  surface         [██████] #0F172A rgba(15,23,42, 0.92) │
  │  surface-soft    [██████] ...                           │
  │  surface-overlay [██████] ...                           │
  ├─ Text ────────────────────────────────┤
  │  text            [██████] ...                           │
  │  text-muted      [██████] ...                           │
  │  text-subtle     [██████] ...                           │
  ├─ Border ──────────────────────────────┤
  │  ...                                  │
  └───────────────────────────────────────┘

  [미리보기 적용] [프리셋으로 저장] [리셋]
```

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: YES (1개 한정)
  - `react-colorful` 또는 `@radix-ui` color picker 확장 — 경량 color picker
  - 없으면 `<input type="color">` HTML5 native 사용 (의존성 없음, 기능 제한)
- Boundary rules:
  - `TokenEditorPanel.tsx`, `TokenColorPicker.tsx` → `features/mod-studio/theme/` 레이어
  - `useTokenDraftStore.ts` → `features/store/` 레이어
  - custom preset 저장: localStorage key `sy_custom_presets` (JSON array)
- Compatibility:
  - Phase 3-C(JSON export)에서 `useTokenDraftStore.getState().draft` → JSON export 가능 구조

---

## DAG / Wave Metadata (Base Required)

- Wave ID: W6-phase3
- Depends on tasks: [task_280, task_284] (Phase T 완료 후)
- Enables tasks: [task_291 Phase 3-C]
- Parallel group: G6-theming (단독)
- Max parallel slots: 1
- Verification stage: `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count: 6 (3 create + 3 write)
- Files shared with other PENDING tasks: 없음
- Cross-module dependency: NO (mod-studio + store 내부)
- Parallelizable sub-units: 0
- Estimated single-agent duration: ~40min
- Recommended mode: DELEGATED (single-agent lane)
- Batch-eligible: YES (task_280/284 완료 후 Phase 5와 병렬 가능 — 파일 충돌 없음)
- Rationale: UI 컴포넌트 + store 단순 조합. 색상 편집 UX 패턴 명확.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: NO (TokenEditorPanel은 기존 ThemeStudioSection 내부 탭)

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- Execution mode: DELEGATED
- Delegation chain scope: task_290 only
- File ownership lock plan: 6개 파일 Implementer-A 단독
- Parallel slot plan: 내부 병렬 없음
- Scheduler plan:
  - Slot allocation mode: DYNAMIC
  - Requested orchestration mode: max orchestration mode on
  - Ready-queue refill trigger: task_280 AND task_284 완료 시
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
  - `v10/AI_READ_ME.md`: Phase 3-B 고급 토큰 편집기 기록, custom preset localStorage 키 명시

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: ThemeStudioSection Advanced 탭에서 18개 전체 토큰 편집 가능
- [ ] AC-2: 토큰 색상 변경 → 실시간 미리보기 적용 (applyThemeDraftPreview 활용)
- [ ] AC-3: "프리셋으로 저장" → localStorage에 custom preset 저장 → ThemePickerPanel에 표시
- [ ] AC-4: 커스텀 프리셋 적용 → 전체 앱 테마 전환 확인
- [ ] AC-5: 기본 3개 프리셋 (chalk/parchment/notebook) 수정 불가 (read-only 표시)
- [ ] AC-6: `npm run lint` 통과
- [ ] AC-7: `npm run build` 통과

---

## Manual Verification Steps (Base Required)

1) Step: 토큰 편집 + 미리보기
   - Mod Studio → Theme → Advanced 탭 → surface 토큰 색상 변경
   - 실시간 앱 배경색 변경 확인
   - Covers: AC-1, AC-2

2) Step: 커스텀 프리셋 저장
   - 편집 완료 → "프리셋으로 저장" → 이름 입력 → 저장
   - ThemePickerPanel에 커스텀 프리셋 카드 표시 확인
   - Covers: AC-3, AC-4

3) Step: 빌드 확인
   - Command: `cd v10 && npm run lint && npm run build`
   - Covers: AC-6, AC-7

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - rgba(r, g, b, a) 포맷 파싱: color picker output → ThemeGlobalTokenMap value 포맷 변환 필요
    → parseRgbTuple 역함수 (tuple → rgba string) 구현
  - 18개 토큰 전부 실시간 업데이트 시 성능: debounce 100ms 적용
- Roll-back: `git revert <commit>` 한 줄 + localStorage `sy_custom_presets` 삭제

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received

> Prerequisite: task_280 COMPLETED AND task_284 COMPLETED.

---

## Implementation Log (Codex fills)

Status: PENDING

Changed files:
- (TBD)

## Gate Results (Codex fills)

- Lint: (TBD)
- Build: (TBD)

Manual verification notes:
- (TBD)
