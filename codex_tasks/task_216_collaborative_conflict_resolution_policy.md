# Task 216: Collaborative Conflict Resolution Policy

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Define deterministic conflict-resolution policy for collaborative sync envelopes and queue mutations.
  - Apply conflict resolver at sync ingestion boundary.
- What must NOT change:
  - CommandBus approval invariants and role-policy deny-by-default semantics must remain intact.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_216_collaborative_conflict_resolution_policy.md`
- `v10/src/features/collaboration/sync/realtime/conflictPolicy.ts` (new)
- `v10/src/features/collaboration/sync/useAsymmetricSessionSync.ts`
- `v10/src/features/platform/store/useSyncStore.ts`

Out of scope:
- New moderation/community API surfaces.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Conflict policy module must be pure TypeScript without UI imports.
- Compatibility:
  - Equal-sequence conflict tie-break must be deterministic and documented in code.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W7
- Depends on tasks:
  - [`task_214`, `task_215`]
- Enables tasks:
  - [`task_218`]
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

- [x] AC-1: Conflict resolver deterministically classifies stale/newer/tie cases with explicit precedence rules.
- [x] AC-2: Sync ingestion applies resolver and prevents nondeterministic state overwrite.
- [x] AC-3: `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh` passes.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: feed equal-sequence and out-of-order envelopes in controlled replay.
   - Expected result: resolver outcome is deterministic and stable.
   - Covers: AC-1, AC-2

2) Step:
   - Command / click path: run collaborative state updates under mixed role inputs.
   - Expected result: no nondeterministic overwrite occurs.
   - Covers: AC-2

3) Step:
   - Command / click path: `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh`
   - Expected result: PASS
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Incorrect precedence can starve legitimate updates.
- Roll-back:
  - isolate policy application in one boundary function for targeted revert.

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
- `v10/src/features/collaboration/sync/realtime/conflictPolicy.ts`
- `v10/src/features/collaboration/sync/useAsymmetricSessionSync.ts`
- `v10/src/features/platform/store/useSyncStore.ts`

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
- Conflict policy now deterministically resolves envelope and queue-entry ties by explicit precedence rules and blocks nondeterministic overwrite.

Notes:
- Queue merge path in `useSyncStore.enqueuePendingAI` now uses conflict-policy resolution for same-id entries.
