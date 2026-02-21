# Task 220: Rights Claim / Takedown Workflow

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Add rights-claim creation and host review/takedown workflow to community runtime.
  - Ensure approved rights claims produce deterministic takedown records.
- What must NOT change:
  - Existing post/comment/report/moderation behavior must remain backward-compatible.
  - No dependency additions.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_220_rights_claim_takedown_workflow.md`
- `v10/src/core/contracts/community.ts`
- `v10/src/app/api/community/route.ts`
- `v10/src/features/governance/community/store/useCommunityStore.ts`
- `v10/src/features/governance/community/useCommunityActions.ts`
- `v10/src/features/governance/moderation/useModerationConsole.ts`
- `v10/src/features/governance/moderation/ModerationConsolePanel.tsx`

Out of scope:
- Ads policy gating rules.
- Invalid traffic heuristics.
- SLO/oncall documentation.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Runtime guards must stay in `core/contracts`.
  - Host-only review/takedown mutation path must require server token check.
- Compatibility:
  - Existing API actions remain valid.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W8
- Depends on tasks:
  - [`task_218`, `task_219`]
- Enables tasks:
  - [`task_221`, `task_222`, `task_223`]
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
    - task_220~223
  - Assigned roles:
    - Spec-Writer: Codex
    - Spec-Reviewer: Codex
    - Implementer-A: Codex
    - Implementer-B: Codex
    - Implementer-C: Codex
    - Reviewer+Verifier: Codex
  - File ownership lock plan:
    - community contracts/api/store/actions/moderation files locked to this task while active.
  - Parallel slot plan:
    - sequential per overlapping file set.

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

- [x] AC-1: Community API supports `create-rights-claim` and `review-rights-claim` actions with contract validation.
- [x] AC-2: Approved claim creates deterministic takedown record and marks claim as resolved.
- [x] AC-3: Moderation console exposes pending/resolved rights-claim rows for host.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: POST `/api/community` with `create-rights-claim` valid payload.
   - Expected result: snapshot includes pending rights claim.
   - Covers: AC-1

2) Step:
   - Command / click path: POST `/api/community` with `review-rights-claim` as host token.
   - Expected result: approved/rejected transition recorded; approved path adds takedown record.
   - Covers: AC-2

3) Step:
   - Command / click path: open moderation panel as host.
   - Expected result: rights claim queue and resolved list render.
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Expanding snapshot schema may break consumers if not fully wired.
- Roll-back:
  - Revert task commit.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - User quote: "다음 웨이브 진행해."

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/contracts/community.ts`
- `v10/src/app/api/community/route.ts`
- `v10/src/features/governance/community/store/useCommunityStore.ts`
- `v10/src/features/governance/community/useCommunityActions.ts`
- `v10/src/features/governance/moderation/useModerationConsole.ts`
- `v10/src/features/governance/moderation/ModerationConsolePanel.tsx`
- `codex_tasks/task_220_rights_claim_takedown_workflow.md`

Commands run (only if user asked or required by spec):
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
- `node scripts/gen_ai_read_me_map.mjs`
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
  - None observed
- Newly introduced failures:
  - None observed
- Blocking:
  - NO
- Mitigation:
  - N/A

Manual verification notes:
- Host queue now includes rights-claim pending/resolved paths.
- Approved rights claims create deterministic takedown records and redact target content with takedown marker.

Notes:
- Rights-claim review action is host-token gated at `/api/community`.
