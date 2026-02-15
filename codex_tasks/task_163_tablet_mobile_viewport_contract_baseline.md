# Task 163: Tablet Mobile Viewport Contract Baseline

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Establish canonical viewport contract constants for tablet/mobile-first development.
  - Add a contract check script to prevent accidental removal of baseline viewport sets.
- What must NOT change:
  - No visual/layout redesign in this task.
  - No runtime behavior change in layout rendering.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_163_tablet_mobile_viewport_contract_baseline.md`
- `v10/src/core/config/viewportContract.ts` (new)
- `scripts/check_v10_viewport_contract.sh` (new)
- `scripts/run_repo_verifications.sh`
- `v10/AI_READ_ME.md`

Out of scope:
- AppLayout or DataInputPanel refactors.
- Mobile UX polishing.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Contract file must be pure config and import-safe (`core` level).
  - Verification script must check presence and required IDs only.
- Compatibility:
  - Future tasks can import contract without changing runtime flow.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W0
- Depends on tasks:
  - [`task_161`]
- Enables tasks:
  - [`task_207`, `task_208`, `task_211`]
- Parallel group:
  - G0-platform
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
    - W0 (`task_162~166`)
  - Assigned roles:
    - Spec-Writer: Codex
    - Spec-Reviewer: Codex
    - Implementer-A: Codex
    - Implementer-B: Codex
    - Implementer-C: Codex
    - Reviewer+Verifier: Codex
  - File ownership lock plan:
    - viewport contract config + verification script owned by single implementer
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
    - add core config and script
  - [x] Semantic/rule changes:
    - add viewport contract guidance in AI_READ_ME

---

## Acceptance Criteria (Base Required)

- [x] AC-1: `v10/src/core/config/viewportContract.ts` defines required tablet baseline viewports (768x1024, 820x1180, 1024x768, 1180x820).
- [x] AC-2: contract includes mobile baseline profile list.
- [x] AC-3: `scripts/check_v10_viewport_contract.sh` verifies required viewport IDs and passes.
- [x] AC-4: verification runner executes viewport contract check.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: `scripts/check_v10_viewport_contract.sh`
   - Expected result: PASS with required viewport ids found.
   - Covers: AC-1, AC-2, AC-3

2) Step:
   - Command / click path: `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh`
   - Expected result: includes viewport contract check and passes.
   - Covers: AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Contract becoming stale if later tasks bypass it.
- Roll-back:
  - Revert contract + script and restore previous workflow.

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
- `codex_tasks/task_163_tablet_mobile_viewport_contract_baseline.md`
- `v10/src/core/config/viewportContract.ts`
- `scripts/check_v10_viewport_contract.sh`
- `v10/AI_READ_ME.md`
- `v10/AI_READ_ME_MAP.md`

Commands run (only if user asked or required by spec):
- `scripts/check_v10_viewport_contract.sh`
- `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh`
- `node scripts/gen_ai_read_me_map.mjs`

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
- Required tablet viewport IDs and mobile baseline entries are present in core contract config.
- Contract check runs in standalone and verification bundle paths.

Notes:
- Baseline contract is additive and non-invasive; runtime layout behavior is unchanged in this task.
