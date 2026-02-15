# Task 217: Community Core Post/Comment/Report

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Add core community domain primitives for post/comment/report with runtime-safe validation.
  - Provide minimal Next API surface and client store/hooks for community actions.
- What must NOT change:
  - Existing editor/canvas workflows must not depend on community module availability.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_217_community_core_post_comment_report.md`
- `v10/src/core/contracts/community.ts` (new)
- `v10/src/features/community/store/useCommunityStore.ts` (new)
- `v10/src/features/community/useCommunityActions.ts` (new)
- `v10/src/app/api/community/route.ts` (new)

Out of scope:
- Moderation console workflow UI (`task_218`).

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Contract guards must live under `core/contracts`; UI-agnostic domain logic stays under `features/community`.
- Compatibility:
  - API must fail closed on invalid payloads and keep deterministic error codes.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W7
- Depends on tasks:
  - [`task_212`]
- Enables tasks:
  - [`task_218`]
- Parallel group:
  - G7-platform
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

- [x] AC-1: Community contracts validate post/comment/report payloads deterministically.
- [x] AC-2: Community API and client actions support create/list/report base flow without runtime exceptions.
- [x] AC-3: `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh` passes.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: call community API with valid/invalid payload fixtures.
   - Expected result: valid payload accepted, invalid payload rejected with deterministic codes.
   - Covers: AC-1, AC-2

2) Step:
   - Command / click path: execute client-side post/comment/report actions via store hooks.
   - Expected result: state transitions are deterministic and JSON-safe.
   - Covers: AC-2

3) Step:
   - Command / click path: `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh`
   - Expected result: PASS
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - New domain contracts can drift from API/store semantics.
- Roll-back:
  - revert community module additions without touching editor paths.

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
- `v10/src/core/contracts/community.ts`
- `v10/src/features/community/store/useCommunityStore.ts`
- `v10/src/features/community/useCommunityActions.ts`
- `v10/src/app/api/community/route.ts`

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
- Community API/store/actions now support deterministic create/list/report flows with runtime payload validation and fail-closed errors.

Notes:
- `moderate-report` path now requires host token headers and server token match to prevent unauthorized moderation mutation.
