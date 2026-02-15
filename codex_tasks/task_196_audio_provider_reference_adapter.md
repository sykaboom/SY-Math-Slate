# Task 196: Audio Provider Reference Adapter

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-16

---

## Goal (Base Required)
- What to change:
  - Add ABI-based audio reference adapter for TTS/audio asset generation outputs.
- What must NOT change:
  - Existing playback and `audioByStep` persistence paths are unchanged.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_196_audio_provider_reference_adapter.md`
- `v10/src/features/extensions/adapters/audioProviderAdapter.ts` (new)
- `v10/src/features/extensions/adapters/index.ts`

Out of scope:
- Playback engine integration.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Adapter must not write store state directly.
- Compatibility:
  - Existing `tts` category contract compatibility preserved.

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

- [x] AC-1: Audio provider adapter is registered and invocable.
- [x] AC-2: Output conforms to multimodal `ToolResult` contract.
- [x] AC-3: lint/build checks pass.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: invoke audio provider adapter via registered execution path.
   - Expected result: valid audio asset normalized payload.
   - Covers: AC-1, AC-2

2) Step:
   - Command / click path: `cd v10 && npm run lint && npm run build`
   - Expected result: PASS
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - TTS and audio asset schema overlap ambiguity.
- Roll-back:
  - Keep adapter output typed to dedicated audio asset discriminator.

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
- `v10/src/features/extensions/adapters/audioProviderAdapter.ts`
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
- `provider.ref.audio` adapter 등록/호출 경로 확인.
- 반환 normalized payload가 `AudioAssetPayload`로 validator 통과.

Notes:
- 기존 playback/`audioByStep` 저장 플로우는 직접 변경하지 않고 adapter 레이어만 확장.
