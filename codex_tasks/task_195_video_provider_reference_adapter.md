# Task 195: Video Provider Reference Adapter

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-16

---

## Goal (Base Required)
- What to change:
  - Add ABI-based video reference adapter with validated video asset normalized payload.
- What must NOT change:
  - Existing renderer/tts validation contracts remain unchanged.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_195_video_provider_reference_adapter.md`
- `v10/src/features/extensions/adapters/videoProviderAdapter.ts` (new)
- `v10/src/features/extensions/adapters/index.ts`

Out of scope:
- LLM/image/audio adapters.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Output schema must be JSON-safe and deterministic.
- Compatibility:
  - No existing adapter IDs are removed.

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

- [x] AC-1: Video provider adapter registered and invocable.
- [x] AC-2: Output passes multimodal `ToolResult` validation.
- [x] AC-3: lint/build checks pass.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: invoke video provider adapter via registered execution path.
   - Expected result: valid video asset normalized payload in tool result.
   - Covers: AC-1, AC-2

2) Step:
   - Command / click path: `cd v10 && npm run lint && npm run build`
   - Expected result: PASS
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Video metadata fields mismatch contract strictness.
- Roll-back:
  - Keep metadata optional and enforce minimum required fields only.

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
- `v10/src/features/extensions/adapters/videoProviderAdapter.ts`
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
- `provider.ref.video` adapter 등록/호출 경로 확인.
- 반환 normalized payload가 `VideoAssetPayload`로 contract validator 통과.

Notes:
- video metadata는 optional 필드 위주로 구성해 strict mismatch 리스크를 최소화.
