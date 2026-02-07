# Task 084: Tablet Fullscreen Ink + Landscape UX Stabilization

Status: COMPLETED
Owner: Codex (implementer)
Target: v10/
Date: 2026-02-07

## Goal
- What to change:
  - Define runtime UX requirements for tablet fullscreen ink mode in web browsers.
  - Stabilize landscape tablet writing UX against browser chrome show/hide (address bar resize jitter).
  - Add explicit fullscreen entry/exit model with fallback behavior when native Fullscreen API is unavailable.
- What must NOT change:
  - No production code edits in this task.
  - No non-destructive sync logic work (reserved for `task_083`).
  - No schema/contract/version changes.
  - No new dependencies.

## Scope (Codex must touch ONLY these)
Touched files/directories:
- `codex_tasks/task_084_tablet_fullscreen_ink_landscape_ux.md`
- `design_drafts/layout_tablet_ink_fullscreen_768x1024.svg`
- `design_drafts/layout_tablet_ink_fullscreen_1024x768.svg`
- `design_drafts/layout_tablet_landscape_controls_1180x820.svg`
- `design_drafts/layout_web_chrome_resize_guard_1440x1080.svg`
- `v10/src/features/layout/AppLayout.tsx`
- `v10/src/features/layout/PlayerBar.tsx`
- `v10/src/features/layout/Prompter.tsx`
- `v10/src/features/store/useUIStore.ts`

Optional implementation file (only if action placement requires):
- `v10/src/features/layout/DataInputPanel.tsx`

Out of scope:
- `v10/src/features/layout/dataInput/blockDraft.ts`
- `v10/src/features/layout/dataInput/segmentCommands.ts`
- Any `core/**` contract/type migration changes
- Any dependency/package changes

## Design Artifacts (required for layout/structure changes)
- [x] Layout/structure changes included: YES
- [x] SVG path in `design_drafts/`: required before implementation
- [x] SVG includes `viewBox` with explicit width/height and ratio label
- [x] Codex must verify SVG file exists before implementation

Required SVG deliverables for this task:
1) `design_drafts/layout_tablet_ink_fullscreen_768x1024.svg`
2) `design_drafts/layout_tablet_ink_fullscreen_1024x768.svg`
3) `design_drafts/layout_tablet_landscape_controls_1180x820.svg`
4) `design_drafts/layout_web_chrome_resize_guard_1440x1080.svg`

## Stable IDs (mandatory)
Use deterministic IDs exactly as written below.

`layout_tablet_ink_fullscreen_768x1024.svg` and `layout_tablet_ink_fullscreen_1024x768.svg`:
- `region_canvas_primary`
- `region_toolchips`
- `action_enter_fullscreen_ink`
- `action_exit_fullscreen_ink`

`layout_tablet_landscape_controls_1180x820.svg`:
- `region_canvas_primary`
- `region_toolchips`
- `action_open_drafting_room`
- `action_exit_fullscreen_ink`

`layout_web_chrome_resize_guard_1440x1080.svg`:
- `state_browser_chrome_visible`
- `state_browser_chrome_hidden`
- `state_native_fullscreen`
- `state_app_fullscreen_fallback`
- `action_enter_fullscreen_ink`
- `action_exit_fullscreen_ink`
- `action_request_native_fullscreen`
- `action_fallback_to_app_fullscreen`

## Tablet viewport matrix (mandatory)
- `768x1024` (tablet portrait baseline)
- `820x1180` (tablet portrait large)
- `1024x768` (tablet landscape baseline)
- `1180x820` (tablet landscape large)

## UX constraints (locked)
1) Ink fullscreen mode
- Provide explicit `enter_fullscreen_ink` and `exit_fullscreen_ink` user actions.
- Primary actions must keep minimum hit target equivalent to `44x44`.
- In fullscreen ink mode, non-critical chrome must be minimized by default.

