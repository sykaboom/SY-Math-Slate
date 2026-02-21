# Task 225: Legacy Path Final Purge

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-16

---

## Goal (Base Required)
- What to change:
  - Remove deprecated realtime environment alias read-paths and enforce canonical endpoint key usage.
  - Add regression guard script preventing legacy alias resurrection.
- What must NOT change:
  - Realtime behavior with canonical endpoint key stays unchanged.
  - No direct store rewrite in this task.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_225_legacy_path_final_purge.md`
- `v10/src/features/collaboration/sync/realtime/backplane.ts`
- `codex_tasks/workflow/feature_flag_registry.env`
- `scripts/check_v10_realtime_env_purge.sh` (new)

Out of scope:
- `useCanvasStore`/`useUIStore` full removal
- release candidate checklist
- beta gate v2 orchestration

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Keep fallback transport behavior unchanged.
- Compatibility:
  - Canonical env key remains `NEXT_PUBLIC_SYNC_REALTIME_URL`.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W9
- Depends on tasks:
  - [`task_224`]
- Enables tasks:
  - [`task_226`]
- Parallel group:
  - G9-release
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
    - realtime backplane + registry env + purge script owned by this task.
  - Parallel slot plan:
    - sequential

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

- [x] AC-1: backplane endpoint env key resolution uses canonical key only.
- [x] AC-2: deprecated alias flags are removed from registry.
- [x] AC-3: purge guard script fails if deprecated env aliases reappear.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: `scripts/check_v10_realtime_env_purge.sh`
   - Expected result: PASS.
   - Covers: AC-3

2) Step:
   - Command / click path: inspect `backplane.ts` endpoint keys and registry env.
   - Expected result: only canonical key remains.
   - Covers: AC-1, AC-2

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Existing deployments using deprecated aliases need env migration.
- Roll-back:
  - Restore alias keys in resolver and registry file.

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
- `codex_tasks/task_225_legacy_path_final_purge.md`
- `v10/src/features/collaboration/sync/realtime/backplane.ts`
- `codex_tasks/workflow/feature_flag_registry.env`
- `scripts/check_v10_realtime_env_purge.sh`

Commands run (only if user asked or required by spec):
- `scripts/check_v10_realtime_env_purge.sh`
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
  - N/A
- Newly introduced failures:
  - N/A
- Blocking:
  - NO
- Mitigation:
  - N/A

Manual verification notes:
- realtime backplane now resolves `NEXT_PUBLIC_SYNC_REALTIME_URL` only.
- legacy alias keys removed from registry and guarded by purge script.

Notes:
- this task intentionally scopes purge to realtime env alias path; store purge is out of scope.
