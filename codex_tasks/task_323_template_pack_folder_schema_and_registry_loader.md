# Task 323: Template Pack Folder Schema and Registry Loader

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-20

---

## Goal (Base Required)
- What to change:
  - Introduce a folder-based template pack contract so templates can be inserted as isolated packages.
- What must NOT change:
  - Existing plugin manifest validation (`manifestVersion: 1`) and command bus contract.
  - Existing runtime behavior when no external template pack is present.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/mod/templates/_contracts/templatePack.types.ts` (new)
- `v10/src/mod/templates/_contracts/templatePack.guards.ts` (new)
- `v10/src/mod/templates/index.ts` (new)
- `v10/src/mod/runtime/templatePackRegistry.ts` (new)
- `v10/src/features/platform/extensions/ui/coreTemplates.ts`
- `v10/src/features/platform/extensions/ui/registerCoreSlots.ts`
- `v10/AI_READ_ME.md`
- `v10/AI_READ_ME_MAP.md` (if structure update generated)

Out of scope:
- Mod Studio authoring UI.
- Toolbar UX redesign.
- Network marketplace delivery.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO (default)
- Boundary rules:
  - Template pack schema must be typed and guard-validated.
  - Loader must not execute arbitrary code or dynamic eval.
- Compatibility:
  - Core fallback templates still load if registry is empty.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W4
- Depends on tasks:
  - `task_320`
- Enables tasks:
  - `task_324`, `task_327`, `task_325`, `task_326`
- Parallel group:
  - G4-template-runtime
- Max parallel slots:
  - 6 (default)
- Verification stage for this task:
  - `end` (full lint + full build + script checks)

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 8
- Files shared with other PENDING tasks:
  - `v10/src/features/platform/extensions/ui/coreTemplates.ts`
  - `v10/src/features/platform/extensions/ui/registerCoreSlots.ts`
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
  - Contracts and registry can run first; slot wiring second.
- Rationale:
  - Clear split between contract/registry implementation and runtime hook-in.

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- Execution mode: DELEGATED
- Delegation chain scope:
  - `task_323`
- Assigned roles:
  - Spec-Writer: Codex
  - Spec-Reviewer: Codex
  - Implementer-A: template pack contracts
  - Implementer-B: registry loader
  - Implementer-C: slot integration
  - Reviewer+Verifier: Codex
- File ownership lock plan:
  - Implementer-A owns `v10/src/mod/templates/_contracts/*`
  - Implementer-B owns `v10/src/mod/runtime/templatePackRegistry.ts`, `v10/src/mod/templates/index.ts`
  - Implementer-C owns `coreTemplates.ts` and `registerCoreSlots.ts`
- Parallel slot plan:
  - max 3 active slots
- Scheduler plan (required in delegated mode):
  - Slot allocation mode:
    - DYNAMIC
  - Slot priority rule (DYNAMIC only):
    - shortest-job-first
  - Requested orchestration mode:
    - max orchestration mode on
  - Initial slot split:
    - 2 executors + 1 verifier
  - Ready-queue refill trigger:
    - Registry compile success
  - Agent close/reuse policy:
    - Close when file lock released and lint pass completed for owned scope
  - Heartbeat policy:
    - Soft ping threshold: 8m
    - Reassignment threshold: 14m
    - Long-running exceptions: type guard hardening
  - Reassignment safety rule:
    - No reassignment with active diff churn
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
- [x] Structure changes (file/folder add/move/delete):
  - Run `node scripts/gen_ai_read_me_map.mjs`
  - Verify `v10/AI_READ_ME_MAP.md` update if needed
- [x] Semantic/rule changes:
  - Verify `v10/AI_READ_ME.md` update if needed

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: A folder-based template pack schema exists with strict guard validation.
- [ ] AC-2: Runtime registry can list active template packs and expose them to slot/template registration flow.
- [ ] AC-3: Core runtime boots safely with or without additional template packs.

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
     - Boot app with default env; check slot registration still works.
   - Expected result:
     - No runtime crash and current default controls still appear.
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Registry misconfiguration could prevent template contributions from loading.
- Roll-back:
  - Disable registry path and fall back to static core template list.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (delegated chain: user approved continuation in chat)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/mod/templates/_contracts/templatePack.types.ts`
- `v10/src/mod/templates/_contracts/templatePack.guards.ts`
- `v10/src/mod/templates/index.ts`
- `v10/src/mod/runtime/templatePackRegistry.ts`
- `v10/src/features/platform/extensions/ui/coreTemplates.ts`
- `v10/src/features/platform/extensions/ui/registerCoreSlots.ts`
- `v10/AI_READ_ME_MAP.md`

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
