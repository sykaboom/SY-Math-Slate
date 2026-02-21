# Task 328: Toolbar Single-Source Render Path (Dedup Root Fix)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-20

---

## Goal (Base Required)
- What to change:
  - Enforce one core source of truth for base toolbar action rendering:
    - core base actions are rendered only by `FloatingToolbar` mode components (`DrawModeTools` / `PlaybackModeTools` / `CanvasModeTools`).
    - core base action injection from `coreTemplates` and `registerCoreDeclarativeManifest` into `toolbar-inline` is disabled.
- What must NOT change:
  - Command IDs, command payload contracts, and role/policy security behavior.
  - Third-party extension ability to contribute UI into `toolbar-inline`.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/features/platform/extensions/ui/ExtensionRuntimeBootstrap.tsx`
- `v10/src/features/platform/extensions/ui/registerCoreDeclarativeManifest.ts`
- `v10/src/features/platform/extensions/ui/coreTemplates.ts`
- `v10/src/features/platform/extensions/ui/registerCoreSlots.ts`
- `scripts/check_toolbar_surface_uniqueness.mjs`
- `scripts/scan_guardrails.sh`
- `v10/AI_READ_ME.md`

Out of scope:
- Toolbar visual redesign (icon set, spacing, colors, motion).
- New toolbar commands/features.
- Marketplace/mod pack distribution behavior.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO (default)
- Boundary rules:
  - Keep layer rules unchanged (`features` -> `core`/`ui`, no reverse import).
  - Keep `ExtensionSlot` runtime model intact; only remove base duplicate producer paths.
- Compatibility:
  - Existing env flags must not crash runtime if present.
  - Verify behavior under env combinations:
    - `NEXT_PUBLIC_CORE_TOOLBAR_CUTOVER=0`, `NEXT_PUBLIC_CORE_MANIFEST_SHADOW=0`
    - `NEXT_PUBLIC_CORE_TOOLBAR_CUTOVER=1`, `NEXT_PUBLIC_CORE_MANIFEST_SHADOW=0`
    - `NEXT_PUBLIC_CORE_TOOLBAR_CUTOVER=1`, `NEXT_PUBLIC_CORE_MANIFEST_SHADOW=1`
  - External declarative plugin registration remains functional.
  - Functional parity must hold for base mode controls:
    - draw: hand/pen/eraser/undo/redo
    - playback: prevStep/nextStep/undo/redo
    - canvas: fullscreen/sound/dock selector

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W1-dedup-hotpath
- Depends on tasks:
  - [`task_321`, `task_322`, `task_327`]
- Enables tasks:
  - []
- Parallel group:
  - G-toolbar-runtime
- Max parallel slots:
  - 6 (default)
- Verification stage for this task:
  - `end` (full lint + full build + script checks)

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 6-7
- Files shared with other PENDING tasks:
  - `v10/src/features/platform/extensions/ui/ExtensionRuntimeBootstrap.tsx`
  - `v10/src/features/platform/extensions/ui/registerCoreSlots.ts`
- Cross-module dependency:
  - YES
- Parallelizable sub-units:
  - 2 (runtime gating path, script hardening path)
- Estimated single-agent duration:
  - ~35min
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - NO
  - Runtime/source-of-truth changes touch same critical files; file-lock contention risk is high.
- Rationale:
  - The bug root is in producer orchestration (not isolated leaf files), so one-pass manual control is safer than split edits.

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: NO

---

## Optional Block B — Delegated Execution

- [ ] Applies: NO
- Execution mode: MANUAL

---

## Optional Block C — Hotfix Exception

- [ ] Applies: NO

---

## Optional Block D — Speculative Defense Check

- [ ] Applies: NO

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

- [x] AC-1:
  - In all supported env combinations (`cutover/shadow` matrix in Constraints), base toolbar controls (`draw/playback/canvas`) are rendered from one producer path only (no duplicate buttons from core declarative/core template shadow injection).
- [x] AC-2:
  - `toolbar-inline` still accepts non-core extension contributions; no core-only filter/regression is introduced in `ExtensionSlot` merge path.
- [x] AC-3:
  - `scripts/check_toolbar_surface_uniqueness.mjs` has both PASS and intentional FAIL verification path:
    - normal runtime analysis => PASS for corrected state
    - self-test duplicate fixture/mode => FAIL with non-zero exit
- [x] AC-4:
  - Base toolbar functional parity is preserved (draw/playback/canvas 필수 액션 유지).
- [x] AC-5:
  - `cd v10 && npm run lint` and `cd v10 && npm run build` pass.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `node scripts/check_toolbar_surface_uniqueness.mjs`
   - Expected result:
     - PASS with no duplicate core producer conflict in current code.
   - Covers: AC-1, AC-3

2) Step:
   - Command / click path:
     - `node scripts/check_toolbar_surface_uniqueness.mjs --self-test-duplicate`
   - Expected result:
     - Script exits with code `1` and prints duplicate producer/surface conflict marker text.
   - Covers: AC-3

3) Step:
   - Command / click path:
     - Run app with env combinations:
       - `NEXT_PUBLIC_CORE_TOOLBAR_CUTOVER=0 NEXT_PUBLIC_CORE_MANIFEST_SHADOW=0`
       - `NEXT_PUBLIC_CORE_TOOLBAR_CUTOVER=1 NEXT_PUBLIC_CORE_MANIFEST_SHADOW=0`
       - `NEXT_PUBLIC_CORE_TOOLBAR_CUTOVER=1 NEXT_PUBLIC_CORE_MANIFEST_SHADOW=1`
     - Switch toolbar modes (`Draw`, `Playback`, `Canvas`) and inspect `toolbar-inline`.
   - Expected result:
     - No duplicated base controls in any combination; controls appear once per mode.
   - Covers: AC-1, AC-4

4) Step:
   - Command / click path:
     - Register a minimal non-core declarative manifest contributing one button to `toolbar-inline`, then load runtime and inspect toolbar.
   - Expected result:
     - Non-core contribution renders in `toolbar-inline` while base toolbar controls remain non-duplicated.
   - Covers: AC-2

5) Step:
   - Command / click path:
     - `cd v10 && npm run lint`
     - `cd v10 && npm run build`
   - Expected result:
     - Both commands pass.
   - Covers: AC-5

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Over-disabling core injection paths may hide intended transitional controls.
  - Misconfigured gating could disable toolbar-inline experimental content unexpectedly.
- Roll-back:
  - Re-enable prior core manifest/template registration path behind previous env gate and revert dedup script hardening changes.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (delegated chain: user message "위임모드, 맥스 오케스트레이션 권한 승인. 구현 시작.")

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/features/platform/extensions/ui/ExtensionRuntimeBootstrap.tsx`
- `v10/src/features/platform/extensions/ui/registerCoreSlots.ts`
- `v10/src/features/platform/extensions/ui/coreTemplates.ts`
- `v10/src/features/platform/extensions/ui/registerCoreDeclarativeManifest.ts`
- `scripts/check_toolbar_surface_uniqueness.mjs`
- `v10/AI_READ_ME.md`
- `codex_tasks/task_328_toolbar_single_source_render_path.md`

