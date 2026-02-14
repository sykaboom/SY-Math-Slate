# Task 116: MCP-Compatible Secure Gateway

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-14

---

## Goal (Base Required)
- What to change:
  - Introduce an MCP-compatible secure gateway boundary in `mcpGateway.ts` that validates execution requests and policy constraints before adapter invocation.
  - Enforce postMessage handshake, origin allowlist checks, and capability-token gated execution for MCP tool targets.
  - Sanitize gateway diagnostics/metadata to prevent secret-like fields from entering queue/log/persisted paths.
- What must NOT change:
  - No direct external MCP server session implementation in this task.
  - No provider-specific logic leakage into `core` domain rules.
  - No new dependency.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_116_mcp_compatible_secure_gateway.md`
- `v10/src/core/extensions/mcpGateway.ts` (new)
- `v10/src/core/extensions/connectors.ts`
- `v10/src/core/engine/commandBus.ts` (only for centralized preflight handoff integration)
- `v10/src/features/extensions/ui/ExtensionRuntimeBootstrap.tsx`
- `v10/src/core/extensions/pluginLoader.ts`
- `v10/AI_READ_ME.md` (if runtime flow text changes)
- `v10/AI_READ_ME_MAP.md` (if file map changes)

Out of scope:
- Real MCP server discovery/auth/session lifecycle implementation
- Secret vault/key management backends
- Declarative UI plugin contract hardening (Task 115)
- Command bus facade design changes beyond required gateway integration (Task 114)

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- `zod` allowed: NO
- Boundary rules:
  - MCP request preflight must remain centralized in command bus, then delegated to `mcpGateway.ts` for MCP-specific security checks.
  - Gateway policy checks are deterministic and side-effect constrained.
  - `core` enforces contracts/policy only; provider/MCP transport specifics remain in adapter layer.
  - MCP postMessage flow must enforce handshake + origin validation + capability token before execute calls.
  - No raw `window` global exposure from core MCP gateway APIs; runtime bindings must use injected interfaces.
  - No secret/token storage in registry, queue, or diagnostics payloads.
- Compatibility:
  - Existing connector adapter execution path remains available for non-MCP tool calls.
  - Existing `approval-required` interception behavior must remain intact after gateway insertion.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- If YES:
  - Execution mode: DELEGATED
  - Delegation chain scope:
    - Task 116
  - Assigned roles:
    - Spec-Writer: Codex
    - Spec-Reviewer: Codex
    - Implementer-A: Codex
    - Implementer-B: Codex
    - Implementer-C: Codex
    - Reviewer+Verifier: Codex
  - File ownership lock plan:
    - Implementer-A: `mcpGateway.ts` + `toolRegistry.ts`
    - Implementer-B: `connectors.ts` + `commandBus.ts` + adapter registry/type wiring
    - Implementer-C: adapter mock/store sanitization + docs updates
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

- [x] AC-1: `v10/src/core/extensions/mcpGateway.ts` exists and MCP `call_tool` command route dispatches through command-bus preflight.
- [x] AC-2: MCP gateway enforces origin allowlist during postMessage handshake; untrusted origins are deterministically denied.
- [x] AC-3: Gateway issues session tokens only after valid handshake capability token; missing/invalid/expired tokens are deterministically denied.
- [x] AC-4: `call_tool` route parsing validates command/plugin payload shapes and fails closed on unsupported routes.
- [x] AC-5: Secret-like keys are scrubbed from JSON metadata/result paths before responses.
- [x] AC-6: No raw `window` global exposure is introduced for MCP core gateway logic; runtime boundary uses injected message interfaces.
- [x] AC-7: No new dependencies and no `zod` import are introduced by Task 116 touched implementation files.
- [x] AC-8: Student mutating commands still return `approval-required` under secured path (via command bus preflight).
- [x] AC-9: `cd v10 && npm run lint` passes (errors 0).
- [x] AC-10: `cd v10 && npm run build` passes.

---

## Manual Verification Steps (Base Required)

> Each step should map to one or more Acceptance Criteria.

1) Step:
   - Command / click path: initiate MCP handshake from allowlisted origin and execute valid `call_tool` command route
   - Expected result: handshake succeeds, session token issued, request passes command-bus preflight + mcpGateway checks
   - Covers: AC-1, AC-2, AC-3, AC-4

2) Step:
   - Command / click path: initiate handshake from non-allowlisted origin
   - Expected result: deterministic origin-denied failure and no capability token issuance
   - Covers: AC-2

3) Step:
   - Command / click path: execute MCP request with missing/invalid/expired session token
   - Expected result: deterministic token/session denial and no command execution side effect
   - Covers: AC-3, AC-4

4) Step:
   - Command / click path: submit diagnostics/meta containing secret-like key names
   - Expected result: secret-like fields blocked or sanitized before queue/store path
   - Covers: AC-5

5) Step:
   - Command / click path: inspect task touched files for direct MCP `window` global exposure/imports/dependencies
   - Expected result: no raw `window` global exposure in core MCP gateway path, no `zod` imports, no new dependencies
   - Covers: AC-6, AC-7

6) Step:
   - Command / click path: execute mutating command request under `student` role
   - Expected result: `approval-required` behavior preserved under gateway path
   - Covers: AC-8

7) Step:
   - Command / click path: `cd v10 && npm run lint && npm run build`
   - Expected result: both pass
   - Covers: AC-9, AC-10

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Overly strict handshake/origin/token policy may block legitimate MCP integrations until policy metadata is tuned.
  - Incomplete sanitization coverage may leave residual sensitive diagnostics in queue paths.
- Roll-back:
  - Revert gateway integration and restore prior connector path while preserving non-breaking contract validations.
  - Roll back in layers: gateway module -> connectors wiring -> adapter/store sanitization changes.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (delegated chain approval reference: "위임모드로 task 116까지 전부 마무리하라!")

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/task_116_mcp_compatible_secure_gateway.md`
- `v10/src/core/extensions/mcpGateway.ts`
- `v10/src/features/extensions/ui/ExtensionRuntimeBootstrap.tsx`
- `v10/src/core/extensions/connectors.ts`
- `v10/src/core/extensions/pluginLoader.ts`
- `v10/src/core/engine/commandBus.ts`
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
  - Used lint/build and message-channel policy checks for gateway behavior.

Manual verification notes:
- `mcpGateway.ts` now enforces postMessage protocol, origin allowlist, capability-token handshake, and session-token auth.
- Untrusted payload/result sanitization now includes depth/node/cycle guards to block recursive DoS inputs.
- `ExtensionRuntimeBootstrap` wires MCP gateway, command registration/policy hooks, and plugin registration to command-bus path.
- `call_tool` command route dispatches into `dispatchCommand`, preserving command preflight approval rules.

Notes:
- MCP integration is intentionally MCP-compatible and sandbox-safe; no global bridge object assignment is used.
