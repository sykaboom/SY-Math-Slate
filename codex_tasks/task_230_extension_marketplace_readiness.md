# Task 230: Extension Marketplace Readiness

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-16

---

## Goal (Base Required)
- What to change:
  - Add extension marketplace readiness contract, catalog API, and consumer hook.
  - Add readiness guard checks for RC-level discoverability and compatibility metadata.
- What must NOT change:
  - Existing extension runtime loading path must remain compatible.
  - No dependency additions.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_230_extension_marketplace_readiness.md`
- `v10/src/core/contracts/extensionMarketplace.ts` (new)
- `v10/src/core/extensions/marketplaceCatalog.ts` (new)
- `v10/src/app/api/extensions/marketplace/route.ts` (new)
- `v10/src/features/extensions/marketplace/useMarketplaceCatalog.ts` (new)
- `v10/src/features/extensions/marketplace/index.ts` (new)
- `scripts/check_v10_marketplace_readiness.sh` (new)
- `v10/tests/marketplace_readiness.mjs` (new)
- `codex_tasks/workflow/roadmap_70spec_local_ai_mesh_task_matrix.csv`

Out of scope:
- Payment/billing workflows
- Creator payout and legal policy flows
- Visual marketplace frontend

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Marketplace contract validation must be fail-closed.
- Compatibility:
  - Route must return deterministic JSON schema for clients.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W10
- Depends on tasks:
  - [`task_228`, `task_229`]
- Enables tasks:
  - []
- Parallel group:
  - G10-growth
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `end`

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- If YES:
  - Execution mode: DELEGATED
  - Delegation chain scope:
    - task_228~230
  - Assigned roles:
    - Spec-Writer: Codex
    - Spec-Reviewer: Codex
    - Implementer-A: Codex
    - Implementer-B: Codex
    - Implementer-C: Codex
    - Reviewer+Verifier: Codex
  - File ownership lock plan:
    - marketplace contracts/catalog/api/hook owned by this task.
  - Parallel slot plan:
    - sequential

If NO:
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
- If YES:
  - [x] Structure changes (file/folder add/move/delete):
    - Run `node scripts/gen_ai_read_me_map.mjs`
    - Verify `v10/AI_READ_ME_MAP.md` update if needed
  - [x] Semantic/rule changes:
    - Verify `v10/AI_READ_ME.md` update if needed

---

## Acceptance Criteria (Base Required)

- [x] AC-1: Marketplace contract validator rejects invalid catalog entries fail-closed.
- [x] AC-2: API route `/api/extensions/marketplace` returns validated deterministic catalog payload.
- [x] AC-3: Consumer hook fetches catalog safely and exposes typed result.
- [x] AC-4: W10 matrix rows 228/229/230 are marked COMPLETED.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: `node v10/tests/marketplace_readiness.mjs`
   - Expected result: PASS.
   - Covers: AC-1, AC-2

2) Step:
   - Command / click path: `scripts/check_v10_marketplace_readiness.sh`
   - Expected result: PASS.
   - Covers: AC-1, AC-2, AC-3

3) Step:
   - Command / click path: inspect matrix rows `228~230`.
   - Expected result: all `COMPLETED`.
   - Covers: AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Catalog schema drift between route and client hook.
- Roll-back:
  - Revert marketplace contract and route while keeping extension runtime unchanged.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - User quote: "실행해."

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/task_230_extension_marketplace_readiness.md`
- `v10/src/core/contracts/extensionMarketplace.ts`
- `v10/src/core/extensions/marketplaceCatalog.ts`
- `v10/src/app/api/extensions/marketplace/route.ts`
- `v10/src/features/extensions/marketplace/useMarketplaceCatalog.ts`
- `v10/src/features/extensions/marketplace/resolveMarketplaceCatalog.ts`
- `v10/src/features/extensions/marketplace/index.ts`
- `scripts/check_v10_marketplace_readiness.sh`
- `v10/tests/marketplace_readiness.mjs`
- `codex_tasks/workflow/roadmap_70spec_local_ai_mesh_task_matrix.csv`

Commands run (only if user asked or required by spec):
- `node v10/tests/marketplace_readiness.mjs`
- `scripts/check_v10_marketplace_readiness.sh`
- `VERIFY_STAGE=end bash scripts/run_repo_verifications.sh`

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - PASS
- Script checks:
  - PASS

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - N/A
- Newly introduced failures:
  - N/A
- Blocking:
  - NO
- Mitigation:
  - N/A

Manual verification notes:
- marketplace readiness script and full repo end-stage verification passed.
- API route returns validated catalog through feature-layer resolver to satisfy layer constraints.
- matrix rows `228~230` now set to `COMPLETED`.

Notes:
- layer rule (`app -> features`) respected by introducing `resolveMarketplaceCatalog` feature bridge.
