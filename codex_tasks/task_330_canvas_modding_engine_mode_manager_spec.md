# Task 330: Canvas Modding Engine + Mode Manager Spec (Read-Only Discovery -> Architecture Contract)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-20

---

## Goal (Base Required)
- What to change:
  - Produce an implementation-ready architecture spec for `Canvas Modding Engine + Mode Manager`.
  - Lock the rule that `Lecture` is not a privileged system path and must be represented as one regular mode (`LectureMode`) under the same contracts as other modes.
  - Document current responsibility boundaries and regression root causes before proposing target architecture.
- What must NOT change:
  - No runtime code changes in `v10/src/**` during this task.
  - No command/policy/store behavior modification.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_330_canvas_modding_engine_mode_manager_spec.md`
- `v10/docs/architecture/ModeEngine.md` (new)

Out of scope:
- Any TS/TSX implementation or refactor in `v10/src/**`.
- Dependency changes.
- Runtime behavior changes.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO (default)
- Boundary rules:
  - Read-only discovery against current codebase.
  - Preserve current authority order and existing architecture guardrails.
- Compatibility:
  - Spec must keep backward-compatibility migration strategy explicit (legacy contracts mapped via bridge/alias, not hard delete in first phase).

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W1-mode-engine-spec
- Depends on tasks:
  - []
- Enables tasks:
  - [`task_331` (mod contracts scaffold), `task_332` (mod manager bridge), `task_333` (lecture mod migration slice)]
- Parallel group:
  - G-spec-architecture
- Max parallel slots:
  - 6 (default)
- Verification stage for this task:
  - `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 1-2 docs
- Files shared with other PENDING tasks:
  - `none`
- Cross-module dependency:
  - YES (analysis across layout/windowing/toolbar/store/commands/policy/mod runtime)
- Parallelizable sub-units:
  - 0
- Estimated single-agent duration:
  - ~35min
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - YES
  - No source code lock contention; docs-only.
- Rationale:
  - Requires single-writer coherence because this is a contract-level design decision document.

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: NO

---

## Optional Block B — Delegated Execution

- [ ] Applies: NO
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
- [x] Structure changes (file/folder add/move/delete):
  - Run `node scripts/gen_ai_read_me_map.mjs`
  - Verify `v10/AI_READ_ME_MAP.md` update if needed
- [x] Semantic/rule changes:
  - Verify `v10/AI_READ_ME.md` update if needed (only if runtime semantics are newly prescribed for future implementation tasks)

---

## Acceptance Criteria (Base Required)

- [x] AC-1:
  - Discovery summary includes required A/B outputs:
    - A) Current-structure diagram: `(layout/windowing) <-> (toolbar) <-> (store/commands) <-> (policy)`
    - B) One-sentence root-cause statement for toolbar/docking regressions.
- [x] AC-2:
  - `v10/docs/architecture/ModeEngine.md` contains all mandatory sections:
    - Terms
    - Goals/Non-goals
    - 4-layer target architecture
    - Mode contract interface
    - ModeManager responsibilities
    - LectureMode criteria
    - Migration phases + AC
    - Testing/regression strategy
    - Open questions (~5).
- [x] AC-3:
  - Dependency direction is explicitly fixed in the spec:
    - `Mode -> ModeContext -> Commands -> Runtime`
    - Mode must not import layout/windowing/store directly.
- [x] AC-4:
  - Single active mode baseline is explicitly chosen for initial rollout, with future extension path noted.
- [x] AC-5:
  - The document is actionable enough to split into concrete implementation tasks without additional reinterpretation.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - Read final `v10/docs/architecture/ModeEngine.md`.
   - Expected result:
     - Includes A/B discovery summary and all mandatory sections.
   - Covers: AC-1, AC-2

2) Step:
   - Command / click path:
     - Inspect dependency rules and pseudocode/interface blocks.
   - Expected result:
     - Clear no-direct-import boundary from Mode to layout/windowing/store.
   - Covers: AC-3

3) Step:
   - Command / click path:
     - Inspect Mode lifecycle/routing chapter.
   - Expected result:
     - Single-active-mode baseline is explicit; extension path for stacked modes is marked as open question/deferred scope.
   - Covers: AC-4

4) Step:
   - Command / click path:
     - Map proposed phases to follow-up task candidates.
   - Expected result:
     - Implementation can be dispatched as independent tasks with minimal ambiguity.
   - Covers: AC-5

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Spec drift from current runtime realities may produce non-executable design.
  - Over-abstract contracts can block practical migration.
- Roll-back:
  - Keep this document as architecture baseline and revise contract sections before downstream implementation tasks start.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (user message: "좋아. 보완된 방향으로 스펙 작성 프로세스 시작해볼까?")

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/task_330_canvas_modding_engine_mode_manager_spec.md`
- `v10/docs/architecture/ModeEngine.md`

Commands run (only if user asked or required by spec):
- `node scripts/gen_ai_read_me_map.mjs --check`
- `bash scripts/check_layer_rules.sh`

## Gate Results (Codex fills)

- Lint:
  - N/A (docs-only)
- Build:
  - N/A (docs-only)
- Script checks:
  - PASS (`check_layer_rules`, `gen_ai_read_me_map --check`)

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - None observed in this task scope.
- Newly introduced failures:
  - None
- Blocking:
  - NO
- Mitigation:
  - N/A

Manual verification notes:
- Verified required sections exist in `v10/docs/architecture/ModeEngine.md`.
- Verified discovery A/B summary included and dependency direction fixed.
- Verified single-active-mode baseline and open questions were captured.

Notes:
- This task intentionally made no runtime code changes under `v10/src/**`.
