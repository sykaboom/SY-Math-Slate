# Task 312: Toolbar Placement Window Mode (Desktop/Tablet/Mobile)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-19

---

## Goal (Base Required)
- What to change:
  - Add edge snap behavior so windowed toolbar panels stick to any edge (`top/bottom/left/right`) like note apps.
  - Fix hidden-menu/clipped-menu behavior inside floating toolbar window host.
- What must NOT change:
  - Keep current default toolbar position behavior backward-compatible.
  - Do not break `WindowHost` clamp safety.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/features/layout/windowing/windowRuntime.ts`
- `v10/src/features/layout/windowing/panelAdapters.tsx`
- `v10/src/features/layout/windowing/WindowHost.tsx`
- `design_drafts/layout_toolbar_window_mode_v1.svg` (required artifact before implementation)

Out of scope:
- Full panel manager redesign
- New extension slot names

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Placement changes must be policy/state driven, not hardcoded viewport if-chains in multiple files.
  - Keep write-path through command bus.
- Compatibility:
  - Existing `setToolbarDock` command remains valid and unaffected.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-TBAR-PH2-C
- Depends on tasks:
  - [`task_310`]
- Enables tasks:
  - `task_311`
- Parallel group:
  - G3-placement
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `mid`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 3~4
- Files shared with other PENDING tasks:
  - none
- Cross-module dependency:
  - YES
- Parallelizable sub-units:
  - 1
- Estimated single-agent duration:
  - ~35min
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - NO
  - If YES, ordering/file-lock constraints.
- Rationale:
  - Window runtime + panel shell overflow behavior is tight-coupled and safer as single-owner patch.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: YES
- If YES, fill all items:
  - [x] SVG path in `design_drafts/`
  - [x] SVG has explicit `viewBox` (width / height / ratio)
  - [x] Tablet viewport checks considered:
    - 768x1024 / 820x1180 / 1024x768 / 1180x820
  - [x] Numeric redlines recorded in spec
  - [x] Codex verified SVG exists before implementation

Numeric redlines:
- Docked container bottom inset:
  - Mobile/tablet with safe area: `env(safe-area-inset-bottom) + 8px`
- Windowed toolbar default size:
  - Width: clamp `320 ~ 1120`
  - Height: clamp `112 ~ 180`
- Windowed clamp padding: `16px` all sides
- Launcher anchor remains reachable in all four target tablet viewports.

---

## Optional Block B — Delegated Execution

- [x] Applies: NO
- Execution mode: MANUAL

---

## Optional Block C — Hotfix Exception

- [x] Applies: NO

---

## Optional Block D — Speculative Defense Check

- [x] Applies: YES
- Evidence (real input, spec, or bug report):
  - Toolbar 캔버스 가림/재배치 불가 이슈(#8) 지속.
- Sunset criteria:
  - Window mode placement 안정화 후 dock-only fallback code 제거.

---

## Optional Block E — Documentation Update Check

- [x] Applies: YES
- [ ] Structure changes (file/folder add/move/delete):
  - Run `node scripts/gen_ai_read_me_map.mjs`
  - Verify `v10/AI_READ_ME_MAP.md` update if needed
- [x] Semantic/rule changes:
  - Verify `v10/AI_READ_ME.md` update if needed

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: Toolbar placement supports `docked` and `windowed` mode via state/command.
- [ ] AC-2: Windowed toolbar panel dragging snaps to `top/bottom/left/right` edges within threshold.
- [ ] AC-3: Toolbar menus/popovers are not clipped/hidden by window host shell overflow.
- [ ] AC-4: `scripts/check_layer_rules.sh` pass.
- [ ] AC-5: `cd v10 && npm run lint && npm run build` pass.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: desktop(1440), tablet(820x1180), mobile(390x844)에서 windowed toolbar panel 드래그
   - Expected result: 상/하/좌/우 edge 근처에서 스냅 고정
   - Covers: AC-1, AC-2

2) Step:
   - Command / click path: 창 닫기 후 launcher로 재오픈
   - Expected result: 복구 가능, unreachable 상태 없음
   - Covers: AC-2

3) Step:
   - Command / click path: floating toolbar 내 More/Popover 메뉴 열기
   - Expected result: 패널/메뉴 잘림(clip) 없음
   - Covers: AC-3

4) Step:
   - Command / click path: `scripts/check_layer_rules.sh && cd v10 && npm run lint && npm run build`
   - Expected result: 통과
   - Covers: AC-4, AC-5

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - WindowHost와 toolbar 상태 불일치 시 패널 유실 체감 가능.
- Roll-back:
  - `git revert <commit>` + `docked-only` path 복원.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/features/layout/windowing/windowRuntime.ts`
- `v10/src/features/layout/windowing/panelAdapters.tsx`
- `design_drafts/layout_toolbar_window_mode_v1.svg`

Commands run (only if user asked or required by spec):
- `scripts/check_layer_rules.sh`
- `scripts/check_toolbar_contract.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - PASS
- Script checks:
  - PASS

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - ...
- Newly introduced failures:
  - ...
- Blocking:
  - YES | NO
- Mitigation:
  - ...

Manual verification notes:
- Window runtime clamp path now includes edge snap threshold for top/bottom/left/right.
- Floating toolbar window shell path enables overflow visibility to avoid clipped menus.

Notes:
- ...
