# Task 081: Tablet Writer Mode SVG Blueprint (Gemini Design Pass)

Status: COMPLETED
Owner: Codex (spec) / Gemini (design artifacts)
Target: design_drafts/ (SVG only)
Date: 2026-02-07

## Goal
- What to change:
  - Define a tablet-first **modal workspace** structure where Canvas Mode and Input Mode are separated.
  - Produce SVG blueprints that make tablet writing surface dominant (canvas sovereignty) and make DataInput a dedicated drafting workspace.
  - Provide geometry and interaction-ready layout structure for Codex implementation in the next code task.
- What must NOT change:
  - No production code edits.
  - No runtime behavior implementation in this task.
  - SVG must be structure-spec artifacts only (not embedded into app code).

## Scope (Codex must touch ONLY these)
Touched files/directories:
- `codex_tasks/task_081_tablet_writer_mode_svg_blueprint.md`
- `design_drafts/` (new SVG files only)

Out of scope:
- Any `v10/src/**` production code edits
- Any CSS/TS/JS implementation
- Any dependency changes

## Design direction (locked)
- Tablet default interaction must prioritize writing continuity over panel visibility.
- Tablet (`<xl`) DataInput is **not sidebar**; it is a dedicated workspace overlay.
- Desktop (`xl+`) may keep right sidebar workflow.
- Use one primary model only for tablet in this task:
  - **Full-screen Drafting Room** (not bottom-sheet as primary)

## Design Artifacts (required)
- [x] Layout/structure changes included: YES
- [x] SVG path in `design_drafts/`: required
- [x] SVG includes `viewBox` with explicit width/height and ratio label
- [x] Codex must verify SVG file exists before implementation

## Required viewport matrix (non-negotiable)
All required tablet viewports must be represented explicitly:
- `768x1024` (tablet portrait baseline)
- `820x1180` (tablet portrait large)
- `1024x768` (tablet landscape baseline)
- `1180x820` (tablet landscape large)

Desktop reference viewport (for contrast only):
- `1440x1080`

## SVG deliverables (Gemini must produce)
1) `design_drafts/layout_writer_shell_768x1024.svg`
2) `design_drafts/layout_writer_shell_820x1180.svg`
3) `design_drafts/layout_writer_shell_1024x768.svg`
4) `design_drafts/layout_writer_shell_1180x820.svg`
5) `design_drafts/layout_drafting_room_768x1024.svg`
6) `design_drafts/layout_drafting_room_1024x768.svg`
7) `design_drafts/layout_mode_transition_map_1440x1080.svg`

Optional:
- `design_drafts/layout_writer_shell_1440x1080.svg` (desktop shell reference)

## Structural requirements (non-negotiable)
### A) Canvas sovereignty
- Measurement base must be **app viewport (`100dvh`)**, not full device screen.
- In Writer Shell (tablet viewports), canvas primary region must satisfy:
  - `MUST` (hard floor): portrait `>= 85%`, landscape `>= 80%` of app viewport after chrome
  - `TARGET` (north star): portrait `>= 90%`, landscape `>= 85%` of app viewport after chrome
- If `TARGET` is not met, SVG must include an exception note with:
  - measured ratio
  - reason for exception
  - UX tradeoff gained (e.g., touch accuracy or mis-tap reduction)
- Long top/bottom bars are disallowed as default tablet chrome.

### B) Modal workspace separation
- Explicitly model two workspace states:
  - `state_canvas_mode`
  - `state_input_mode`
- Input Mode must be full-screen drafting workspace on tablet.
- Input Mode must include a clear, always-reachable exit/return control.

### C) Touch target rhythm
- Primary touch targets must be annotated with minimum hit-size `44x44`.
- Annotate spacing rhythm tokens for interactive clusters (e.g., `gap-8`, `gap-12`).

### D) Stable IDs for implementation mapping (artifact-type matrix)
Use deterministic IDs exactly as written below.

