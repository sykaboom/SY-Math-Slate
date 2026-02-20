# Task 325: Mod Studio Template Authoring and Publish Flow

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-20

---

## Goal (Base Required)
- What to change:
  - Extend Mod Studio so templates are first-class authoring assets (create/edit/publish) aligned to folder-based template pack contracts.
- What must NOT change:
  - Existing policy/theme/module draft editing behavior for current users.
  - Existing publish safety checks and rollback snapshots.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/features/mod-studio/core/types.ts`
- `v10/src/features/store/useModStudioStore.ts`
- `v10/src/features/mod-studio/modules/ModuleStudioSection.tsx`
- `v10/src/features/mod-studio/layout/LayoutStudioSection.tsx`
- `v10/src/features/mod-studio/publish/publishStudioDraft.ts`
- `v10/src/features/mod-studio/publish/PublishStudioSection.tsx`
- `v10/src/features/mod-studio/io/ioStudio.ts`
- `v10/src/features/mod-studio/io/__fixtures__/studioDraftBundle.v1.json` (new)
- `v10/src/mod/templates/_contracts/templatePack.types.ts`

Out of scope:
- AI module generation quality improvements.
- Network sync/realtime collaboration.
- Marketplace distribution UI.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO (default)
- Boundary rules:
  - Mod Studio edits template metadata only through typed contracts.
  - Publish path must still route through existing manifest validation.
- Compatibility:
  - Existing Studio draft bundles can still be imported.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W6
- Depends on tasks:
  - `task_323`, `task_324`, `task_327`
- Enables tasks:
  - `task_326`
- Parallel group:
  - G6-mod-studio
- Max parallel slots:
  - 6 (default)
- Verification stage for this task:
  - `end` (full lint + full build + script checks)

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 8
- Files shared with other PENDING tasks:
  - `v10/src/features/store/useModStudioStore.ts`
  - `v10/src/features/mod-studio/publish/publishStudioDraft.ts`
- Cross-module dependency:
  - YES
- Parallelizable sub-units:
  - 2
- Estimated single-agent duration:
  - ~60min
- Recommended mode:
  - DELEGATED
- Batch-eligible:
  - YES
  - Store/type updates first, then UI/publish wiring.
- Rationale:
  - Contract + store evolution is separable from UI layer changes.

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- Execution mode: DELEGATED
- Delegation chain scope:
  - `task_325`
- Assigned roles:
  - Spec-Writer: Codex
  - Spec-Reviewer: Codex
  - Implementer-A: type/store contract updates
  - Implementer-B: Mod Studio section UI updates
  - Implementer-C: publish/io integration
  - Reviewer+Verifier: Codex
- File ownership lock plan:
  - Implementer-A owns `types.ts`, `useModStudioStore.ts`
  - Implementer-B owns `ModuleStudioSection.tsx`, `LayoutStudioSection.tsx`
  - Implementer-C owns `publishStudioDraft.ts`, `PublishStudioSection.tsx`, `ioStudio.ts`
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
    - Type/store pass and compile clean
  - Agent close/reuse policy:
    - Reuse one implementer slot for regression fixes
  - Heartbeat policy:
    - Soft ping threshold: 8m
    - Reassignment threshold: 14m
    - Long-running exceptions: publish migration checks
  - Reassignment safety rule:
    - Reassignment only after explicit file lock release
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

- [ ] AC-1: Mod Studio can author template metadata and persist it in draft/publish bundle.
- [ ] AC-2: Publish preflight validates template package fields before runtime registration.
- [ ] AC-3: Existing draft import/export remains backward-compatible.
- [ ] AC-4: Legacy draft fixture (`studioDraftBundle.v1.json`) imports successfully without manual schema edits.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `cd v10 && npm run lint`
   - Expected result:
     - Lint/type pass.
   - Covers: AC-1, AC-2, AC-3, AC-4

2) Step:
   - Command / click path:
     - `cd v10 && npm run build`
   - Expected result:
     - Build pass.
   - Covers: AC-1, AC-2, AC-3, AC-4

3) Step:
   - Command / click path:
     - Mod Studio: edit template fields → publish → export/import draft
   - Expected result:
     - Template values survive round-trip and runtime activation.
   - Covers: AC-1, AC-2, AC-3

4) Step:
   - Command / click path:
     - Mod Studio IO: import `v10/src/features/mod-studio/io/__fixtures__/studioDraftBundle.v1.json`
   - Expected result:
     - Import succeeds and migrated draft remains publishable.
   - Covers: AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Draft schema drift can break import of older studio bundles.
- Roll-back:
  - Keep migration fallback in io/publish and revert new template fields.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (delegated chain: user approved continuation in chat)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/features/mod-studio/core/types.ts`
- `v10/src/features/store/useModStudioStore.ts`
- `v10/src/features/mod-studio/modules/ModuleStudioSection.tsx`
- `v10/src/features/mod-studio/layout/LayoutStudioSection.tsx`
- `v10/src/features/mod-studio/publish/publishStudioDraft.ts`
- `v10/src/features/mod-studio/publish/PublishStudioSection.tsx`
- `v10/src/features/mod-studio/io/ioStudio.ts`
- `v10/src/features/mod-studio/io/__fixtures__/studioDraftBundle.v1.json`

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
