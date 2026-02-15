# Task 143: Legacy Freeze and CI Hardening Wave 2

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: root/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Tighten legacy-freeze thresholds and CI checks as migration progresses.
  - Enforce changed-file lint + wave-end full build policy in verification scripts.
- What must NOT change:
  - No false-positive heavy gate that blocks normal feature work.

---

## Scope (Base Required)

Touched files/directories:
- `scripts/check_v10_legacy_freeze.sh`
- `scripts/check_v10_migration_baseline.sh`
- `scripts/check_v10_changed_lint.sh`
- `scripts/run_repo_verifications.sh`
- `v10/AI_READ_ME.md`

Out of scope:
- Runtime behavior changes in app UX.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Deterministic shell-only checks.
  - Threshold changes must be justified by measured deltas.
- Compatibility:
  - Local developer flow remains usable.

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
    - A: freeze scripts
    - B: verification runner
    - C: docs
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

- [ ] AC-1: Freeze script thresholds reflect latest accepted migration baseline.
- [ ] AC-2: Verification runner includes changed-lint + freeze + baseline checks.
- [ ] AC-3: No new direct regression path bypasses CI scripts.
- [ ] AC-4: All script checks pass on repository state.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: `scripts/check_v10_legacy_freeze.sh`
   - Expected result: PASS with explicit metrics.
   - Covers: AC-1, AC-4

2) Step:
   - Command / click path: `bash scripts/run_repo_verifications.sh`
   - Expected result: PASS, includes all required checks.
   - Covers: AC-2, AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Over-tight thresholds can block valid refactors.
- Roll-back:
  - Revert threshold change and re-baseline with measured evidence.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `scripts/check_v10_migration_baseline.sh` (validated)
- `scripts/check_v10_legacy_freeze.sh` (validated)
- `scripts/check_v10_changed_lint.sh` (validated)
- `scripts/run_repo_verifications.sh` (validated)
- `v10/AI_READ_ME.md`

Commands run (only if user asked or required by spec):
- `scripts/check_v10_legacy_freeze.sh`
- `scripts/check_v10_migration_baseline.sh`
- `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh`
- `cd v10 && npm run lint && npm run build`

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
- legacy freeze budget(W158) 기준으로 `useUIStore/useCanvasStore/dispatchCommand` 임계치 통과.
- verification runner는 `mid/end` stage에서 changed-lint/full-build 전환 로직 유지 확인.
- 문서의 cutover flag 기본값 설명을 현재 런타임 동작과 일치하도록 갱신.

Notes:
- 본 wave에서는 script 로직 추가수정 없이 gate를 재검증하고 문서 동기화를 수행함.
