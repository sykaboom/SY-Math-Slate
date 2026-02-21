# Task 331: Mod Contracts + ModRegistry Scaffold

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-20

---

## Goal (Base Required)
- What to change:
  - Introduce core `mod` contracts and runtime registry skeleton per `v10/docs/architecture/ModeEngine.md`.
  - Add compatibility alias types so existing `mode` naming can compile during migration window.
- What must NOT change:
  - No runtime behavior change in toolbar/layout/windowing paths.
  - No command ID/payload contract changes.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/mod/contracts/index.ts` (new)
- `v10/src/core/mod/contracts/types.ts` (new)
- `v10/src/core/mod/host/registry.ts` (new)
- `v10/src/core/mod/host/index.ts` (new)
- `v10/src/core/mod/index.ts` (new barrel)
- `v10/src/features/chrome/toolbar/toolbarModePolicy.ts` (type alias bridge only)
- `v10/AI_READ_ME.md`
- `codex_tasks/task_331_mod_contracts_registry_scaffold.md`

Out of scope:
- Active routing logic (`ModManager`) implementation.
- Toolbar render behavior changes.
- Policy/store wiring changes.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO (default)
- Boundary rules:
  - `core/mod/*` must remain React-free and feature-free.
  - No direct imports from `features/layout` or `features/store` into `core/mod/*`.
  - Public entrypoint rule:
    - consumers import `@core/mod/contracts` or `@core/mod/host` only (no internal deep import).
- Compatibility:
  - Existing mode-typed call sites must compile via transitional alias mapping.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W2-mod-runtime-foundation
- Depends on tasks:
  - [`task_330`]
- Enables tasks:
  - [`task_332`]
- Parallel group:
  - G-mod-core
- Max parallel slots:
  - 6 (default)
- Verification stage for this task:
  - `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 5-6
- Files shared with other PENDING tasks:
  - `none`
- Cross-module dependency:
  - YES (`core` + one compatibility touch in `features/toolbar`)
- Parallelizable sub-units:
  - 1
- Estimated single-agent duration:
  - ~40min
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - NO
  - Foundation contract should land first to prevent downstream churn.
- Rationale:
  - This is contract SSOT work; single-writer consistency is critical.

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
  - `core/mod/contracts/*` defines canonical `Mod*` types (meta, capabilities, normalized events, contributions, lifecycle).
- [x] AC-2:
  - `core/mod/host/registry.ts` provides deterministic register/list/get APIs with duplicate-id guard.
- [x] AC-3:
  - Transitional compatibility alias exists (`mode` -> `mod`) without behavior changes.
- [x] AC-4:
  - Public barrel import path works (`@core/mod/contracts`, `@core/mod/host`), and deep-import path is not required by call sites.
- [x] AC-5:
  - `cd v10 && npm run lint` and `cd v10 && npm run build` pass.
- [x] AC-6:
  - `bash scripts/check_layer_rules.sh` passes.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - Inspect `core/mod/contracts/*`.
   - Expected result:
     - Contains contract sections defined in `ModeEngine.md`.
   - Covers: AC-1

2) Step:
   - Command / click path:
     - Inspect `core/mod/host/registry.ts` for duplicate ID handling.
   - Expected result:
     - Duplicate registration path is deterministic and explicit.
   - Covers: AC-2

3) Step:
   - Command / click path:
     - Build TypeScript after compatibility alias touch and barrel-only imports.
   - Expected result:
     - No runtime behavior diff; compile succeeds.
   - Covers: AC-3, AC-4, AC-5

4) Step:
   - Command / click path:
     - `bash scripts/check_layer_rules.sh`
   - Expected result:
     - PASS.
   - Covers: AC-6

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Over-eager alias replacement can accidentally imply behavior change.
- Roll-back:
  - Revert `core/mod/*` additions and compatibility alias edits.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (delegated chain: "맥스 오케스트레이션 모드. 위임모드 진행. 구현하라.")

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/mod/contracts/types.ts`
- `v10/src/core/mod/contracts/index.ts`
- `v10/src/core/mod/host/registry.ts`
- `v10/src/core/mod/host/index.ts`
- `v10/src/core/mod/index.ts`
- `v10/src/features/chrome/toolbar/toolbarModePolicy.ts`
- `codex_tasks/task_331_mod_contracts_registry_scaffold.md`

Commands run (only if user asked or required by spec):
- `bash scripts/check_layer_rules.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - PASS
- Script checks:
  - PASS (`check_layer_rules`)

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
- Verified canonical `Mod*` contracts and transitional `Mode*` aliases exist in `core/mod/contracts`.
- Verified deterministic duplicate-id guard and sorted listing in `core/mod/host/registry.ts`.
- Verified barrel import paths compile without deep imports.

Notes:
- Runtime behavior intentionally unchanged in this task.
