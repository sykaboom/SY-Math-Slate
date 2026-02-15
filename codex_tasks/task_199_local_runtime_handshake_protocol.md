# Task 199: Local Runtime Handshake Protocol

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Add a deterministic local-runtime handshake protocol for local AI providers (Ollama/LM Studio/WebGPU bridge) before tool invocation.
  - Provide capability token/session envelope validation utilities for local runtime channels.
- What must NOT change:
  - Existing MCP gateway/session behavior must remain intact.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_199_local_runtime_handshake_protocol.md`
- `v10/src/core/extensions/localRuntimeHandshake.ts` (new)
- `v10/src/core/extensions/index.ts` (if export update is required)
- `v10/src/features/extensions/ui/ExtensionRuntimeBootstrap.tsx` (handshake runtime bootstrap hook)

Out of scope:
- Provider-specific adapter invocation logic (task_200~202).

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Handshake module must remain `core/extensions` pure contract/runtime utility.
- Compatibility:
  - If local handshake is disabled or unavailable, existing adapter execution remains functional.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W5
- Depends on tasks:
  - [`task_198`]
- Enables tasks:
  - [`task_200`, `task_201`, `task_202`, `task_205`, `task_206`]
- Parallel group:
  - G5-local-ai
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `mid`

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: YES
- If YES:
  - Execution mode: DELEGATED
  - Delegation chain scope:
    - W5 (`task_199~206`)
  - Assigned roles:
    - Spec-Writer: Codex
    - Spec-Reviewer: Codex
    - Implementer-A: sub-agent
    - Implementer-B: sub-agent
    - Implementer-C: sub-agent
    - Reviewer+Verifier: sub-agent + Codex
  - File ownership lock plan:
    - handshake/sandbox core files single-owner
  - Parallel slot plan:
    - max 6 active slots

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

- [x] AC-1: Local runtime handshake helper validates request/session envelopes deterministically.
- [x] AC-2: Runtime bootstrap can initialize/tear down local handshake context without breaking existing MCP flow.
- [x] AC-3: `cd v10 && npm run lint && npm run build` passes.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: run handshake utility with valid/invalid envelope fixtures.
   - Expected result: valid accepted, invalid rejected with stable error code.
   - Covers: AC-1

2) Step:
   - Command / click path: start runtime bootstrap path and ensure no regression in existing gateway init.
   - Expected result: no runtime error and previous bootstrap path unaffected.
   - Covers: AC-2

3) Step:
   - Command / click path: `cd v10 && npm run lint && npm run build`
   - Expected result: PASS
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Handshake strictness can reject valid local runtime calls.
- Roll-back:
  - Keep handshake optional behind a runtime flag and fallback to existing adapter path.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - User quote: "다음웨이브 진행."

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/extensions/localRuntimeHandshake.ts`
- `v10/src/features/extensions/ui/ExtensionRuntimeBootstrap.tsx`

Commands run (only if user asked or required by spec):
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
- `bash scripts/check_layer_rules.sh`
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
  - None
- Newly introduced failures:
  - None
- Blocking:
  - NO
- Mitigation:
  - N/A

Manual verification notes:
- Handshake envelope 생성/검증/만료 체크가 deterministic code/path로 동작함을 확인.
- Runtime bootstrap에서 local preflight용 handshake 세션을 초기화/정리하며 기존 MCP init 흐름 회귀 없음.

Notes:
- Local runtime handshake protocol: `sy-math-slate:local-runtime-handshake.v1`.
