# Task 219: UGC Safety Filter Pipeline

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-16

---

## Goal (Base Required)
- What to change:
  - Add deterministic UGC safety filter pipeline for community post/comment creation.
  - Record bounded safety events and expose them in moderation view.
- What must NOT change:
  - Existing rights-claim, ad-policy, invalid-traffic behavior remains backward-compatible.
  - No dependency additions.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_219_ugc_safety_filter_pipeline.md`
- `v10/src/features/governance/community/safety/ugcSafetyFilter.ts` (new)
- `v10/src/core/contracts/community.ts`
- `v10/src/app/api/community/route.ts`
- `v10/src/features/governance/community/store/useCommunityStore.ts`
- `v10/src/features/governance/moderation/useModerationConsole.ts`
- `v10/src/features/governance/moderation/ModerationConsolePanel.tsx`

Out of scope:
- Realtime transport protocol changes
- Modding SDK/marketplace changes
- W9 release gate/checklist artifacts

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Safety filtering logic must remain in `features/community/safety` and be imported by API route.
  - Contracts remain validated via `core/contracts/community.ts`.
- Compatibility:
  - `create-post`/`create-comment` response shape remains valid `CommunitySnapshot`.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W8
- Depends on tasks:
  - [`task_220`, `task_221`, `task_222`, `task_223`]
- Enables tasks:
  - [`task_224`]
- Parallel group:
  - G8-safety
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
    - task_219 + task_224~227
  - Assigned roles:
    - Spec-Writer: Codex
    - Spec-Reviewer: Codex
    - Implementer-A: Codex
    - Implementer-B: Codex
    - Implementer-C: Codex
    - Reviewer+Verifier: Codex
  - File ownership lock plan:
    - community contracts/api/store/moderation files locked to this task during implementation.
  - Parallel slot plan:
    - sequential due overlapping file ownership.

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

- [x] AC-1: `create-post` / `create-comment` enforce deterministic safety verdict (`allow|review|block`) before mutation commit.
- [x] AC-2: Blocked content is rejected fail-closed and recorded as safety event without mutating post/comment state.
- [x] AC-3: Review-level content remains allowed but emits safety event and auto-report entry for moderator queue.
- [x] AC-4: Moderation console surfaces bounded safety events.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: POST `/api/community` `create-post` with known blocked phrase.
   - Expected result: 422 rejection + no post added + safety event logged.
   - Covers: AC-1, AC-2

2) Step:
   - Command / click path: POST `/api/community` `create-comment` with review phrase.
   - Expected result: comment added + pending report and safety event created.
   - Covers: AC-1, AC-3

3) Step:
   - Command / click path: open moderation console as host.
   - Expected result: safety events list is rendered.
   - Covers: AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Overblocking due aggressive keyword list.
- Roll-back:
  - Revert this task commit or disable safety enforcement path in API route.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - User quote: "1,2 실행하라."

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/task_219_ugc_safety_filter_pipeline.md`
- `v10/src/features/governance/community/safety/ugcSafetyFilter.ts`
- `v10/src/core/contracts/community.ts`
- `v10/src/app/api/community/route.ts`
- `v10/src/features/governance/community/store/useCommunityStore.ts`
- `v10/src/features/governance/moderation/useModerationConsole.ts`
- `v10/src/features/governance/moderation/ModerationConsolePanel.tsx`

Commands run (only if user asked or required by spec):
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
- `scripts/check_v10_chaos_recovery_drills.sh`

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - PASS
- Script checks:
  - PASS

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - N/A
- Newly introduced failures:
  - N/A
- Blocking:
  - NO
- Mitigation:
  - N/A

Manual verification notes:
- blocked safety phrase path rejects mutation with 422 and records `safetyEvents` block entry.
- review phrase path allows mutation and auto-appends pending moderation report plus safety event.
- moderation console renders `UGC Safety Events` panel with bounded list.

Notes:
- Snapshot contract was extended with `safetyEvents`; store/API/moderation wiring updated accordingly.
