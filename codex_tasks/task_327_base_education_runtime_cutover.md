# Task 327: Base Education Runtime Cutover

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-20

---

## Goal (Base Required)
- What to change:
  - Cut over runtime composition so base education behavior is sourced from template-pack runtime path instead of hardcoded core toolbar composition.
- What must NOT change:
  - User-visible baseline behavior (draw/playback/canvas controls and policy gating).
  - Command bus IDs and role-policy security invariants.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/features/platform/extensions/ui/coreTemplates.ts`
- `v10/src/features/platform/extensions/ui/registerCoreSlots.ts`
- `v10/src/features/chrome/toolbar/FloatingToolbar.tsx`
- `v10/src/features/chrome/toolbar/DrawModeTools.tsx`
- `v10/src/features/chrome/toolbar/PlaybackModeTools.tsx`
- `v10/src/features/chrome/toolbar/CanvasModeTools.tsx`
- `v10/src/features/chrome/toolbar/MorePanel.tsx`
- `v10/src/features/platform/store/useModStudioStore.ts`

Out of scope:
- New actions or UX redesign.
- Mod Studio authoring workflow changes.
- Live/viewer protocol changes.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO (default)
- Boundary rules:
  - Runtime composition should read from template registry and boundary contract.
  - Core shell must keep only fixed engine surfaces defined in `task_320`.
- Compatibility:
  - Existing env flags and policy gates remain effective.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W5.5
- Depends on tasks:
  - `task_322`, `task_323`, `task_324`
- Enables tasks:
  - `task_325`
- Parallel group:
  - G5-cutover
- Max parallel slots:
  - 6 (default)
- Verification stage for this task:
  - `end` (full lint + full build + script checks)

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 8
- Files shared with other PENDING tasks:
  - `v10/src/features/platform/store/useModStudioStore.ts`
  - `v10/src/features/platform/extensions/ui/coreTemplates.ts`
- Cross-module dependency:
  - YES
- Parallelizable sub-units:
  - 2
- Estimated single-agent duration:
  - ~55min
- Recommended mode:
  - DELEGATED
- Batch-eligible:
  - YES
  - Template runtime wiring and toolbar renderer migration can be staged with lock ownership.
- Rationale:
  - Medium-high risk refactor with clear file partitioning and strong need for integration verification.

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- Execution mode: DELEGATED
- Delegation chain scope:
  - `task_327`
- Assigned roles:
  - Spec-Writer: Codex
  - Spec-Reviewer: Codex
  - Implementer-A: runtime template/slot wiring
  - Implementer-B: toolbar renderer migration
  - Implementer-C: store integration and regression fix
  - Reviewer+Verifier: Codex
- File ownership lock plan:
  - Implementer-A owns `coreTemplates.ts`, `registerCoreSlots.ts`
  - Implementer-B owns toolbar files
  - Implementer-C owns `useModStudioStore.ts` and integration glue
- Parallel slot plan:
  - max 3 active slots
- Scheduler plan (required in delegated mode):
  - Slot allocation mode:
    - DYNAMIC
  - Slot priority rule (DYNAMIC only):
    - critical-path-first
  - Requested orchestration mode:
    - max orchestration mode on
  - Initial slot split:
    - 2 executors + 1 verifier
  - Ready-queue refill trigger:
    - Template-runtime compile success
  - Agent close/reuse policy:
    - Close/reuse immediately after owned diff merge
  - Heartbeat policy:
    - Soft ping threshold: 8m
    - Reassignment threshold: 14m
    - Long-running exceptions: integration verification
  - Reassignment safety rule:
    - Reassign only after explicit file-lock handoff
- Delegated closeout metrics:
  - Peak active slots:
  - Average active slots:
  - Slot refill count:
  - Reassignment count:

---

## Optional Block C — Hotfix Exception

- [ ] Applies: NO

---

## Optional Block D — Speculative Defense Check

- [ ] Applies: NO

---

## Optional Block E — Documentation Update Check

- [x] Applies: YES
- [x] Semantic/rule changes:
  - Verify `v10/AI_READ_ME.md` update if needed

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: Base education runtime path uses template-pack registry as primary source.
- [ ] AC-2: Hardcoded non-engine composition paths in toolbar shell are removed or disabled behind legacy fallback.
- [ ] AC-3: Draw/playback/canvas baseline behavior remains equivalent in manual verification.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `cd v10 && npm run lint`
   - Expected result:
     - Lint/type pass.
   - Covers: AC-1, AC-2

2) Step:
   - Command / click path:
     - `cd v10 && npm run build`
   - Expected result:
     - Build pass.
   - Covers: AC-1, AC-2, AC-3

3) Step:
   - Command / click path:
     - Manual run for draw/playback/canvas with More panel and policy-gated views.
   - Expected result:
     - Equivalent controls and no duplicate surfaces/regressions.
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Missed wiring path can hide one control surface.
- Roll-back:
  - Re-enable legacy composition path and disable template runtime cutover flag/path.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (delegated chain: user approved continuation in chat)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/features/platform/extensions/ui/coreTemplates.ts`
- `v10/src/features/platform/extensions/ui/registerCoreSlots.ts`
- `v10/src/features/chrome/toolbar/FloatingToolbar.tsx`
- `v10/src/features/chrome/toolbar/DrawModeTools.tsx`
- `v10/src/features/chrome/toolbar/PlaybackModeTools.tsx`
- `v10/src/features/chrome/toolbar/CanvasModeTools.tsx`
- `v10/src/features/chrome/toolbar/MorePanel.tsx`

Commands run (only if user asked or required by spec):
- cd v10 && npm run lint
- cd v10 && npm run build
- bash scripts/check_core_mod_boundary.sh
- node scripts/check_toolbar_surface_uniqueness.mjs
- node scripts/check_template_pack_contract.mjs
- bash scripts/scan_guardrails.sh

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - PASS
- Script checks:
  - PASS (guardrail scan contains WARN-only pre-existing items)

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - None blocking; guardrail WARN items pre-existed and remain tracked
- Newly introduced failures:
  - None
- Blocking:
  - NO
- Mitigation:
  - N/A

Manual verification notes:
- Verified toolbar modes (draw/playback/canvas) and More panel still render without runtime errors.
- Verified template-pack registry bootstraps base-education pack without startup crash.

Notes:
- Closeout reflects implemented scope only; no out-of-scope behavior changes were introduced.
