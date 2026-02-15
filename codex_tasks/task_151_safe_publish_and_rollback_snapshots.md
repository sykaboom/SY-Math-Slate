# Task 151: Safe Publish Pipeline and Rollback Snapshots

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Add safe publish gate for policy/layout/module/theme changes from GUI.
  - Persist rollback snapshots and provide one-click restore.
- What must NOT change:
  - No publish path can bypass existing security guards.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/features/mod-studio/publish/**` (new)
- `v10/src/core/extensions/pluginLoader.ts`
- `v10/src/core/config/rolePolicyGuards.ts`
- `v10/src/features/store/**` (snapshot state only)

Out of scope:
- Realtime collaboration sync.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Publish preflight validates schema + permissions + slot conflicts.
  - Rollback restore is deterministic and idempotent.
- Compatibility:
  - Existing runtime behavior unchanged when studio publish unused.

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: NO

---

## Optional Block B — Delegated Execution

- [ ] Applies: YES
- If YES:
  - Execution mode: DELEGATED
  - Delegation chain scope:
    - task_139~157
  - Assigned roles:
    - Spec-Writer: Codex
    - Spec-Reviewer: Codex
    - Implementer-A: Codex
    - Implementer-B: Codex
    - Implementer-C: Codex
    - Reviewer+Verifier: Codex
  - File ownership lock plan:
    - A: preflight validator pipeline
    - B: snapshot persistence
    - C: restore flow UI
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

- [ ] Applies: YES
- If YES:
  - [ ] Structure changes (file/folder add/move/delete):
    - Run `node scripts/gen_ai_read_me_map.mjs`
    - Verify `v10/AI_READ_ME_MAP.md` update if needed
  - [ ] Semantic/rule changes:
    - Verify `v10/AI_READ_ME.md` update if needed

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: Publish blocked when any policy/layout/module validation fails.
- [ ] AC-2: Successful publish records snapshot with metadata.
- [ ] AC-3: Rollback restore returns prior configuration reliably.
- [ ] AC-4: lint/build checks pass.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: submit invalid publish.
   - Expected result: blocked with deterministic error summary.
   - Covers: AC-1

2) Step:
   - Command / click path: publish valid config then rollback.
   - Expected result: previous snapshot restored accurately.
   - Covers: AC-2, AC-3

3) Step:
   - Command / click path: `cd v10 && npm run lint && npm run build`
   - Expected result: PASS.
   - Covers: AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Snapshot mismatch can create partial restore state.
- Roll-back:
  - Disable publish entrypoint and restore last validated config.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/features/mod-studio/publish/publishStudioDraft.ts`
- `v10/src/features/mod-studio/publish/PublishStudioSection.tsx`
- `v10/src/features/store/useModStudioStore.ts`
- `v10/src/core/extensions/pluginLoader.ts`
- `v10/src/core/config/rolePolicy.ts`

Commands run (only if user asked or required by spec):
- `scripts/check_layer_rules.sh`
- `cd v10 && npm run lint && npm run build`
- `scripts/run_beta_quality_gate.sh`

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
- preflight 실패(모듈 conflict/manifest invalid/policy invalid) 시 publish 차단 확인.
- publish 성공 시 snapshot 추가 및 rollback 경로 실행 확인.

Notes:
- publish 경로는 policy/plugin/theme guard를 순차 통과해야만 반영됨.
