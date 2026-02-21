# Task 200: Local Ollama Adapter

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Add a local Ollama adapter compatible with provider ABI v1 and tool result contracts.
  - Expose deterministic adapter metadata/capability hints for routing.
- What must NOT change:
  - Existing mock/provider adapters must continue to function unchanged.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_200_local_ollama_adapter.md`
- `v10/src/features/platform/extensions/adapters/ollamaLocalAdapter.ts` (new)
- `v10/src/features/platform/extensions/adapters/index.ts`
- `v10/src/features/platform/extensions/adapters/registry.ts` (if metadata wiring requires)

Out of scope:
- Local-cloud fallback chain orchestration (task_205).

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Adapter must not mutate store directly.
- Compatibility:
  - If local Ollama endpoint is unreachable, adapter returns deterministic error response (no crash).

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W5
- Depends on tasks:
  - [`task_199`]
- Enables tasks:
  - [`task_205`, `task_206`]
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

---

## Optional Block C — Hotfix Exception

- [ ] Applies: NO

---

## Optional Block D — Speculative Defense Check

- [ ] Applies: NO

---

## Optional Block E — Documentation Update Check

- [x] Applies: YES

---

## Acceptance Criteria (Base Required)

- [x] AC-1: Ollama local adapter is registered and invocable through adapter registry.
- [x] AC-2: Adapter returns ToolResult-compatible response or deterministic error envelope on endpoint failure.
- [x] AC-3: lint/build checks pass.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: invoke adapter with local endpoint configured/unconfigured.
   - Expected result: configured path returns valid ToolResult; unconfigured path returns deterministic connector error.
   - Covers: AC-1, AC-2

2) Step:
   - Command / click path: `cd v10 && npm run lint && npm run build`
   - Expected result: PASS
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Local endpoint protocol mismatch may produce malformed payloads.
- Roll-back:
  - Keep adapter behind explicit adapter id usage; fallback to existing provider adapters.

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
- `v10/src/features/platform/extensions/adapters/ollamaLocalAdapter.ts`
- `v10/src/features/platform/extensions/adapters/index.ts`

Commands run (only if user asked or required by spec):
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
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
- `local.ollama` adapter 등록/호출 경로 확인.
- endpoint/model 누락 시 deterministic error 반환, 설정 시 ToolResult 정상 반환.

Notes:
- request.meta/payload의 local/config 경로에서 endpoint/model 탐색 지원.
