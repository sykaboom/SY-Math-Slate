# Task 213: Internet Realtime Backplane

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Introduce a transport-agnostic realtime backplane for collaboration sync with deterministic message envelope validation.
  - Replace direct BroadcastChannel coupling in session sync hook with the new backplane runtime.
- What must NOT change:
  - Existing single-user flow and offline-only flow must continue to work when no realtime endpoint is configured.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_213_internet_realtime_backplane.md`
- `v10/src/features/sync/useAsymmetricSessionSync.ts`
- `v10/src/features/sync/realtime/backplane.ts` (new)
- `v10/src/features/sync/realtime/messageEnvelope.ts` (new)

Out of scope:
- UI role visibility policy changes (`AppLayout`).
- Community/moderation domain features (`task_217`, `task_218`).

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Backplane runtime stays in `features/sync/**` and must not import UI layer modules.
- Compatibility:
  - BroadcastChannel path remains supported as fallback.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W7
- Depends on tasks:
  - [`task_212`]
- Enables tasks:
  - [`task_214`, `task_215`, `task_216`]
- Parallel group:
  - G7-collab
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
    - W7 (`task_213~218`)
  - Assigned roles:
    - Spec-Writer: Codex
    - Spec-Reviewer: Codex
    - Implementer-A: sub-agent
    - Implementer-B: sub-agent
    - Implementer-C: sub-agent
    - Reviewer+Verifier: sub-agent + Codex
  - File ownership lock plan:
    - `features/sync/realtime/**` + `useAsymmetricSessionSync.ts` single-owner
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

- [x] AC-1: Realtime backplane exposes deterministic connect/publish/subscribe API with schema-validated sync envelopes.
- [x] AC-2: Session sync hook uses backplane abstraction and keeps fallback behavior when no internet transport is available.
- [x] AC-3: `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh` passes.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: launch two tabs with host/student roles and trigger step/viewport updates.
   - Expected result: updates propagate through backplane runtime.
   - Covers: AC-1, AC-2

2) Step:
   - Command / click path: run without internet realtime URL configured.
   - Expected result: BroadcastChannel fallback keeps sync working without runtime errors.
   - Covers: AC-2

3) Step:
   - Command / click path: `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh`
   - Expected result: PASS
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Transport switch can introduce duplicate/dropped state updates if envelope validation is weak.
- Roll-back:
  - keep legacy BroadcastChannel path behind backplane fallback and revert hook integration only.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - User quote: "다음 웨이브 위임모드로 진행! 역시 서브에이전트 설계부터하고 하라."

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/features/sync/realtime/backplane.ts`
- `v10/src/features/sync/realtime/messageEnvelope.ts`
- `v10/src/features/sync/useAsymmetricSessionSync.ts`

Commands run (only if user asked or required by spec):
- `scripts/check_layer_rules.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
- `VERIFY_STAGE=end bash scripts/run_repo_verifications.sh`

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - PASS
- Script checks:
  - PASS (`check_layer_rules`, `run_repo_verifications`)

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - N/A
- Newly introduced failures:
  - N/A
- Blocking:
  - N/A
- Mitigation:
  - N/A

Manual verification notes:
- Host/student state sync now runs through validated envelope + transport abstraction, with BroadcastChannel fallback preserved.

Notes:
- Added feature-flag registry entries for realtime endpoint env aliases to satisfy guard checks.
