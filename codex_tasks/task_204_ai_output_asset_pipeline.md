# Task 204: AI Output Asset Pipeline

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Add AI output asset normalization/pipeline utilities for multimodal adapter outputs (image/video/audio asset payloads).
  - Ensure deterministic asset envelope shaping for downstream renderer/export compatibility.
- What must NOT change:
  - Existing persisted doc schema must remain backward-compatible.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_204_ai_output_asset_pipeline.md`
- `v10/src/core/extensions/aiOutputAssetPipeline.ts` (new)
- `v10/src/core/contracts/multimodalAsset.ts` (integration helpers only if required)
- `v10/src/features/platform/extensions/adapters/providerAbi.ts` (pipeline wiring only if required)

Out of scope:
- Binary storage backend integration.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Pipeline functions must be JSON-safe and side-effect-free.
- Compatibility:
  - Existing ToolResult validation behavior must remain stable.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W5
- Depends on tasks:
  - [`task_191`, `task_193`, `task_194`, `task_195`, `task_196`, `task_203`]
- Enables tasks:
  - [`task_205`, `task_206`]
- Parallel group:
  - G5-orchestration
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

- [x] AC-1: AI asset payload normalization helper produces deterministic asset descriptors.
- [x] AC-2: Helper rejects invalid/unsafe payloads with stable error codes.
- [x] AC-3: lint/build checks pass.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: run helper against valid/invalid image/video/audio payload fixtures.
   - Expected result: valid normalized asset record; invalid rejected with deterministic error.
   - Covers: AC-1, AC-2

2) Step:
   - Command / click path: `cd v10 && npm run lint && npm run build`
   - Expected result: PASS
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Over-normalization may drop provider metadata needed later.
- Roll-back:
  - preserve metadata passthrough allowlist and keep original raw envelope in ToolResult.raw.

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
- `v10/src/core/extensions/aiOutputAssetPipeline.ts`

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
- image/video/audio payload normalize 시 deterministic descriptorId 생성 확인.
- invalid payload/list 입력에서 stable validation code 반환 확인.

Notes:
- pipeline은 pure utility로 유지(저장/네트워크 side-effect 없음).