Writer shell files (all 4):
- `layout_writer_shell_768x1024.svg`
- `layout_writer_shell_820x1180.svg`
- `layout_writer_shell_1024x768.svg`
- `layout_writer_shell_1180x820.svg`
Required IDs:
- `region_canvas_primary`
- `region_chrome_top`
- `region_chrome_bottom`
- `region_toolchips`
- `action_open_drafting_room`

Drafting room files (both):
- `layout_drafting_room_768x1024.svg`
- `layout_drafting_room_1024x768.svg`
Required IDs:
- `region_drafting_header`
- `region_drafting_content`
- `region_drafting_actions`
- `action_return_to_canvas`

Mode transition map:
- `layout_mode_transition_map_1440x1080.svg`
Required IDs:
- `state_canvas_mode`
- `state_input_mode`
- `action_open_drafting_room`
- `action_return_to_canvas`

### E) Layer and z-order annotations
- Must annotate z-order relationship for:
  - canvas
  - drafting workspace overlay
  - floating controls/tool chips
  - transient overlays

## DataInput-specific constraints (for later implementation)
- Drafting room must represent non-destructive editing intent:
  - raw input zone
  - block preview/edit zone
  - apply/return action zone
- Do not represent “raw edit destroys media/styles” as intended behavior.
- The SVG should mark this as a contract note: `non_destructive_sync_required`.

## Protocol compliance notes
- Follow `GEMINI_CODEX_PROTOCOL.md` SVG handoff rules.
- This task is design-phase only; implementation will be split into a later task (`task_082+`).

## Speculative Defense Check
- [x] Any defensive branches added? NO
- [x] Evidence provided (real input, spec, or bug report): N/A
- [x] Sunset criteria defined (when to remove): N/A

## Dependencies / constraints
- New dependencies allowed? NO
- Keep structure-only output: no decorative mood instructions.
- No ambiguous duplicate coordinates for the same semantic region.
- If constraints conflict, prefer tablet canvas sovereignty and annotate numeric tradeoff.

## Documentation Update Check
- [x] 구조 변경(파일/폴더 추가·이동·삭제) 발생 시: `node scripts/gen_ai_read_me_map.mjs` 실행하여 `v10/AI_READ_ME_MAP.md` 갱신 여부 확인 (해당 없음: v10 구조 변경 없음)
- [x] 규칙/의미 변경(레이어 규칙, 불변조건, 핵심 플로우 등) 발생 시: `v10/AI_READ_ME.md` 갱신 여부 확인 (해당 없음: 코드 규칙 변경 없음)

## Acceptance criteria (must be testable)
- [x] Required SVG files are present with exact naming.
- [x] Each SVG contains `viewBox`, ratio label, stable IDs, and layer annotations.
- [x] Tablet writer shells satisfy `MUST` floors (portrait >=85%, landscape >=80% on app viewport).
- [x] `TARGET` values (portrait >=90%, landscape >=85%) are met or exception notes are documented.
- [x] Mode separation is explicit (`state_canvas_mode` / `state_input_mode`).
- [x] Drafting room SVGs include non-destructive sync contract note.
- [x] No production code files are modified.

## Redline Directive (Gemini revision pass #1)
This section is mandatory for the next regeneration pass.

Global fixes (all 7 SVGs):
1) Keep exact filenames listed in this spec. No rename.
2) Keep explicit `viewBox` dimensions and add a visible ratio label text line (`Ratio: ...`).
3) Add z-order annotation text for all structural layers relevant to the file.
4) Primary interactive controls must be minimum `44x44`.
5) Use only valid SVG attributes (remove invalid properties like `stroke-bottom`).

Per-file fixes:
1) `layout_writer_shell_768x1024.svg`
- Add `id="region_chrome_bottom"` (if floating controls are used, define a bottom chrome region explicitly, even if slim).
- Keep `action_open_drafting_room` but increase hit target from `32x32` to `44x44` minimum.