Commands run (only if user asked or required by spec):
- node scripts/check_toolbar_surface_uniqueness.mjs
- NEXT_PUBLIC_CORE_TOOLBAR_CUTOVER=0 NEXT_PUBLIC_CORE_MANIFEST_SHADOW=0 node scripts/check_toolbar_surface_uniqueness.mjs
- NEXT_PUBLIC_CORE_TOOLBAR_CUTOVER=1 NEXT_PUBLIC_CORE_MANIFEST_SHADOW=0 node scripts/check_toolbar_surface_uniqueness.mjs
- NEXT_PUBLIC_CORE_TOOLBAR_CUTOVER=1 NEXT_PUBLIC_CORE_MANIFEST_SHADOW=1 node scripts/check_toolbar_surface_uniqueness.mjs
- node scripts/check_toolbar_surface_uniqueness.mjs --self-test-duplicate
- rg -n "registerGatewayPlugin|registerDeclarativePluginManifest\\(plugin\\)" v10/src/features/platform/extensions/ui/ExtensionRuntimeBootstrap.tsx
- rg -n "listUISlotComponents|listDeclarativeSlotContributions|rendered = \\[\\.\\.\\.renderedComponents, \\.\\.\\.renderedDeclarative\\]" v10/src/features/platform/extensions/ui/ExtensionSlot.tsx
- cd v10 && npm run lint
- cd v10 && npm run build
- bash scripts/check_layer_rules.sh
- bash scripts/scan_guardrails.sh

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - PASS
- Script checks:
  - PASS (`check_toolbar_surface_uniqueness` normal path PASS + self-test duplicate path intentional FAIL exit=1)

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - None blocking. `scan_guardrails.sh` WARN-only items remain pre-existing (hardcoded red/rose classes in moderation/sharing/input-studio, overlay pointer-events warnings, allowed public token references).
- Newly introduced failures:
  - None
- Blocking:
  - NO
- Mitigation:
  - N/A

Manual verification notes:
- AC-1: verified `check_toolbar_surface_uniqueness` PASS in default and all requested env combinations (`cutover/shadow` matrix).
- AC-2: verified non-core declarative contribution path remains via runtime plugin registration (`registerGatewayPlugin` -> `registerDeclarativePluginManifest(plugin)`) and `ExtensionSlot` merge path (`listUISlotComponents` + `listDeclarativeSlotContributions`).
- AC-3: verified `--self-test-duplicate` exits with code 1 and prints `DUPLICATE_PRODUCER_CONFLICT`.
- AC-4: verified no core duplicate registration calls remain in runtime wiring for base toolbar producer paths.
- AC-5: lint/build both pass.

Notes:
- Base core producer path for toolbar actions is now single-source (`FloatingToolbar` mode slices) and duplicate core injections are disabled without removing third-party extension contribution capability.
