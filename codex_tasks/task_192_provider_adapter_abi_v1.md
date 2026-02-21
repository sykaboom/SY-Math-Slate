# Task 192: Provider Adapter ABI V1

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-16

---

## Goal (Base Required)
- What to change:
  - Introduce a provider adapter ABI shared by LLM/image/video/audio adapters with deterministic request/response envelope.
- What must NOT change:
  - Existing `ExtensionAdapter` API must remain compatible for current mock adapter usage.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_192_provider_adapter_abi_v1.md`
- `v10/src/features/platform/extensions/adapters/types.ts`
- `v10/src/features/platform/extensions/adapters/registry.ts`
- `v10/src/features/platform/extensions/adapters/providerAbi.ts` (new)
- `v10/src/features/platform/extensions/adapters/index.ts`

Out of scope:
- Category-specific reference adapters (Task 193~196).

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Keep ABI in `features/extensions/adapters/*`; no UI/store coupling.
- Compatibility:
  - Existing mock adapter remains runnable.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W4
- Depends on tasks:
  - [`task_191`]
- Enables tasks:
  - [`task_193`, `task_194`, `task_195`, `task_196`, `task_197`]
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
    - adapter ABI files single-owner
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

---

## Acceptance Criteria (Base Required)

- [x] AC-1: Provider adapter ABI request/response types and guards are available.
- [x] AC-2: Adapter registry can register and query provider ABI metadata.
- [x] AC-3: lint/build checks pass.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: instantiate ABI payload and validate through guard utilities.
   - Expected result: valid payload accepted; invalid rejected.
   - Covers: AC-1

2) Step:
   - Command / click path: `cd v10 && npm run lint && npm run build`
   - Expected result: PASS
   - Covers: AC-2, AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - ABI mismatch between legacy adapter invoker and new provider adapters.
- Roll-back:
  - Keep ABI additive and wrap legacy invoker path in compatibility helpers.

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
- `v10/src/features/platform/extensions/adapters/providerAbi.ts`
- `v10/src/features/platform/extensions/adapters/types.ts`
- `v10/src/features/platform/extensions/adapters/registry.ts`
- `v10/src/features/platform/extensions/adapters/index.ts`

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
- ABI v1 envelope/validator/diagnostics helper가 추가되었고 registry에서 provider ABI metadata 조회 가능.
- mock adapter 호환 경로 유지 확인.

Notes:
- `KNOWN_NORMALIZED_TYPES`에 multimodal type 3종 포함하도록 보정 완료.
