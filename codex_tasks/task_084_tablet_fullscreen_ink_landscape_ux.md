# Task 084: Tablet Fullscreen Ink + Landscape UX Stabilization (Spec Only)

Status: PENDING
Owner: Codex (spec)
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

Planned implementation scope (for future execution after approval):
- `v10/src/features/layout/AppLayout.tsx`
- `v10/src/features/layout/PlayerBar.tsx`
- `v10/src/features/layout/Prompter.tsx`
- `v10/src/features/store/useUIStore.ts`
- `v10/src/features/layout/DataInputPanel.tsx` (only if fullscreen mode action placement requires)

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
- [ ] Fullscreen ink mode entry/exit exists and is reversible without UI dead-end.
- [ ] Landscape tablet writing path remains usable while controls stay reachable.
- [ ] Browser address-bar show/hide does not cause disruptive canvas jump during writing.
- [ ] Fallback behavior works when native Fullscreen API is unavailable.
- [ ] Mode transitions do not regress (`edit`, `overview`, `presentation`).
- [ ] Only scoped files are modified when implementation starts.

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
Status: PENDING
Changed files:
- `codex_tasks/task_084_tablet_fullscreen_ink_landscape_ux.md`

Commands run (only if user asked):
- None

Notes:
- Spec-only task created. Implementation intentionally deferred.
