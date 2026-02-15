# Task 190: Input Studio Publish and Rollback

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Add Input Studio publish/rollback cycle with explicit snapshot semantics.
- What must NOT change:
  - Existing canvas/layout snapshot behaviors must remain intact.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_190_input_studio_publish_rollback.md`
- `v10/src/features/input-studio/publish/*`
- `v10/src/features/layout/DataInputPanel.tsx`
- `v10/src/features/input-studio/llm/*`
- `v10/src/features/input-studio/validation/*`

Out of scope:
- Multi-user distributed conflict resolution.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Publish/rollback state must be explicit and local to Input Studio workflow.
- Compatibility:
  - Existing `캔버스에 적용` action remains available.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W3
- Depends on tasks:
  - [`task_188`, `task_189`]
- Enables tasks:
  - [`task_191`]
- Parallel group:
  - G3-input
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

---

## Acceptance Criteria (Base Required)

- [x] AC-1: Publish action records rollback snapshot and applies validated target blocks.
- [x] AC-2: Rollback action restores prior published snapshot deterministically.
- [x] AC-3: `cd v10 && npm run lint && npm run build` plus verification scripts pass.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: publish input-studio changes, then rollback
   - Expected result: state returns to pre-publish snapshot
   - Covers: AC-1, AC-2

2) Step:
   - Command / click path: `cd v10 && npm run lint && npm run build && VERIFY_STAGE=end bash scripts/run_repo_verifications.sh`
   - Expected result: PASS
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Snapshot drift if publish target and local draft desync.
- Roll-back:
  - disable publish/rollback controls and use base apply path.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - User quote: "w3 위임모드 실행. 서브에이전트 최적 설계하여 진행."

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/features/input-studio/publish/types.ts`
- `v10/src/features/input-studio/publish/useInputStudioPublishRollback.ts`
- `v10/src/features/layout/DataInputPanel.tsx`
- `v10/AI_READ_ME.md`
- `v10/AI_READ_ME_MAP.md`

Commands run (only if user asked or required by spec):
- `cd v10 && npm run lint -- --max-warnings=0 -- src/features/layout/DataInputPanel.tsx src/features/input-studio`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
- `VERIFY_STAGE=end bash scripts/run_repo_verifications.sh`
- `node scripts/gen_ai_read_me_map.mjs`

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - PASS
- Script checks:
  - PASS (`scripts/run_repo_verifications.sh`)

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - None
- Newly introduced failures:
  - None
- Blocking:
  - None
- Mitigation:
  - N/A

Manual verification notes:
- Publish path records rollback snapshot before import; rollback button restores captured snapshot through command path.

Notes:
- End-wave repository verifications passed with layer/theme/viewport/legacy freeze gates all green.
