# Task 133: Policy-as-Data Trust Boundary

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Introduce a centralized role policy module (roles, command permissions, UI visibility, approval routing policy).
  - Replace scattered role hardcoding with policy resolver calls in runtime decision points.
  - Enforce trust boundary + deny-by-default semantics for unknown role/action/surface.
- What must NOT change:
  - No new dependency install.
  - No behavior change for default `host` and `student` policy outputs vs current production behavior.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_133_policy_as_data_trust_boundary.md`
- `v10/src/core/config/rolePolicy.ts` (new)
- `v10/src/core/config/rolePolicyGuards.ts` (new)
- `v10/src/features/chrome/layout/AppLayout.tsx`
- `v10/src/features/platform/extensions/commandExecutionPolicy.ts`
- `v10/src/features/platform/extensions/toolExecutionPolicy.ts`
- `v10/src/features/platform/store/useLocalStore.ts` (only if role type widening is required)
- `v10/AI_READ_ME.md`

Out of scope:
- Full slot cutover of AppLayout regions (handled in Task 136).
- Full command-only migration of all UI write paths (handled in Task 135).

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Policy module must live under `core/config` and remain framework-agnostic.
  - Runtime decisions must call policy helpers instead of inline role literals where touched.
  - Validation failure must resolve to deterministic deny outcome.
- Compatibility:
  - Existing `host/student` runtime flows remain backward-compatible.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- If YES:
  - Execution mode: DELEGATED
  - Delegation chain scope:
    - task_133~138
  - Assigned roles:
    - Spec-Writer: Codex
    - Spec-Reviewer: Codex
    - Implementer-A: Codex
    - Implementer-B: Codex
    - Implementer-C: Codex
    - Reviewer+Verifier: Codex
  - File ownership lock plan:
    - Implementer-A: `v10/src/core/config/rolePolicy.ts`, `v10/src/core/config/rolePolicyGuards.ts`
    - Implementer-B: `v10/src/features/platform/extensions/commandExecutionPolicy.ts`, `v10/src/features/platform/extensions/toolExecutionPolicy.ts`
    - Implementer-C: `v10/src/features/chrome/layout/AppLayout.tsx`, `v10/AI_READ_ME.md`
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

- [x] AC-1: `rolePolicy` module exists and validates policy shape with manual guards; invalid or unknown inputs resolve to deny-by-default.
- [x] AC-2: Command/tool approval routing hooks consume centralized policy resolver instead of direct role branching.
- [x] AC-3: `AppLayout` visibility decisions for role-sensitive regions are resolved through policy helpers.
- [x] AC-4: `scripts/check_layer_rules.sh` and `cd v10 && npm run lint` pass.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: `rg -n "role ===|role !==" v10/src/features/chrome/layout/AppLayout.tsx`
   - Expected result: direct role literals are no longer used as primary decision logic in touched regions.
   - Covers: AC-3

2) Step:
   - Command / click path: `rg -n "configureCommandExecutionPolicyHooks|configureToolExecutionPolicyHooks" v10/src/features/platform/extensions`
   - Expected result: hooks route through policy helpers.
   - Covers: AC-2

3) Step:
   - Command / click path: `scripts/check_layer_rules.sh && cd v10 && npm run lint`
   - Expected result: both checks pass.
   - Covers: AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Incorrect deny defaults could hide required UI/actions.
- Roll-back:
  - Revert policy wiring in `AppLayout`/policy hooks and restore direct legacy branching.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/task_133_policy_as_data_trust_boundary.md`
- `v10/src/core/config/rolePolicy.ts`
- `v10/src/core/config/rolePolicyGuards.ts`
- `v10/src/features/platform/extensions/commandExecutionPolicy.ts`
- `v10/src/features/platform/extensions/toolExecutionPolicy.ts`
- `v10/src/features/chrome/layout/AppLayout.tsx`
- `v10/AI_READ_ME.md`
- `v10/AI_READ_ME_MAP.md`

Commands run (only if user asked or required by spec):
- scripts/check_layer_rules.sh
- cd v10 && npm run lint
- cd v10 && npm run build
- node scripts/gen_ai_read_me_map.mjs

## Gate Results (Codex fills)

- Lint:
  - PASS (2 pre-existing warnings in untouched files)
- Build:
  - PASS
- Script checks:
  - PASS

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - Lint warnings only (pre-existing, non-blocking) in compileAnimationPlan/ChalkActor.
- Newly introduced failures:
  - None observed.
- Blocking:
  - NO
- Mitigation:
  - N/A

Manual verification notes:
- Policy trust-boundary decisions were validated via static checks and role-policy helper wiring review.

Notes:
- Delegated execution completed for this task scope.
