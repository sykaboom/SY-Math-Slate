# Task 212: Offline-First Session Draft Queue

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-16

---

## Goal (Base Required)
- What to change:
  - Add offline-first queue for Input Studio draft requests and queued retry plumbing.
  - Persist queue in JSON-safe local storage and expose bounded queue APIs.
- What must NOT change:
  - Existing online draft request flow and approval pipeline must remain compatible.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_212_offline_first_session_draft_queue.md`
- `v10/src/features/editor/input-studio/offlineDraftQueue.ts` (new)
- `v10/src/features/editor/input-studio/llm/useInputStudioLlmDraft.ts`

Out of scope:
- Network transport/backoff service worker integration.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Queue utilities must remain JSON-safe and local-storage bounded.
- Compatibility:
  - When offline queue is empty or disabled, existing behavior unchanged.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W6
- Depends on tasks:
  - [`task_207`, `task_211`]
- Enables tasks:
  - [`task_213`]
- Parallel group:
  - G6-mobile
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `end`

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
- If YES:
  - [x] Structure changes (file/folder add/move/delete):
    - Run `node scripts/gen_ai_read_me_map.mjs`
    - Verify `v10/AI_READ_ME_MAP.md` update if needed
  - [x] Semantic/rule changes:
    - Verify `v10/AI_READ_ME.md` update if needed

---

## Acceptance Criteria (Base Required)

- [x] AC-1: Offline draft requests are enqueued deterministically with bounded queue size.
- [x] AC-2: Queue entries can be replayed/cleared and survive page reload.
- [x] AC-3: `VERIFY_STAGE=end bash scripts/run_repo_verifications.sh` passes.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: simulate offline mode and trigger draft request.
   - Expected result: request is queued (not dropped) with deterministic id/timestamp.
   - Covers: AC-1

2) Step:
   - Command / click path: reload page and inspect queue, then restore online and replay.
   - Expected result: queue persists and replay path processes entries.
   - Covers: AC-2

3) Step:
   - Command / click path: `VERIFY_STAGE=end bash scripts/run_repo_verifications.sh`
   - Expected result: PASS
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Queue growth or malformed entries can pollute local storage.
- Roll-back:
  - enforce strict bounded queue and safe parsing with drop-invalid fallback.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - User quote: "다음 웨이브 진행바람."

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/features/editor/input-studio/offlineDraftQueue.ts`
- `v10/src/features/editor/input-studio/llm/useInputStudioLlmDraft.ts`
- `v10/AI_READ_ME_MAP.md`

Commands run (only if user asked or required by spec):
- `node scripts/gen_ai_read_me_map.mjs`
- `VERIFY_STAGE=end bash scripts/run_repo_verifications.sh`

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - PASS
- Script checks:
  - PASS (`run_repo_verifications`)

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
- Offline branch in draft request hook enqueues deterministic JSON-safe queue records by role and returns explicit queued error marker for caller handling.

Notes:
- Queue store is bounded (`max=50`), deduplicated by deterministic id, and auto-heals malformed localStorage payloads by dropping invalid entries.
