# Task 113: UI Extension Slot Registry (IoC)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-14

---

## Goal (Base Required)
- What to change:
  - Introduce UI slot registry and `ExtensionSlot` renderer.
  - Replace selected hardcoded layout insertion points with slot placeholders.
  - Bootstrap core slot registrations.
- What must NOT change:
  - Existing toolbar/layout behavior must remain when no external slot is registered.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/extensions/registry.ts`
- `v10/src/core/extensions/manifest.ts` (if slot names/types extended)
- `v10/src/features/extensions/ui/ExtensionSlot.tsx` (new)
- `v10/src/features/extensions/ui/registerCoreSlots.ts` (new)
- `v10/src/features/extensions/ui/ExtensionRuntimeBootstrap.tsx` (new)
- `v10/src/features/layout/AppLayout.tsx`
- `v10/src/features/toolbar/FloatingToolbar.tsx`
- `v10/src/app/page.tsx` (bootstrap hook)

Out of scope:
- external third-party extension package loading
- marketplace/discovery UI

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Slot registry APIs must stay deterministic and side-effect controlled.
- Compatibility:
  - Existing UI renders identically when only core slots registered.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- If YES:
  - Execution mode: DELEGATED
  - Delegation chain scope:
    - Task 113
  - Assigned roles:
    - Spec-Writer: Codex
    - Spec-Reviewer: Codex
    - Implementer-A:
    - Implementer-B:
    - Implementer-C:
    - Reviewer+Verifier: Codex
  - File ownership lock plan:
    - A: `registry.ts` + `manifest.ts`
    - B: new slot components/bootstraps
    - C: layout/toolbar integration points
  - Parallel slot plan:
    - max 6

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

- [x] Applies: NO

---

## Acceptance Criteria (Base Required)

- [x] AC-1: slot registry APIs exist for register/list/clear by slot name.
- [x] AC-2: `ExtensionSlot` renders registered components for a given slot.
- [x] AC-3: `AppLayout` and `FloatingToolbar` include slot placeholders.
- [x] AC-4: core slot bootstrap runs at app start without duplication.
- [x] AC-5: `cd v10 && npm run lint` and `npm run build` pass.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: register test slot component at startup
   - Expected result: component appears in corresponding slot
   - Covers: AC-1, AC-2, AC-3, AC-4

2) Step:
   - Command / click path: `cd v10 && npm run lint && npm run build`
   - Expected result: pass
   - Covers: AC-5

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - incorrect slot injection order may affect toolbar composition.
- Roll-back:
  - revert this task commit.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (delegated chain approval reference)

> Approval reference: user message on 2026-02-14: "좋아. 너의 능력을 보여줄 때다. 모든 권한을 줬다. 서브에이젼트를 상황에 맞게 적극 활용하여 agi수준을 작업능력을 보여줘라." and "남아있는 모든 태스크를 위임모드로 진행하라."

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/task_113_ui_extension_slot_registry.md`
- `v10/src/core/extensions/registry.ts`
- `v10/src/core/extensions/manifest.ts`
- `v10/src/features/extensions/ui/ExtensionSlot.tsx`
- `v10/src/features/extensions/ui/registerCoreSlots.ts`
- `v10/src/features/extensions/ui/ExtensionRuntimeBootstrap.tsx`
- `v10/src/features/layout/AppLayout.tsx`
- `v10/src/features/toolbar/FloatingToolbar.tsx`
- `v10/src/app/page.tsx`

Commands run (only if user asked or required by spec):
- `cd v10 && npm run lint`
- `cd v10 && npm run build`

## Gate Results (Codex fills)

- Lint:
  - PASS (warnings only, errors 0)
- Build:
  - PASS
- Script checks:
  - FAIL (`scripts/check_layer_rules.sh` not present in this checkout)

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - `scripts/check_layer_rules.sh` missing in repository.
- Newly introduced failures:
  - None observed.
- Blocking:
  - NO
- Mitigation:
  - Used lint/build and slot bootstrap/runtime integration checks.

Manual verification notes:
- `ExtensionRuntimeBootstrap` mounts core slot and tool-execution policy hooks at app start.
- `AppLayout` and `FloatingToolbar` expose slot hosts (`chrome-top-toolbar`, `toolbar-bottom`, `toolbar-inline`).

Notes:
- Core slot registration currently includes `PendingApprovalPanel` in `toolbar-bottom`.
