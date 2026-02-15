# Task 134: Policy Shadow Mode and Diff Telemetry

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Add shadow-mode evaluator that compares legacy branching outputs vs policy-as-data outputs.
  - Record deterministic mismatch telemetry in dev/debug mode without changing runtime behavior.
- What must NOT change:
  - No production behavior flip in this task.
  - No external telemetry service dependency.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_134_policy_shadow_mode_and_diff_telemetry.md`
- `v10/src/features/policy/policyShadow.ts` (new)
- `v10/src/features/layout/AppLayout.tsx`
- `v10/src/features/extensions/commandExecutionPolicy.ts`
- `v10/src/features/extensions/toolExecutionPolicy.ts`
- `v10/AI_READ_ME.md`

Out of scope:
- Removal of legacy branches (handled in Task 136/138).
- Command write-path migration (Task 135).

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Shadow mode must be non-blocking and side-effect minimal.
  - Logging must be gated by explicit flag (`NEXT_PUBLIC_POLICY_SHADOW=1` or equivalent).
- Compatibility:
  - Feature flag off => no observable runtime behavior change.

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
    - Implementer-A: `v10/src/features/policy/policyShadow.ts`
    - Implementer-B: `v10/src/features/extensions/commandExecutionPolicy.ts`, `v10/src/features/extensions/toolExecutionPolicy.ts`
    - Implementer-C: `v10/src/features/layout/AppLayout.tsx`, docs
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

- [x] AC-1: Shadow evaluation module exists and can compare legacy decision vs policy decision for role-sensitive checks.
- [x] AC-2: With shadow flag enabled, mismatches are logged deterministically with decision key metadata.
- [x] AC-3: With shadow flag disabled, no mismatch logging path executes.
- [x] AC-4: `cd v10 && npm run lint` passes.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: run app with `NEXT_PUBLIC_POLICY_SHADOW=1`
   - Expected result: mismatch logs appear only when outputs differ.
   - Covers: AC-2

2) Step:
   - Command / click path: run app without shadow flag
   - Expected result: no shadow mismatch logs.
   - Covers: AC-3

3) Step:
   - Command / click path: `cd v10 && npm run lint`
   - Expected result: lint pass.
   - Covers: AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Excessive log volume in debug mode.
- Roll-back:
  - Disable shadow flag and revert shadow integration points.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/task_134_policy_shadow_mode_and_diff_telemetry.md`
- `v10/src/features/policy/policyShadow.ts`
- `v10/src/features/extensions/commandExecutionPolicy.ts`
- `v10/src/features/extensions/toolExecutionPolicy.ts`
- `v10/src/features/layout/AppLayout.tsx`
- `v10/AI_READ_ME.md`
- `v10/AI_READ_ME_MAP.md`

Commands run (only if user asked or required by spec):
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
- Shadow diff logger integration and policy/legacy comparison points were validated by code-path inspection and lint/build checks.

Notes:
- Delegated execution completed for this task scope.