2) `layout_writer_shell_820x1180.svg`
- Add `id="region_chrome_bottom"`.
- Add z-order annotation block (`canvas`, `chrome`, `toolchips`, `transient overlays`).
- Add touch-target annotation (`44x44`).
- Increase `action_open_drafting_room` to `44x44` minimum.

3) `layout_writer_shell_1024x768.svg`
- Add `id="region_chrome_bottom"`.
- Add missing `id="action_open_drafting_room"`.
- Add z-order annotation block.
- Add touch-target annotation (`44x44`).

4) `layout_writer_shell_1180x820.svg`
- Add `id="region_chrome_bottom"`.
- Add missing `id="action_open_drafting_room"`.
- Add z-order annotation block.
- Add touch-target annotation (`44x44`).

5) `layout_drafting_room_768x1024.svg`
- Keep `CONTRACT: non_destructive_sync_required`.
- Increase `action_return_to_canvas` from `40x40` to `44x44` minimum.
- Replace invalid `stroke-bottom` usage with valid SVG stroke treatment.
- Add explicit layer ordering notes for drafting overlay / actions / transient overlay.

6) `layout_drafting_room_1024x768.svg`
- Add ratio label text line (`Ratio: 4:3 ...`).
- Add `CONTRACT: non_destructive_sync_required`.
- Increase `action_return_to_canvas` to `44x44` minimum.
- Add z-order annotation block.

7) `layout_mode_transition_map_1440x1080.svg`
- Add `id="state_canvas_mode"` and `id="state_input_mode"` on the state containers.
- Rename `id="trigger_open"` to `id="action_open_drafting_room"`.
- Add `id="action_return_to_canvas"` on the return control in input state.
- Add ratio label text line and z-order annotation notes.

ID compliance check (must pass):
- Writer shell files: IDs in section `D` must all exist.
- Drafting room files: IDs in section `D` must all exist.
- Transition map: IDs in section `D` must all exist.

## Manual verification steps (since no automated tests)
- Open each generated SVG and verify:
  - exact viewport sizing in `viewBox`
  - required stable IDs exist
  - z-order/layer annotations exist
  - canvas dominance percentages are annotated against app viewport (`100dvh`) and numerically consistent
  - any `TARGET` miss includes exception note (ratio, reason, UX tradeoff)
- Confirm `git status` shows only `codex_tasks/` and `design_drafts/` changes for this task.

## Risks / roll-back notes
- Risk: Over-detailed visual styling pollutes structural spec quality.
- Risk: Multiple layout directions in one file can make implementation ambiguous.
- Roll-back: delete generated SVGs and regenerate from this locked spec.

---

## Gemini prompt (copy-ready)
"""
Read `codex_tasks/task_081_tablet_writer_mode_svg_blueprint.md` and generate the required SVG blueprint pack under `design_drafts/`.
Use structure-only output with explicit geometry, stable IDs, layer annotations, and tablet canvas-dominance targets.
Do not edit production code.
"""

---

## Implementation Log (Codex fills)
Status: COMPLETED
Changed files:
- `codex_tasks/task_081_tablet_writer_mode_svg_blueprint.md`
- `design_drafts/layout_writer_shell_768x1024.svg`
- `design_drafts/layout_writer_shell_820x1180.svg`
- `design_drafts/layout_writer_shell_1024x768.svg`
- `design_drafts/layout_writer_shell_1180x820.svg`
- `design_drafts/layout_drafting_room_768x1024.svg`
- `design_drafts/layout_drafting_room_1024x768.svg`
- `design_drafts/layout_mode_transition_map_1440x1080.svg`

Commands run (only if user asked):
- `sed -n` (spec/SVG inspection)
- `rg` (ID/annotation/constraint checks)
- `apply_patch` (Codex redline completion patch)

Notes:
- Gemini generated SVG pack and Codex applied final redline-normalization patch.
- Manual verification completed against task acceptance criteria.
- No production code files were modified.