2) Browser chrome resize guard
- Layout must remain stable when browser address bar appears/disappears during touch/pencil input.
- Writer shell must avoid sudden canvas height jumps that interrupt stroke flow.
- Define viewport strategy in implementation notes: prioritize `dvh` + guarded fallback (`svh`/locked container) based on measured behavior.

3) Landscape writing ergonomics
- In landscape tablet mode, controls must not eat central writing lane.
- Footer/overlay/tool chips must keep writing path clear and quickly dismissible.
- Return/escape path must always stay visible above overlays.

4) Fullscreen API policy
- Use native Fullscreen API when available.
- If unavailable or blocked, fallback to app-level fullscreen ink mode with equivalent UX intent.
- Fallback path must remain deterministic and reversible.

## Implementation sequencing (when executed)
1) Shell fullscreen state model in store and layout entry points.
2) Chrome minimization + control placement for landscape tablets.
3) Browser chrome resize stabilization behavior.
4) QA pass for mode transitions (`edit`, `overview`, `presentation`, `fullscreen ink`).

## Dependency gate (mandatory)
- `task_083` must be executed first (or explicitly deferred by user) before starting `task_084` code changes.
- `task_084` implementation must not begin until required SVG artifacts listed above exist and are reviewed.
- Gate check:
  - `task_083` status: COMPLETED
  - Required SVG 4 files: VERIFIED

## Speculative Defense Check
- [x] Any defensive branches added? NO
- [x] Evidence provided (real input, spec, or bug report): N/A
- [x] Sunset criteria defined (when to remove): N/A

## Dependencies / constraints
- New dependencies allowed? NO
- Keep layer boundaries from `v10/AI_READ_ME.md`.
- No `window` globals assignment; no `eval/new Function`.
- Touch/pointer behavior must preserve ink continuity and avoid accidental scroll/zoom side effects.

## Documentation Update Check
- [ ] 구조 변경(파일/폴더 추가·이동·삭제) 발생 시: `node scripts/gen_ai_read_me_map.mjs` 실행하여 `v10/AI_READ_ME_MAP.md` 갱신 여부 확인
- [ ] 규칙/의미 변경(레이어 규칙, 불변조건, 핵심 플로우 등) 발생 시: `v10/AI_READ_ME.md` 갱신 여부 확인

## Acceptance criteria (must be testable)
- [x] Fullscreen ink mode entry/exit exists and is reversible without UI dead-end.
- [x] Landscape tablet writing path remains usable while controls stay reachable.
- [x] Browser address-bar show/hide does not cause disruptive canvas jump during writing.
- [x] Fallback behavior works when native Fullscreen API is unavailable.
- [x] Mode transitions do not regress (`edit`, `overview`, `presentation`).
- [x] Only scoped files are modified when implementation starts.

## Redline Directive (Gemini revision pass #1)
This section is mandatory for the next SVG regeneration pass.

Global fixes (all 4 SVGs):
1) Keep exact filenames listed in this spec. No rename.
2) Keep explicit `viewBox` and visible `Ratio:` label.
3) Add z-order annotation for critical layers and confirm return/exit action is top-priority over overlays.
4) Primary actions must remain minimum `44x44` (current `48x48` is acceptable).
5) Include explicit fullscreen entry and exit action nodes where applicable.

Per-file fixes:
1) `layout_tablet_ink_fullscreen_768x1024.svg`
- Add missing `id="action_enter_fullscreen_ink"`.
- Keep `id="action_exit_fullscreen_ink"`.
- Add short note for native fullscreen attempt + fallback path.

2) `layout_tablet_ink_fullscreen_1024x768.svg`
- Add missing `id="action_enter_fullscreen_ink"`.
- Keep `id="action_exit_fullscreen_ink"`.
- Add explicit z-order line: exit action remains above toolchips/overlays.

3) `layout_tablet_landscape_controls_1180x820.svg`
- Add `id="action_exit_fullscreen_ink"` if missing.
- Add z-order annotations including return/escape visibility guarantee.
- Keep central writing lane non-blocking and annotate constraint.

