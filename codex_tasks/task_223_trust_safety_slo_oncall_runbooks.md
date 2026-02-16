# Task 223: Trust/Safety SLO + Oncall Runbooks

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: root/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Define trust/safety SLO signals and host-visible snapshot endpoint action.
  - Add operational oncall runbook documentation aligned with implemented signals.
- What must NOT change:
  - No external infra dependency additions.
  - No breaking changes to existing APIs.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_223_trust_safety_slo_oncall_runbooks.md`
- `v10/src/core/contracts/community.ts`
- `v10/src/app/api/community/route.ts`
- `codex_tasks/workflow/trust_safety_slo_oncall_runbook.md` (new)
- `v10/AI_READ_ME.md`
- `v10/AI_READ_ME_MAP.md`
- `codex_tasks/workflow/roadmap_70spec_local_ai_mesh_task_matrix.csv`

Out of scope:
- Release gate or purge workflows in W9.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - SLO summary must be computed from existing in-memory community state only.
  - Host-only route for operational metrics.
- Compatibility:
  - Existing route actions stay backward-compatible.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W8
- Depends on tasks:
  - [`task_220`, `task_221`, `task_222`]
- Enables tasks:
  - [`task_224`, `task_225`, `task_226`, `task_227`]
- Parallel group:
  - G8-ops
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

- [x] AC-1: Community API supports host-only `trust-safety-slo` action with deterministic metrics payload.
- [x] AC-2: Runbook doc exists and maps each SLO metric to oncall actions.
- [x] AC-3: End-stage verification suite passes.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: call `trust-safety-slo` action with/without host token.
   - Expected result: host-only access enforced; valid payload on success.
   - Covers: AC-1

2) Step:
   - Command / click path: open runbook markdown.
   - Expected result: metric definitions, thresholds, and response playbook documented.
   - Covers: AC-2

3) Step:
   - Command / click path: `VERIFY_STAGE=end bash scripts/run_repo_verifications.sh`
   - Expected result: PASS
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Metric semantics drift if state model changes without runbook updates.
- Roll-back:
  - Revert SLO route action and runbook additions.

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
- `codex_tasks/workflow/trust_safety_slo_oncall_runbook.md`
- `v10/AI_READ_ME.md`
- `v10/AI_READ_ME_MAP.md`
- `codex_tasks/workflow/roadmap_70spec_local_ai_mesh_task_matrix.csv`
- `codex_tasks/task_223_trust_safety_slo_oncall_runbooks.md`

Commands run (only if user asked or required by spec):
- `node scripts/gen_ai_read_me_map.mjs`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`
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
- Host-only `trust-safety-slo` action responds with validated deterministic summary.
- Runbook now defines SLO metrics, trigger thresholds, and incident response procedure.

Notes:
- Roadmap task matrix rows for `220~223` were marked `COMPLETED`.
