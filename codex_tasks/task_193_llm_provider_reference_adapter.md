# Task 193: LLM Provider Reference Adapter

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-16

---

## Goal (Base Required)
- What to change:
  - Add ABI-based LLM reference adapter that returns contract-valid multimodal-aware `ToolResult` payloads.
- What must NOT change:
  - Existing `input-studio.llm-draft` flow must remain compatible.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_193_llm_provider_reference_adapter.md`
- `v10/src/features/extensions/adapters/llmProviderAdapter.ts` (new)
- `v10/src/features/extensions/adapters/index.ts`
- `v10/src/features/extensions/adapters/mockAdapter.ts` (compat update only if required)

Out of scope:
- Image/video/audio adapters.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Adapter must emit `ToolResult` that passes `core/contracts` validators.
- Compatibility:
  - `local.mock` adapter path for existing tool ids continues to work.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W4
- Depends on tasks:
  - [`task_192`]
- Enables tasks:
  - [`task_197`, `task_198`]
- Parallel group:
  - G4-multiai
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

- [x] AC-1: LLM reference adapter is registered and invocable through adapter registry.
- [x] AC-2: Output passes `validateToolResult` and carries deterministic diagnostics metadata.
- [x] AC-3: lint/build checks pass.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: invoke LLM adapter through existing registered tool execution path.
   - Expected result: successful `ToolResult` resolution.
   - Covers: AC-1, AC-2

2) Step:
   - Command / click path: `cd v10 && npm run lint && npm run build`
   - Expected result: PASS
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Adapter id collisions with current mock adapter.
- Roll-back:
  - Keep deterministic id namespace and fallback to `local.mock`.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - User quote: "다음 wave 진행하라."

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/features/extensions/adapters/llmProviderAdapter.ts`
- `v10/src/features/extensions/adapters/index.ts`

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
- `provider.ref.llm` 등록 및 invocation 경로 정상 확인.
- 반환 `ToolResult`가 deterministic diagnostics/requestId를 포함하고 contract guard를 통과.

Notes:
- 기존 `input-studio.llm-draft` 기본 adapter 경로와 충돌 없이 공존.
