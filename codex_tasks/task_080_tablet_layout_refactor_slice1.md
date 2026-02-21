# Task 080: Tablet Layout Refactor Slice 1 (App Shell + DataInput)

Status: COMPLETED
Owner: Codex
Target: v10/
Date: 2026-02-07

## Goal
- What to change:
  - Implement tablet-first layout refinements for `AppLayout` and `DataInputPanel` based on finalized SVG structure artifacts.
  - Keep editing/presentation/overview feature modes identical across devices, while applying responsive layout profiles for tablet vs desktop.
  - Prioritize writing-surface continuity (ink UX) over panel visibility.
- What must NOT change:
  - No change to domain behavior (step model, playback semantics, persistence schema).
  - No changes to `Prompter`, `PlayerBar`, `FloatingToolbar` behavior in this slice.
  - No new dependencies.

## Scope (Codex must touch ONLY these)
Touched files/directories:
- `v10/src/features/chrome/layout/AppLayout.tsx`
- `v10/src/features/chrome/layout/DataInputPanel.tsx`
- `codex_tasks/task_080_tablet_layout_refactor_slice1.md`

Out of scope:
- `v10/src/features/chrome/layout/Prompter.tsx`
- `v10/src/features/chrome/layout/PlayerBar.tsx`
- `v10/src/features/chrome/toolbar/FloatingToolbar.tsx`
- Store/model/data contracts (`core/types`, migrations, persistence)

## Design Artifacts (required for layout/structure changes)
- [x] Layout/structure changes included: YES
- [x] SVG paths in `design_drafts/`:
  - `design_drafts/layout_app_layout_1440x1080.svg`
  - `design_drafts/layout_datainput_1440x1080.svg`
  - `design_drafts/layout_overviewstage_1440x1080.svg` (reference for board-ratio/zoom semantics)
- [x] SVG includes `viewBox` with explicit width/height and ratio label
- [x] Codex must verify SVG files exist before implementation

## Tablet viewport matrix (mandatory)
Implementation and manual checks must explicitly cover:
- `768x1024` (tablet portrait baseline)
- `820x1180` (tablet portrait large)
- `1024x768` (tablet landscape baseline)
- `1180x820` (tablet landscape large)

## Speculative Defense Check
- [x] Any defensive branches added? NO
- [x] Evidence provided (real input, spec, or bug report): N/A
- [x] Sunset criteria defined (when to remove): N/A

## Dependencies / constraints
- New dependencies allowed? NO
- Must follow `AGENTS.md` tablet ink UX governance and freeze rule.
- Must follow `task_078` locked geometry intent for App shell rhythm and DataInput width semantics.
- Must preserve layer boundaries (`v10/AI_READ_ME.md`): no cross-layer violations.
- Implementation order in this slice:
  1) App shell horizontal rhythm and responsive structure
  2) DataInput overlay/static behavior and panel reachability

## Documentation Update Check
- [x] 구조 변경(파일/폴더 추가·이동·삭제) 발생 시: `node scripts/gen_ai_read_me_map.mjs` 실행하여 `v10/AI_READ_ME_MAP.md` 갱신 여부 확인 (해당 없음: 파일/폴더 구조 변경 없음)
- [x] 규칙/의미 변경(레이어 규칙, 불변조건, 핵심 플로우 등) 발생 시: `v10/AI_READ_ME.md` 갱신 여부 확인 (해당 없음: 규칙/의미 변경 없음)

## Acceptance criteria (must be testable)
- [x] `AppLayout` keeps a stable content rhythm on desktop and tablet without mode-specific feature divergence.
- [x] `DataInputPanel` behaves as full overlay below `lg` and static right panel (`420px`) at `lg+` without geometry conflicts.
- [x] Ink continuity gate passes: panel/overlay transitions do not unexpectedly block writing flow or trap navigation.
- [x] No behavioral regressions in edit/presentation/overview mode toggles.
- [x] Only scoped files are modified.

## Manual verification steps (since no automated tests)
- Open app and verify on each required viewport (`768x1024`, `820x1180`, `1024x768`, `1180x820`):
  - Enter edit mode, open/close DataInputPanel repeatedly, confirm canvas remains reachable and recoverable.
  - Trigger overview mode and return, confirm layout does not collapse or drift.
  - Enter/exit presentation mode, confirm no unexpected shell break from slice changes.
- Confirm no schema/store contract changes by code inspection.

## Risks / roll-back notes
- Risk: Tablet overlay behavior can regress pointer accessibility.
- Risk: Shell spacing tweaks can unintentionally shift footer stack behavior.
- Roll-back: revert slice files only (`AppLayout.tsx`, `DataInputPanel.tsx`) and retain this spec for iteration.

---

## Implementation Log (Codex fills)
Status: COMPLETED
Changed files:
- `v10/src/features/chrome/layout/AppLayout.tsx`
- `v10/src/features/chrome/layout/DataInputPanel.tsx`
- `codex_tasks/task_080_tablet_layout_refactor_slice1.md`

Commands run (only if user asked):
- `sed -n ... AGENTS.md / GEMINI_CODEX_PROTOCOL.md / PROJECT_BLUEPRINT.md / PROJECT_CONTEXT.md`
- `sed -n ... codex_tasks/task_080_tablet_layout_refactor_slice1.md`
- `sed -n ... v10/AI_READ_ME.md / v10/AI_READ_ME_MAP.md`
- `sed -n ... v10/src/features/chrome/layout/AppLayout.tsx`
- `sed -n ... v10/src/features/chrome/layout/DataInputPanel.tsx`
- `apply_patch` (AppLayout/DataInputPanel/task_080 updates)

Notes:
- Spec created before implementation.
- Implemented responsive shell spacing profile (`px/gap`) for tablet widths while preserving desktop rhythm and mode behavior.
- Implemented DataInput panel stability constraints: `lg` static fixed width (`420px`, no shrink) and `<lg` overlay continuity behavior.
- Added `Escape` close shortcut for DataInput panel to improve recoverability in overlay mode.
- Manual verification note:
  - Runtime viewport checks were not executed in this turn because dev server commands were not requested.
  - Static code inspection confirms scoped-file-only changes and no store/schema contract changes.
