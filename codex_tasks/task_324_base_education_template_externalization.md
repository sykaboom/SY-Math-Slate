# Task 324: Base Education Template Pack Extraction (No Cutover)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-20

---

## Goal (Base Required)
- What to change:
  - Extract current education-focused defaults into a dedicated `base-education` template pack under `src/mod/templates`.
- What must NOT change:
  - Runtime cutover of toolbar/store composition (handled in `task_327`).
  - Core engine startup, command bus dispatch semantics, and role-policy enforcement.
  - Current visible user behavior in app runtime for this task.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/mod/templates/base-education/manifest.ts` (new)
- `v10/src/mod/templates/base-education/modules.ts` (new)
- `v10/src/mod/templates/base-education/layout.ts` (new)
- `v10/src/mod/templates/base-education/theme.ts` (new, optional defaults only)
- `v10/src/mod/templates/index.ts`
- `v10/src/features/extensions/ui/coreTemplates.ts`

Out of scope:
- Runtime cutover wiring in toolbar/store/runtime shell (`task_327`).
- New feature additions.
- Viewer/live sharing protocol changes.
- Cross-app marketplace distribution.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO (default)
- Boundary rules:
  - This task only prepares pack artifacts and static registry listing.
  - Runtime composition switch remains disabled in this task.
- Compatibility:
  - Existing env flags and runtime visible behavior remain unchanged.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W5
- Depends on tasks:
  - `task_323`
- Enables tasks:
  - `task_327`
- Parallel group:
  - G5-template-cutover
- Max parallel slots:
  - 6 (default)
- Verification stage for this task:
  - `end` (full lint + full build + script checks)

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 6
- Files shared with other PENDING tasks:
  - `v10/src/mod/templates/index.ts`
  - `v10/src/features/extensions/ui/coreTemplates.ts`
- Cross-module dependency:
  - YES
- Parallelizable sub-units:
  - 1
- Estimated single-agent duration:
  - ~35min
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - YES
  - Safe to run as a prep step before runtime cutover.
- Rationale:
  - Extraction-only pass is small and should land independently to reduce regression blast radius.

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
  - Verify `v10/AI_READ_ME.md` update if needed

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: A `base-education` template pack exists with manifest/modules/layout/theme contracts.
- [ ] AC-2: `v10/src/mod/templates/index.ts` exports the pack in typed registry shape.
- [ ] AC-3: Runtime behavior remains unchanged (no cutover paths activated in this task).

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `cd v10 && npm run lint`
   - Expected result:
     - Lint/type pass.
   - Covers: AC-1, AC-2, AC-3

2) Step:
   - Command / click path:
     - `cd v10 && npm run build`
   - Expected result:
     - Build pass.
   - Covers: AC-1, AC-2, AC-3

3) Step:
   - Command / click path:
     - Manual run: draw/playback/canvas mode behavior compared with current baseline
   - Expected result:
     - No visible runtime change introduced by extraction-only task.
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Pack schema may drift from runtime expectations if contracts are underspecified.
- Roll-back:
  - Remove `base-education` exports and revert template pack files.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (delegated chain: user approved continuation in chat)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/mod/templates/base-education/manifest.ts`
- `v10/src/mod/templates/base-education/modules.ts`
- `v10/src/mod/templates/base-education/layout.ts`
- `v10/src/mod/templates/base-education/theme.ts`
- `v10/src/mod/templates/index.ts`

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
