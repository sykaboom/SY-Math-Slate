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

## Suggested Sequence
1) Track A-1 → A-2 → A-3  
2) Track B-1 → B-2 → B-3 → B-4  
3) Track C after each milestone
