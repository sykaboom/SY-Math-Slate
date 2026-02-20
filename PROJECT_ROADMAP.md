# Project Roadmap (Post-Refactor)

Status: ACTIVE SSOT

This document is the only roadmap-level execution source.
- Historical planning notes in other files are non-authoritative unless explicitly linked here.
- Detailed implementation contracts are tracked in approved `codex_tasks/task_*.md`.

This roadmap is the single source for **what to build next**. It assumes v10 refactors + AI_READ_ME are complete.

---

## Track A — UX Parity with Legacy (Highest Priority)
**Goal:** match legacy “live cursor + immediate feedback” feel.

1) **Break Anchor Feedback**
   - Cursor recognizes line/column/page breaks as “living positions”.
   - Show immediate feedback in canvas, not only data panel.
   - Dependency: current global-step model.

2) **Playback Visual Continuity**
   - Cursor stays aligned to actual visible start positions.
   - No “teleport” between steps.

3) **Realtime Layout Adjustments**
   - Allow break insertion while observing playback.
   - Layout adjustments are reflected immediately.

---

## Track B — Extensibility (Execution Layer)
**Goal:** enable appscript-like extensions on top of registry scaffolding.

1) **Permission Gate**
   - Enforce `permissions` scopes before any script/connector runs.
2) **Tool Registry + MCP Readiness**
   - Define tool registry entries and adapter boundaries.
   - Prepare MCP gateway for multi-model/tool connectivity.
3) **Trigger Dispatcher**
   - Emit `onStepStart`, `onExport`, etc.
4) **Script Runtime (Sandbox)**
   - Execute scripts with restricted APIs.

---

## Track C — Stability / QA
**Goal:** prevent regressions as complexity grows.

1) **Hydration Edge Cases**
   - Ensure doc-only payloads hydrate reliably.
2) **Performance Checkpoints**
   - AutoLayout and playback timing on low-power devices.
3) **Regression Snapshots**
   - Manual scenario list to re-test after each phase.
4) **Contract Regression Checks**
   - NormalizedContent/ToolResult compatibility checks on upgrades.

---

## Track D — ModPackage Runtime Migration (`task_336~349`)
**Goal:** complete single-axis runtime ownership (`ModPackage -> Mod`) and retire dual-axis compatibility paths safely.

Canonical architecture doc for this track:
- `v10/docs/architecture/ModEngine.md`

Phase mapping:

| Phase | Task Range | Purpose | Phase Boundary / Gate |
|---|---|---|---|
| Phase A: Foundation | `task_336~340` | establish package contract, registry/adapter bridge, active package state, and routing scaffold | package selectors/registry become runtime source; no behavior regression |
| Phase B: Input Integration | `task_341~342` | route pointer/wheel/keyboard through normalized mod routing with focus/host guards | input parity preserved with deterministic `handled/pass` fallback |
| Phase C: Policy Cutover | `task_343~344` | move toolbar activation and UI contribution filtering to package policy selectors | UI host remains placement authority; hardcoded mapping reduced |
| Phase D: Diagnostics + Guardrails | `task_345~347` | expose package diagnostics and enforce boundary/runtime checks in CI scripts | regression matrix + mod contract checks pass across target viewports |
| Phase E: Docs + Retirement | `task_348~349` | docs rollout (`ModEngine.md` canonical path) and final legacy dual-axis fallback removal | docs/reference sync complete before compatibility branch retirement |

Task purpose map:
- `task_336`: `ModPackage` contract + routing foundation baseline.
- `task_337`: package contracts and registry core.
- `task_338`: template-pack adapter to package registry.
- `task_339`: active package store/runtime bridge.
- `task_340`: mod input routing bridge scaffold.
- `task_341`: pointer/wheel routing integration.
- `task_342`: keyboard routing + focus guard integration.
- `task_343`: toolbar mapping to package activation policy.
- `task_344`: UI host contribution filter by package policy.
- `task_345`: mod studio package diagnostics and conflict surface.
- `task_346`: package boundary enforcement and CI checks.
- `task_347`: regression matrix and runtime check convergence.
- `task_348`: docs rollout + operator guide and canonical path sync.
- `task_349`: legacy dual-axis retirement (template registry and fallback de-dup).

Current phase boundary (as of 2026-02-20):
- Phase E entered; Task 348 handles docs/operator synchronization.
- Task 349 is the final retirement step after Task 348 closeout.

---

## Suggested Sequence
1) Track A-1 → A-2 → A-3  
2) Track B-1 → B-2 → B-3 → B-4  
3) Track C after each milestone
4) Track D Phase A → B → C → D → E (complete `task_348` before `task_349`)
