# Task 166: Feature Flag Rollout Governance

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: root/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Add explicit registry for `NEXT_PUBLIC_*` flags used in v10 runtime.
  - Add governance check script that fails when an unregistered public flag is introduced.
- What must NOT change:
  - No runtime flag behavior changes.
  - No removal of currently used flags.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_166_feature_flag_rollout_governance.md`
- `codex_tasks/workflow/feature_flag_registry.env` (new)
- `scripts/check_v10_feature_flag_registry.sh` (new)
- `scripts/run_repo_verifications.sh`
- `v10/AI_READ_ME.md`

Out of scope:
- Implementing new flags.
- Environment platform secrets setup.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Registry is source of truth for `NEXT_PUBLIC_*` runtime flags.
  - Guard script compares in-code usage with registry list.
- Compatibility:
  - Script should pass in local and CI shells.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W0
- Depends on tasks:
  - [`task_161`]
- Enables tasks:
  - [`task_166+ all future flag-based cutovers`]
- Parallel group:
  - G0-release
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
- If YES:
  - Execution mode: DELEGATED
  - Delegation chain scope:
    - W0 (`task_162~166`)
  - Assigned roles:
    - Spec-Writer: Codex
    - Spec-Reviewer: Codex
    - Implementer-A: Codex
    - Implementer-B: Codex
    - Implementer-C: Codex
    - Reviewer+Verifier: Codex
  - File ownership lock plan:
    - flag registry + guard script single ownership
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
    - add flag registry and check script
  - [x] Semantic/rule changes:
    - AI_READ_ME governance section update

---

## Acceptance Criteria (Base Required)

- [x] AC-1: feature flag registry file exists and includes all currently used `NEXT_PUBLIC_*` flags.
- [x] AC-2: flag registry check script fails on unknown in-code public flags.
- [x] AC-3: verification runner executes this flag governance check.
- [x] AC-4: end-stage verification passes.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: `scripts/check_v10_feature_flag_registry.sh`
   - Expected result: PASS with listed flags.
   - Covers: AC-1, AC-2

2) Step:
   - Command / click path: `VERIFY_STAGE=end bash scripts/run_repo_verifications.sh`
   - Expected result: includes flag registry check and passes.
   - Covers: AC-3, AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Registry drift if new flags are added without process.
- Roll-back:
  - Revert registry guard and rely on manual flag audit.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - User quote: "오케이. 진행하자. 위임모드 진행!"

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/task_166_feature_flag_rollout_governance.md`
- `codex_tasks/workflow/feature_flag_registry.env`
- `scripts/check_v10_feature_flag_registry.sh`
- `v10/AI_READ_ME.md`

Commands run (only if user asked or required by spec):
- `scripts/check_v10_feature_flag_registry.sh`
- `VERIFY_STAGE=end bash scripts/run_repo_verifications.sh`

## Gate Results (Codex fills)

- Lint:
  - N/A
- Build:
  - N/A
- Script checks:
  - N/A

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
- Registry and in-code usage match at baseline (`used=9`, `registered=9`).
- End-stage verification executed successfully with flag governance gate enabled.

Notes:
- New public flags must be registered in workflow registry before merge.