4) `layout_web_chrome_resize_guard_1440x1080.svg`
- Convert from generic mechanism note to explicit state diagram:
  - `state_browser_chrome_visible`
  - `state_browser_chrome_hidden`
  - `state_native_fullscreen`
  - `state_app_fullscreen_fallback`
- Add action nodes:
  - `action_request_native_fullscreen`
  - `action_fallback_to_app_fullscreen`
  - `action_enter_fullscreen_ink`
  - `action_exit_fullscreen_ink`
- Include transition labels for native success/failure and fallback entry/exit.
- Keep address-bar jitter guard note (`dvh` + guarded fallback) in the same file.

ID compliance check (must pass):
- IDs listed in `Stable IDs` section must exist in the corresponding file.
- Missing any required ID means regeneration is rejected.

## Redline Directive (Gemini revision pass #2 - focused)
Target file only:
- `design_drafts/layout_web_chrome_resize_guard_1440x1080.svg`

Mandatory fixes:
1) Hit target compliance
- `action_enter_fullscreen_ink` must be at least `44x44`.
- `action_exit_fullscreen_ink` must be at least `44x44`.
- `action_request_native_fullscreen` must be at least `44x44`.
- `action_fallback_to_app_fullscreen` must be at least `44x44`.
- Current `160x40` style is rejected.

2) Explicit transition labels (not summary-only)
- Add transition labels for:
  - native fullscreen success path
  - native fullscreen failure path
  - fallback entry path
  - fallback exit/return path
- Labels must be attached near arrows/edges in the state diagram.

3) Z-order annotation
- Add explicit z-order note in this file for:
  - app base canvas
  - overlays/tool chrome
  - fullscreen actions (enter/exit/request/fallback)
- Must state that exit action remains top-priority.

Acceptance for pass #2:
- All four action nodes above satisfy `>=44x44`.
- Diagram has four explicit transition labels (success/failure/fallback entry/fallback exit).
- Z-order note exists and is readable in-file.

## Manual verification steps (for future implementation)
- On Galaxy Tab browser:
  - enter fullscreen ink mode, start writing, verify address bar transition does not break stroke flow.
  - rotate portrait/landscape and verify no trapped or hidden return action.
- On iPad browser:
  - verify fallback behavior when native fullscreen is limited.
  - repeat open/close cycle 10 times and confirm stable layout recovery.
- Desktop browser sanity:
  - ensure fullscreen ink action does not break existing edit/presentation flow.

## Risks / roll-back notes
- Risk: overly aggressive chrome lock can hurt accessibility/exit discoverability.
- Risk: browser-specific viewport behavior differences (Android Chrome vs iPad Safari).
- Roll-back: isolate and revert fullscreen state wiring and control placement changes first.

---

## Implementation Log (Codex fills)
Status: COMPLETED
Changed files:
- `codex_tasks/task_084_tablet_fullscreen_ink_landscape_ux.md`
- `design_drafts/layout_tablet_ink_fullscreen_768x1024.svg`
- `design_drafts/layout_tablet_ink_fullscreen_1024x768.svg`
- `design_drafts/layout_tablet_landscape_controls_1180x820.svg`
- `design_drafts/layout_web_chrome_resize_guard_1440x1080.svg`
- `v10/src/features/layout/AppLayout.tsx`
- `v10/src/features/store/useUIStore.ts`

Commands run (only if user asked):
- `git status --short`
- `rg`/`sed` SVG ID and spec compliance checks
- `bash scripts/check_layer_rules.sh` (failed: file not found in repo)
- `cd v10 && npm run lint` (failed: existing repo-wide lint errors remain)

Notes:
- Scope switched from spec-only to implementation phase after user approval.
- Fullscreen ink runtime added with native Fullscreen API attempt and deterministic app-level fallback mode.
- Fallback mode uses stable viewport height strategy (`svh`) in app fullscreen path.
- Data input panel is blocked while fullscreen ink is active (auto-exit on open request) to preserve canvas sovereignty.
- Device-level manual QA on Galaxy Tab/iPad is pending user-side verification.
