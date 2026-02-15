# Task 202: Local WebGPU/ONNX Adapter

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Add a local WebGPU/ONNX-capable adapter scaffold (contract-safe) for future on-device model execution.
  - Expose deterministic capability metadata (e.g., local runtime class, expected latency tier).
- What must NOT change:
  - No direct browser-global model runtime injection (`window` globals forbidden).

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_202_local_webgpu_onnx_adapter.md`
- `v10/src/features/extensions/adapters/webgpuOnnxLocalAdapter.ts` (new)
- `v10/src/features/extensions/adapters/index.ts`

Out of scope:
- Real ONNX runtime dependency integration.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Adapter must remain dependency-free scaffold using deterministic mock/local envelope path.
- Compatibility:
  - Adapter registration must not change existing default adapter selection unexpectedly.

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

- [x] AC-1: WebGPU/ONNX local adapter scaffold is registered and invocable.
- [x] AC-2: Adapter output is ToolResult-compatible and contract-safe.
- [x] AC-3: lint/build checks pass.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: invoke adapter with deterministic local payload fixture.
   - Expected result: returns valid ToolResult envelope.
   - Covers: AC-1, AC-2

2) Step:
   - Command / click path: `cd v10 && npm run lint && npm run build`
   - Expected result: PASS
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Future real runtime integration assumptions can drift from scaffold.
- Roll-back:
  - Keep adapter marked as local scaffold with explicit diagnostics warning.

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
- `v10/src/features/extensions/adapters/webgpuOnnxLocalAdapter.ts`
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
- `local.webgpu-onnx` scaffold adapter 등록/호출 확인.
- dependency-free mock/local envelope path로 contract-safe ToolResult 반환 확인.

Notes:
- 실제 ONNX runtime 의존성 추가 없이 future-ready adapter ABI 스캐폴드만 반영.
