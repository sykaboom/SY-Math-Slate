# Task 186: LLM Draft Request Workflow

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-15

---

## Goal (Base Required)
- What to change:
  - Implement Input Studio LLM draft request flow that can produce candidate blocks from prompt/raw text.
- What must NOT change:
  - No direct document mutation on request action alone.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_186_llm_draft_request_workflow.md`
- `v10/src/features/editor/input-studio/llm/*`
- `v10/src/features/chrome/layout/DataInputPanel.tsx`
- `v10/src/features/platform/extensions/ui/ExtensionRuntimeBootstrap.tsx`

Out of scope:
- Production provider billing/cost router.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Reuse existing adapter/connector layers.
- Compatibility:
  - Existing non-LLM drafting flow remains fully usable.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W3
- Depends on tasks:
  - [`task_184`]
- Enables tasks:
  - [`task_187`, `task_188`]
- Parallel group:
  - G3-input
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
    - W3 (`task_183~190`)
  - Assigned roles:
    - Spec-Writer: Codex
    - Spec-Reviewer: Codex
    - Implementer-A: sub-agent
    - Implementer-B: sub-agent
    - Implementer-C: sub-agent
    - Reviewer+Verifier: sub-agent + Codex
  - File ownership lock plan:
    - LLM workflow files single-owner
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

---

## Acceptance Criteria (Base Required)

- [x] AC-1: Input Studio can issue LLM draft request through existing adapter/connectors stack.
- [x] AC-2: Request result is stored as candidate draft state and not auto-applied.
- [x] AC-3: lint/build checks pass.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: click LLM draft request action from DataInput panel
   - Expected result: candidate draft appears, canvas remains unchanged
   - Covers: AC-1, AC-2

2) Step:
   - Command / click path: `cd v10 && npm run lint && npm run build`
   - Expected result: PASS
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - Adapter unavailable states may appear as silent failure.
- Roll-back:
  - Gate LLM request controls behind disabled state on adapter lookup failure.

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
- `v10/src/features/editor/input-studio/llm/types.ts`
- `v10/src/features/editor/input-studio/llm/normalizedToDraftBlocks.ts`
- `v10/src/features/editor/input-studio/llm/useInputStudioLlmDraft.ts`
- `v10/src/features/platform/extensions/ui/ExtensionRuntimeBootstrap.tsx`
- `v10/src/features/chrome/layout/DataInputPanel.tsx`

Commands run (only if user asked or required by spec):
- `cd v10 && npm run lint -- --max-warnings=0 -- src/features/chrome/layout/DataInputPanel.tsx src/features/editor/input-studio`
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
  - None
- Newly introduced failures:
  - None
- Blocking:
  - None
- Mitigation:
  - N/A

Manual verification notes:
- Request action now creates candidate-only draft state; no immediate import command is executed until explicit apply/queue action.

Notes:
- Runtime bootstrap now registers `input-studio.llm-draft` tool entry for connector invocation.
