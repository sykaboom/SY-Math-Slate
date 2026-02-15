# Task 191: Multimodal ToolResult Contract V2

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-16

---

## Goal (Base Required)
- What to change:
  - Extend core contract validation so `ToolResult.normalized` can safely represent multimodal AI outputs (image/video/audio assets) in addition to existing payloads.
- What must NOT change:
  - Existing `NormalizedContent/RenderPlan/TTSScript` validation behavior must remain backward-compatible.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_191_multimodal_toolresult_contract_v2.md`
- `v10/src/core/contracts/toolResult.ts`
- `v10/src/core/contracts/index.ts`
- `v10/src/core/contracts/multimodalAsset.ts` (new)

Out of scope:
- Provider adapter runtime implementation (Task 192+).

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - `core/contracts` only; no `features` import.
- Compatibility:
  - Contract v1 payloads remain valid without migration.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W4
- Depends on tasks:
  - [`task_190`]
- Enables tasks:
  - [`task_192`, `task_197`, `task_198`]
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
- If YES:
  - Execution mode: DELEGATED
  - Delegation chain scope:
    - W4 (`task_191~198`)
  - Assigned roles:
    - Spec-Writer: Codex
    - Spec-Reviewer: Codex
    - Implementer-A: sub-agent
    - Implementer-B: sub-agent
    - Implementer-C: sub-agent
    - Reviewer+Verifier: sub-agent + Codex
  - File ownership lock plan:
    - `core/contracts/*` single-owner
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

- [x] AC-1: `ToolResult` validator accepts multimodal asset normalized payloads.
- [x] AC-2: Existing normalized payload validators keep passing unchanged behavior.
- [x] AC-3: `cd v10 && npm run lint && npm run build` passes.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: validate synthetic multimodal `ToolResult` payload via contract guard usage path.
   - Expected result: accepted as known normalized payload.
   - Covers: AC-1

2) Step:
   - Command / click path: run existing draft/tool paths (`input-studio` flow static checks).
   - Expected result: no contract regression on legacy payload types.
   - Covers: AC-2

3) Step:
   - Command / click path: `cd v10 && npm run lint && npm run build`
   - Expected result: PASS
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Overly strict multimodal schema may reject valid adapter payloads.
- Roll-back:
  - Restrict multimodal validator to permissive asset envelope and keep strictness in adapter layer.

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
- `v10/src/core/contracts/multimodalAsset.ts`
- `v10/src/core/contracts/toolResult.ts`
- `v10/src/core/contracts/index.ts`

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
- `ToolResult` normalized discriminator가 `ImageAssetPayload/VideoAssetPayload/AudioAssetPayload`를 수용함을 확인.
- 기존 `NormalizedContent/RenderPlan/TTSScript` 경로 회귀 없이 lint/build/verification 통과.

Notes:
- Multimodal payload guard는 `core/contracts` 레이어 내부에서만 동작하도록 분리 유지.
