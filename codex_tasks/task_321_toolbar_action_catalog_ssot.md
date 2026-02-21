# Task 321: Toolbar Action Catalog SSOT

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-20

---

## Goal (Base Required)
- What to change:
  - Create a single toolbar action catalog as SSOT so icon/action definitions are not duplicated across mode components.
- What must NOT change:
  - Existing command IDs and behavior semantics.
  - Existing accessibility labels must remain available.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/features/chrome/toolbar/catalog/toolbarActionCatalog.ts` (new)
- `v10/src/features/chrome/toolbar/catalog/toolbarActionSelectors.ts` (new)
- `v10/src/features/chrome/toolbar/FloatingToolbar.tsx`
- `v10/src/features/chrome/toolbar/DrawModeTools.tsx`
- `v10/src/features/chrome/toolbar/PlaybackModeTools.tsx`
- `v10/src/features/chrome/toolbar/CanvasModeTools.tsx`
- `v10/src/features/chrome/toolbar/MorePanel.tsx`

Out of scope:
- Mode visual redesign.
- Docking/layout behavior changes.
- Mod Studio integration.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO (default)
- Boundary rules:
  - Catalog is data-only (no store mutation side effects).
  - Mode components render from selectors; they must not define parallel hardcoded action lists.
- Compatibility:
  - Existing keyboard shortcuts and command bus dispatch remain unchanged.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W2
- Depends on tasks:
  - `task_320`
- Enables tasks:
  - `task_322`, `task_324`
- Parallel group:
  - G2-toolbar-core
- Max parallel slots:
  - 6 (default)
- Verification stage for this task:
  - `end` (full lint + full build + script checks)

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 7
- Files shared with other PENDING tasks:
  - `v10/src/features/chrome/toolbar/FloatingToolbar.tsx`
  - `v10/src/features/chrome/toolbar/DrawModeTools.tsx`
  - `v10/src/features/chrome/toolbar/PlaybackModeTools.tsx`
  - `v10/src/features/chrome/toolbar/CanvasModeTools.tsx`
  - `v10/src/features/chrome/toolbar/MorePanel.tsx`
- Cross-module dependency:
  - YES
- Parallelizable sub-units:
  - 2
- Estimated single-agent duration:
  - ~45min
- Recommended mode:
  - DELEGATED
- Batch-eligible:
  - YES
  - Catalog file can be isolated first, then renderer updates with file locks.
- Rationale:
  - High-touch refactor across multiple toolbar files with clear split between catalog authoring and renderer migration.

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- Execution mode: DELEGATED
- Delegation chain scope:
  - `task_321`
- Assigned roles:
  - Spec-Writer: Codex
  - Spec-Reviewer: Codex
  - Implementer-A: catalog and selectors
  - Implementer-B: mode renderers
  - Implementer-C: More panel + integration pass
  - Reviewer+Verifier: Codex
- File ownership lock plan:
  - Implementer-A owns `catalog/*`
  - Implementer-B owns `DrawModeTools.tsx`, `PlaybackModeTools.tsx`, `CanvasModeTools.tsx`
  - Implementer-C owns `MorePanel.tsx`, `FloatingToolbar.tsx`
- Parallel slot plan:
  - max 3 active slots
- Scheduler plan (required in delegated mode):
  - Slot allocation mode:
    - DYNAMIC
  - Slot priority rule (DYNAMIC only):
    - file-conflict-avoidance
  - Requested orchestration mode:
    - max orchestration mode on
  - Initial slot split:
    - 2 executors + 1 reviewer
  - Ready-queue refill trigger:
    - After catalog/selectors compile pass
  - Agent close/reuse policy:
    - Close implementer when file lock released; reuse reviewer slot
  - Heartbeat policy:
    - Soft ping threshold: 8m
    - Reassignment threshold: 14m
    - Long-running exceptions: large TS compile edits
  - Reassignment safety rule:
    - Reassign only if no diff output after soft ping and no active command output
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

- [ ] Applies: NO

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: A single catalog defines toolbar actions with stable IDs, mode category, and surface policy.
- [ ] AC-2: Mode components and More panel consume selector output from catalog; duplicate hardcoded action registries are removed.
- [ ] AC-3: Runtime behavior remains backward-compatible (same command dispatch, same visible actions per current policy flags).

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `cd v10 && npm run lint`
   - Expected result:
     - No new lint/type errors.
   - Covers: AC-1, AC-2

2) Step:
   - Command / click path:
     - `cd v10 && npm run build`
   - Expected result:
     - Build success.
   - Covers: AC-1, AC-2, AC-3

3) Step:
   - Command / click path:
     - Open toolbar in draw/playback/canvas mode and open More panel
   - Expected result:
     - Action sets remain correct and no unexpected duplicates appear.
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Incorrect selector filtering can hide critical controls.
- Roll-back:
  - Revert to previous per-component action definitions.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (delegated chain: user approved continuation in chat)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/features/chrome/toolbar/catalog/toolbarActionCatalog.ts`
- `v10/src/features/chrome/toolbar/catalog/toolbarActionSelectors.ts`
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
