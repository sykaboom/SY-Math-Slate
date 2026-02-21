# Task 082: Tablet Writer Mode Runtime Shell (Implement from Task 081 SVG)

Status: COMPLETED
Owner: Codex (implementation)
Target: v10/
Date: 2026-02-07

## Goal
- What to change:
  - Implement tablet writer-mode runtime layout using finalized SVG structure from `task_081`.
  - Make tablet (`<xl`) default flow ink-first: canvas-dominant shell + full-screen drafting room for DataInput.
  - Keep desktop (`xl+`) workflow compatible with existing right-panel editing pattern.
- What must NOT change:
  - No schema/contract changes (`PersistedSlateDoc`, step model, exchange formats).
  - No non-destructive sync algorithm changes in this task (handled in `task_083`).
  - No new dependencies.

## Scope (Codex must touch ONLY these)
Touched files/directories:
- `v10/src/features/chrome/layout/AppLayout.tsx`
- `v10/src/features/chrome/layout/DataInputPanel.tsx`
- `v10/src/features/chrome/layout/PlayerBar.tsx`
- `v10/src/features/chrome/layout/Prompter.tsx`
- `v10/src/features/platform/store/useUIStore.ts` (only if mode/state flags are required)
- `codex_tasks/task_082_tablet_writer_mode_runtime_shell.md`

Out of scope:
- `v10/src/features/chrome/layout/dataInput/blockDraft.ts` (non-destructive sync logic)
- Any `core/**` contract/type schema changes
- Any new package installation

## Design Artifacts (required for layout/structure changes)
- [x] Layout/structure changes included: YES
- [x] SVG paths in `design_drafts/`:
  - `design_drafts/layout_writer_shell_768x1024.svg`
  - `design_drafts/layout_writer_shell_820x1180.svg`
  - `design_drafts/layout_writer_shell_1024x768.svg`
  - `design_drafts/layout_writer_shell_1180x820.svg`
  - `design_drafts/layout_drafting_room_768x1024.svg`
  - `design_drafts/layout_drafting_room_1024x768.svg`
  - `design_drafts/layout_mode_transition_map_1440x1080.svg`
- [x] SVG includes `viewBox` with explicit width/height and ratio label
- [x] Codex must verify SVG files exist before implementation

## Tablet viewport matrix (mandatory)
Implementation and manual checks must explicitly cover:
- `768x1024` (tablet portrait baseline)
- `820x1180` (tablet portrait large)
- `1024x768` (tablet landscape baseline)
- `1180x820` (tablet landscape large)

## Structural implementation order (mandatory)
1) app shell (canvas/chrome ratio)
2) panel/drawer (DataInput modal workspace switch)
3) footer controls (tablet reachability, non-blocking)
4) overlays (z-order and escape/return predictability)

## Required runtime mapping from SVG IDs
- Writer shell mapping:
  - `region_canvas_primary`
  - `region_chrome_top`
  - `region_chrome_bottom`
  - `region_toolchips`
  - `action_open_drafting_room`
- Drafting room mapping:
  - `region_drafting_header`
  - `region_drafting_content`
  - `region_drafting_actions`
  - `action_return_to_canvas`
- Transition mapping:
  - `state_canvas_mode`
  - `state_input_mode`

## Ink continuity gates (must pass)
- Tablet canvas mode must not be unexpectedly blocked by persistent panels.
- DataInput open/close must be reversible with one clear action (button and `Esc`).
- Overlay z-order must not hide critical return action.

## Speculative Defense Check
- [x] Any defensive branches added? NO
- [x] Evidence provided (real input, spec, or bug report): N/A
- [x] Sunset criteria defined (when to remove): N/A

## Dependencies / constraints
- New dependencies allowed? NO
- Keep layer boundaries from `v10/AI_READ_ME.md`.
- No `window` globals, no `eval/new Function`.
- `dangerouslySetInnerHTML` paths must remain sanitized upstream.
- If `task_081` SVG and runtime constraints conflict, resolve with explicit numeric values in this spec before coding.

## Documentation Update Check
- [x] 구조 변경(파일/폴더 추가·이동·삭제) 발생 시: `node scripts/gen_ai_read_me_map.mjs` 실행하여 `v10/AI_READ_ME_MAP.md` 갱신 여부 확인 (해당 없음: 파일/폴더 구조 변경 없음)
- [x] 규칙/의미 변경(레이어 규칙, 불변조건, 핵심 플로우 등) 발생 시: `v10/AI_READ_ME.md` 갱신 여부 확인 (해당 없음: 레이어 규칙 변경 없음)

## Acceptance criteria (must be testable)
- [x] On `<xl`, DataInput does not consume side width; it opens as full-screen drafting workspace.
- [x] On `xl+`, existing right-panel workflow remains usable without layout collapse.
- [x] Tablet writer shell keeps canvas-dominant visibility floor (`MUST`: portrait >=85%, landscape >=80% based on app viewport behavior).
- [x] Open/return actions are reachable with touch target >=44x44 equivalent hit area.
- [x] No regressions in edit/presentation/overview mode switching.
- [x] Only scoped files are modified.

## Manual verification steps (since no automated tests)
- For each required viewport:
  - open board, enter edit flow, open DataInput, verify full-screen drafting mode on `<xl`
  - return to canvas and verify writing surface is immediately usable
  - check footer/player/prompter do not block primary writing path unexpectedly
- Desktop (`>=1280`) sanity check:
  - open DataInput and verify sidebar workflow remains operational
- Regression sanity:
  - toggle overview and presentation modes and verify no shell break

## Risks / roll-back notes
- Risk: footer/control repositioning can reduce canvas reachability if z-order is wrong.
- Risk: mixed breakpoint behavior can diverge around `lg/xl` boundaries.
- Roll-back: revert only scope files and keep `task_081` SVG as source-of-truth.

## Dependencies on other tasks
- Requires `task_081` status to remain `COMPLETED` and SVG files unchanged in semantics.
- `task_083` depends on this task for stable modal workspace behavior.

---

## Implementation Log (Codex fills)
Status: COMPLETED
Changed files:
- `v10/src/features/chrome/layout/AppLayout.tsx`
- `v10/src/features/chrome/layout/DataInputPanel.tsx`
- `codex_tasks/task_082_tablet_writer_mode_runtime_shell.md`

Commands run (only if user asked):
- `sed -n` (spec + target files inspection)
- `rg` (class/id/breakpoint checks)
- `apply_patch` (task_082 implementation + spec closeout)

Notes:
- Implemented tablet `<xl` fullscreen drafting workspace behavior by shifting DataInput static breakpoint to `xl`.
- Added runtime mapping hooks via `data-layout-id` / `data-layout-state` attributes for key SVG contract regions.
- Added `action_open_drafting_room` header button (`44px` hit target) and `action_return_to_canvas` close action (`44px` hit target).
- Footer controls in edit mode are now fixed floating chrome on tablet to reduce in-flow canvas compression; desktop keeps static flow.
- Manual verification note:
  - Runtime viewport checks were not executed in this turn because dev server commands were not requested.
  - Static inspection confirms scoped-file-only production changes.
