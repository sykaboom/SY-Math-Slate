# Task 124: Core Manifest Shadow Injection

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Introduce core toolbar manifest definitions injected through plugin loader/extension slot in shadow mode.
  - Keep existing hardcoded toolbar path active during shadow comparison period.
- What must NOT change:
  - No immediate deletion of hardcoded controls.
  - No store removal in this task.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_124_core_manifest_shadow_injection.md`
- `v10/src/features/platform/extensions/ui/registerCoreSlots.ts`
- `v10/src/core/extensions/pluginLoader.ts`
- `v10/src/features/platform/extensions/ui/ExtensionRuntimeBootstrap.tsx`
- `v10/src/features/chrome/toolbar/FloatingToolbar.tsx`

Out of scope:
- Hardcoded toolbar removal
- useUIStore/useCanvasStore deletion

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Manifest payloads remain strict V1 and whitelist-validated.
  - Shadow mode must be deterministic and disabled by default for double-action hazards.
- Compatibility:
  - Existing toolbar remains primary control path during this task.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- If YES:
  - Execution mode: DELEGATED
  - Delegation chain scope:
    - task_124 only
  - Assigned roles:
    - Spec-Writer: Codex
    - Spec-Reviewer: Codex
    - Implementer-A: Codex
    - Implementer-B: Codex
    - Implementer-C: Codex
    - Reviewer+Verifier: Codex
  - File ownership lock plan:
    - Implementer-A: `registerCoreSlots.ts`
    - Implementer-B: `pluginLoader.ts`, `ExtensionRuntimeBootstrap.tsx`
    - Implementer-C: `FloatingToolbar.tsx`
  - Parallel slot plan:
    - max 6 active slots

If NO:
- Execution mode: MANUAL

---

## Optional Block C — Hotfix Exception

- [x] Applies: NO

---

## Optional Block D — Speculative Defense Check

- [x] Applies: NO

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

- [x] AC-1: Core manifest payloads for toolbar shadow controls are registered via runtime bootstrap path.
- [x] AC-2: Shadow controls resolve through `ExtensionSlot` declarative path and dispatch command IDs.
- [x] AC-3: Primary hardcoded controls remain active in this task.
- [x] AC-4: No plugin loader security regressions are introduced.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: initialize runtime and inspect registered manifests
   - Expected result: core shadow manifests registered
   - Covers: AC-1

2) Step:
   - Command / click path: trigger declarative controls in controlled mode
   - Expected result: commands dispatch correctly
   - Covers: AC-2

3) Step:
   - Command / click path: use existing toolbar controls
   - Expected result: unchanged behavior
   - Covers: AC-3

4) Step:
   - Command / click path: invalid manifest injection attempts
   - Expected result: deterministic rejection still works
   - Covers: AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Duplicate UI actions if shadow path is unintentionally fully enabled.
- Roll-back:
  - Disable core shadow manifest registration and revert bootstrap wiring.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (delegated chain approval reference: "좋아 모든 권한을 주겠다. 너를 오케스트라로 위임하여 작업완료를 명령한다.")

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- See task-scoped file list in this commit diff.

Commands run (only if user asked or required by spec):
- node scripts/gen_ai_read_me_map.mjs
- cd v10 && npm run lint
- cd v10 && npm run build
- bash scripts/run_repo_verifications.sh
- scripts/check_layer_rules.sh
- scripts/check_v10_migration_baseline.sh

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - PASS
- Script checks:
  - PASS

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - Lint warnings only (non-blocking, pre-existing).
- Newly introduced failures:
  - None observed.
- Blocking:
  - NO
- Mitigation:
  - N/A

Manual verification notes:
- Lint/build/repo verification scripts passed for the delegated chain.
- Command-bus migration, declarative shadow/cutover path, and UI store split scaffold were integrated without layer violations.

Notes:
- Cutover preparation task.
