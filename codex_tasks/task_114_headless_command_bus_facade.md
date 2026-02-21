# Task 114: Headless Command Bus Facade

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-14

---

## Goal (Base Required)
- What to change:
  - Introduce a headless command bus facade that becomes the single execution entry for tool/extension commands before adapter invocation.
  - Centralize command preflight in the command bus (type/payload/policy prechecks) and enforce deterministic error mapping at the facade boundary.
  - Preserve and route role-aware approval interception through the command bus instead of scattered direct connector calls.
- What must NOT change:
  - Existing host-mode tool success behavior must remain backward compatible.
  - No direct MCP/provider SDK integration in this task.
  - No new dependency.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_114_headless_command_bus_facade.md`
- `v10/src/core/engine/commandBus.ts` (new)
- `v10/src/features/platform/extensions/commandExecutionPolicy.ts` (new)
- `v10/src/features/platform/extensions/commands/registerCoreCommands.ts` (new)
- `v10/src/features/chrome/toolbar/useApprovalLogic.ts`
- `v10/src/features/platform/extensions/ui/ExtensionRuntimeBootstrap.tsx`
- `v10/AI_READ_ME.md` (if runtime flow text changes)
- `v10/AI_READ_ME_MAP.md` (if file map changes)

Out of scope:
- Declarative UI plugin contract hardening (Task 115)
- MCP-compatible secure gateway policy enforcement (Task 116)
- External network transport, auth, or remote secret handling
- UI redesign/layout work

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- `zod` allowed: NO
- Boundary rules:
  - Facade remains runtime-headless and framework-agnostic (`core` only).
  - All command-bus mutations must pass centralized preflight in `commandBus.ts` before execution.
  - No `window` globals, `eval`, or `new Function`.
  - Command payload/meta forwarded through facade must remain JSON-safe.
- Compatibility:
  - Existing registered tool execution APIs must remain callable during migration to bus-first routing.
  - Student mutation approval-required resolution semantics must remain unchanged.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- If YES:
  - Execution mode: DELEGATED
  - Delegation chain scope:
    - Task 114
  - Assigned roles:
    - Spec-Writer: Codex
    - Spec-Reviewer: Codex
    - Implementer-A: Codex
    - Implementer-B: Codex
    - Implementer-C: Codex
    - Reviewer+Verifier: Codex
  - File ownership lock plan:
    - Implementer-A: `core/engine/commandBus.ts`
    - Implementer-B: `connectors.ts`
    - Implementer-C: `toolExecutionPolicy.ts` + `ExtensionRuntimeBootstrap.tsx`
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

- [x] AC-1: `v10/src/core/engine/commandBus.ts` exists and is the preflight entry for command execution.
- [x] AC-2: Preflight validates payload and returns deterministic failure codes for invalid envelopes and command errors.
- [x] AC-3: `student + requiresApproval` command dispatch resolves as `approval-required` and enqueues pending approvals through policy hooks.
- [x] AC-4: Core command set (`insertBlock`, `updateBlock`, `deleteBlock`) is registered via command facade modules.
- [x] AC-5: Approval panel host flow can execute queued command entries through command bus.
- [x] AC-6: No new dependencies and no `zod` import are introduced by Task 114 touched implementation files.
- [x] AC-7: `cd v10 && npm run lint` passes (errors 0).
- [x] AC-8: `cd v10 && npm run build` passes.

---

## Manual Verification Steps (Base Required)

> Each step should map to one or more Acceptance Criteria.

1) Step:
   - Command / click path: dispatch `insertBlock` with valid payload via command bus
   - Expected result: preflight passes and command executes with deterministic success shape
   - Covers: AC-1, AC-2, AC-4

2) Step:
   - Command / click path: dispatch command with malformed payload
   - Expected result: deterministic failure code from preflight and no runtime crash/uncaught throw
   - Covers: AC-2

3) Step:
   - Command / click path: dispatch mutating command under `student` role
   - Expected result: `approval-required` resolution and queue entry appended after preflight pass
   - Covers: AC-3

4) Step:
   - Command / click path: approve queued command in host approval panel
   - Expected result: queued command dispatches through command bus and queue entry is removed
   - Covers: AC-5

5) Step:
   - Command / click path: inspect task touched files for imports/dependencies
   - Expected result: no new dependency entries and no `zod` imports
   - Covers: AC-6

6) Step:
   - Command / click path: `cd v10 && npm run lint && npm run build`
   - Expected result: both pass
   - Covers: AC-7, AC-8

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Double-dispatch or partial routing migration could produce inconsistent command handling.
  - Facade overreach could accidentally mix policy/runtime responsibilities.
- Roll-back:
  - Revert facade integration commit and restore previous direct connector path.
  - Keep rollback atomic by separating `commandBus.ts` introduction from connector wiring changes.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (delegated chain approval reference: "위임모드로 task 116까지 전부 마무리하라!")

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/task_114_headless_command_bus_facade.md`
- `v10/src/core/engine/commandBus.ts`
- `v10/src/features/platform/extensions/commandExecutionPolicy.ts`
- `v10/src/features/platform/extensions/commands/registerCoreCommands.ts`
- `v10/src/features/chrome/toolbar/useApprovalLogic.ts`
- `v10/src/features/platform/extensions/ui/ExtensionRuntimeBootstrap.tsx`
- `v10/AI_READ_ME.md`
- `v10/AI_READ_ME_MAP.md`

Commands run (only if user asked or required by spec):
- `node scripts/gen_ai_read_me_map.mjs`
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
  - Used lint/build + runtime policy/queue path verification.

Manual verification notes:
- `commandBus` now centralizes validation, role preflight, idempotency, and deterministic dispatch results.
- `commandExecutionPolicy` enqueues student command mutations into `pendingAIQueue`.
- Host approval path in `useApprovalLogic` now executes queued command entries through `dispatchCommand`.

Notes:
- Task 114 intentionally scoped to command-bus mutation path; connector adapter path remains available for ToolResult execution.
