# Task 194: Image Provider Reference Adapter

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-16

---

## Goal (Base Required)
- What to change:
  - Add ABI-based image reference adapter that returns validated image asset normalized payload.
- What must NOT change:
  - Existing non-image tool flows remain unaffected.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_194_image_provider_reference_adapter.md`
- `v10/src/features/platform/extensions/adapters/imageProviderAdapter.ts` (new)
- `v10/src/features/platform/extensions/adapters/index.ts`

Out of scope:
- LLM/video/audio adapter behavior.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Adapter outputs JSON-safe deterministic asset references (`asset://`).
- Compatibility:
  - No change to existing tool ids required by current UI.

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

- [x] AC-1: Image provider adapter is registered and returns valid `ToolResult` payload.
- [x] AC-2: Normalized payload is accepted by multimodal contract guard.
- [x] AC-3: lint/build checks pass.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: invoke image provider adapter via connector request path.
   - Expected result: valid tool result with image asset normalized payload.
   - Covers: AC-1, AC-2

2) Step:
   - Command / click path: `cd v10 && npm run lint && npm run build`
   - Expected result: PASS
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Asset URI convention mismatch with downstream consumers.
- Roll-back:
  - Isolate URI mapping helper and default to stable placeholder scheme.

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
- `v10/src/features/platform/extensions/adapters/imageProviderAdapter.ts`
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
- `provider.ref.image` 등록 및 실행 시 `ImageAssetPayload` 반환 확인.
- `ToolResult` validator의 multimodal 분기에서 정상 수용됨.

Notes:
- fallback URI 규칙(`asset://image/<requestId>.png`) 적용으로 deterministic reference 보장.
