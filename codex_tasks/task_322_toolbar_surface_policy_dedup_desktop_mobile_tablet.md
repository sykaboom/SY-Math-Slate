# Task 322: Toolbar Surface Policy Dedup (Desktop / Mobile / Tablet)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-20

---

## Goal (Base Required)
- What to change:
  - Define deterministic surface policy so each toolbar action appears once per mode per viewport class (desktop/mobile/tablet), with no duplicate UI surfaces.
- What must NOT change:
  - Command semantics and existing shortcut bindings.
  - Current role-policy security behavior.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/features/chrome/toolbar/catalog/toolbarSurfacePolicy.ts` (new)
- `v10/src/features/chrome/toolbar/catalog/toolbarViewportProfile.ts` (new)
- `v10/src/features/chrome/toolbar/FloatingToolbar.tsx`
- `v10/src/features/chrome/toolbar/DrawModeTools.tsx`
- `v10/src/features/chrome/toolbar/PlaybackModeTools.tsx`
- `v10/src/features/chrome/toolbar/CanvasModeTools.tsx`
- `v10/src/features/chrome/toolbar/MorePanel.tsx`
- `v10/src/features/chrome/toolbar/ThumbZoneDock.tsx`

Out of scope:
- New actions.
- Theme/token refactor.
- Mod template packaging.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO (default)
- Boundary rules:
  - Surface policy must be pure data + selector logic.
  - UI components must render from policy result only.
- Compatibility:
  - Existing viewport breakpoints stay intact unless explicitly documented.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W3
- Depends on tasks:
  - `task_321`
- Enables tasks:
  - `task_327`
- Parallel group:
  - G3-toolbar-policy
- Max parallel slots:
  - 6 (default)
- Verification stage for this task:
  - `end` (full lint + full build + script checks)

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 8
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
  - ~50min
- Recommended mode:
  - DELEGATED
- Batch-eligible:
  - YES
  - Requires strict file ownership because toolbar files are shared.
- Rationale:
  - Dedup policy and renderer wiring can be split, but merge must be centralized.

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- Execution mode: DELEGATED
- Delegation chain scope:
  - `task_322`
- Assigned roles:
  - Spec-Writer: Codex
  - Spec-Reviewer: Codex
  - Implementer-A: policy/profile files
  - Implementer-B: mode tools consumption
  - Implementer-C: shell/More panel dedup wiring
  - Reviewer+Verifier: Codex
- File ownership lock plan:
  - Implementer-A owns `catalog/*`
  - Implementer-B owns `DrawModeTools.tsx`, `PlaybackModeTools.tsx`, `CanvasModeTools.tsx`
  - Implementer-C owns `FloatingToolbar.tsx`, `MorePanel.tsx`, `ThumbZoneDock.tsx`
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
    - After policy selectors compile
  - Agent close/reuse policy:
    - Close implementer when file set is merged
  - Heartbeat policy:
    - Soft ping threshold: 8m
    - Reassignment threshold: 14m
    - Long-running exceptions: viewport interaction tests
  - Reassignment safety rule:
    - Reassign only when no local diff and no active output after soft ping
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
- [ ] Structure changes (file/folder add/move/delete):
  - Run `node scripts/gen_ai_read_me_map.mjs`
  - Verify `v10/AI_READ_ME_MAP.md` update if needed

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: Each action ID maps to exactly one visible surface per mode+viewport profile.
- [ ] AC-2: More panel shows only overflow/secondary actions not already visible on primary strip.
- [ ] AC-3: Desktop/mobile/tablet profiles have deterministic action counts and no hidden critical controls.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `cd v10 && npm run lint`
   - Expected result:
     - No lint/type regressions.
   - Covers: AC-1, AC-2

2) Step:
   - Command / click path:
     - `cd v10 && npm run build`
   - Expected result:
     - Build passes.
   - Covers: AC-1, AC-2, AC-3

3) Step:
   - Command / click path:
     - Manual toolbar check at desktop/tablet/mobile widths for draw/playback/canvas.
   - Expected result:
     - No duplicate controls; overflow hint appears when needed.
   - Covers: AC-1, AC-2, AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Over-filtering can remove expected controls in one viewport.
- Roll-back:
  - Restore previous tool render blocks and disable policy selector path.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (delegated chain: user approved continuation in chat)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/features/chrome/toolbar/catalog/toolbarSurfacePolicy.ts`
- `v10/src/features/chrome/toolbar/catalog/toolbarViewportProfile.ts`
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
