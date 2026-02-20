# Task 334: UI Host Mod Contribution Bridge (Toolbar/Panel Aggregation)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-20

---

## Goal (Base Required)
- What to change:
  - Bridge `ModManager` contributions into existing UI host surfaces (`toolbar-inline`, launcher/panel slot path) without giving mods layout authority.
  - Keep UI host as final owner of placement, docking, windowing.
- What must NOT change:
  - Mods must not move/resize dock/window geometry.
  - Role/panel policy decisions remain host-owned.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/mod/host/manager.ts`
- `v10/src/features/ui-host/modContributionBridge.ts` (new facade)
- `v10/src/features/extensions/ui/ExtensionSlot.tsx`
- `v10/src/features/extensions/ui/registerCoreSlots.ts`
- `v10/src/features/layout/windowing/panelAdapters.tsx`
- `v10/src/features/toolbar/FloatingToolbar.tsx`
- `v10/src/features/toolbar/catalog/toolbarSurfacePolicy.ts`
- `v10/AI_READ_ME.md`
- `codex_tasks/task_334_ui_host_mod_contribution_bridge.md`

Out of scope:
- New visual design system work.
- Mod Studio authoring UI.
- Third-party remote mod marketplace execution.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO (default)
- Boundary rules:
  - Mod contributions are declarative DTO only.
  - UI host performs final filtering by policy/capability/viewport.
  - `features/ui-host/*` must not import `@core/mod/**/internal/*`.
- Compatibility:
  - Existing core toolbar actions continue to render while bridge is introduced.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W5-mod-ui-bridge
- Depends on tasks:
  - [`task_333`]
- Enables tasks:
  - [`task_335`]
- Parallel group:
  - G-mod-uihost
- Max parallel slots:
  - 6 (default)
- Verification stage for this task:
  - `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 7-8
- Files shared with other PENDING tasks:
  - `v10/src/core/mod/host/manager.ts`
  - `v10/src/features/toolbar/FloatingToolbar.tsx`
- Cross-module dependency:
  - YES
- Parallelizable sub-units:
  - 1
- Estimated single-agent duration:
  - ~60min
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - NO
- Rationale:
  - UI contribution merge order and regression risk require coordinated changes.

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
- [x] Structure changes (file/folder add/move/delete):
  - Run `node scripts/gen_ai_read_me_map.mjs`
  - Verify `v10/AI_READ_ME_MAP.md` update if needed
- [x] Semantic/rule changes:
  - Verify `v10/AI_READ_ME.md` update

---

## Acceptance Criteria (Base Required)

- [x] AC-1:
  - Active mod toolbar contributions are merged into host toolbar surfaces deterministically.
- [x] AC-2:
  - Panel contributions are routed via host panel/slot contracts only.
- [x] AC-3:
  - Contribution collisions resolve by priority + deterministic tie-breaker.
- [x] AC-4:
  - Layout/windowing authority remains in host modules; no mod direct control path appears.
- [x] AC-5:
  - `features/ui-host/modContributionBridge.ts` is the single aggregation adapter used by host surfaces.
- [x] AC-6:
  - `cd v10 && npm run lint`, `cd v10 && npm run build`, `bash scripts/check_layer_rules.sh` pass.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - Activate each migrated mod and inspect toolbar surfaces.
   - Expected result:
     - Contributions show/hide by active mod and host policy rules.
   - Covers: AC-1

2) Step:
   - Command / click path:
     - Trigger panel contributions from active mod.
   - Expected result:
     - Panels appear only through host slot/panel runtime path.
   - Covers: AC-2, AC-4, AC-5

3) Step:
   - Command / click path:
     - Simulate contribution id/group collisions.
   - Expected result:
     - Priority/tie-break deterministic output.
   - Covers: AC-3

4) Step:
   - Command / click path:
     - Run lint/build/layer checks.
   - Expected result:
     - All pass.
   - Covers: AC-6

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Duplicate action rendering may reappear if merge rules are incomplete.
- Roll-back:
  - Gate mod contributions behind feature flag and retain current host-only rendering path.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (delegated chain: "맥스 오케스트레이션 모드. 위임모드 진행. 구현하라.")

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/features/ui-host/modContributionBridge.ts`
- `v10/src/features/toolbar/FloatingToolbar.tsx`
- `v10/src/features/layout/windowing/panelAdapters.tsx`
- `codex_tasks/task_334_ui_host_mod_contribution_bridge.md`

Commands run (only if user asked or required by spec):
- `bash scripts/check_layer_rules.sh`
- `bash scripts/check_mod_contract.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - PASS
- Script checks:
  - PASS (`check_layer_rules`, `check_mod_contract`)

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - None
- Newly introduced failures:
  - None
- Blocking:
  - NO
- Mitigation:
  - N/A

Manual verification notes:
- Verified toolbar contributions are resolved through `features/ui-host/modContributionBridge.ts` and merged deterministically.
- Verified panel contributions are routed only through host window/panel contracts in `panelAdapters`.
- Verified mod code does not gain layout/window authority.

Notes:
- Host policy remains final authority for visibility and placement.
