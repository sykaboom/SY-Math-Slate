# Sub-agent One-click Playbook (Codex Orchestration Standard)

Status: ACTIVE
Owner: Codex
Last Updated: 2026-02-09

---

## 1) Purpose

Define a repeatable one-click execution mode where the user delegates a scoped task chain and Codex orchestrates sub-agents end-to-end.

This playbook does not replace task specs. It standardizes how execution is delegated.

---

## 2) Input Contract (User -> Codex)

Required input:
- business goal
- priority
- constraints (scope, risk tolerance, deadlines)
- delegation signal for a bounded chain

Optional input:
- preferred ordering between task IDs
- release target (local only, push, deploy check)

Example delegation signal:
- "승인. task_090~093 위임 실행."

---

## 3) Role Set (6 baseline)

- Spec-Writer
- Spec-Reviewer
- Implementer-A
- Implementer-B
- Implementer-C
- Reviewer+Verifier

Codex remains final decision owner for:
- spec lock
- merge decision
- completion status

---

## 4) Pipeline (normative)

1) Spec-Writer drafts spec(s) from input contract.
2) Spec-Reviewer checks scope, acceptance, rollback, and ambiguity.
3) Codex locks spec(s) and starts execution if escalation is not required.
4) Implementer-A/B/C run parallel branches with file ownership lock.
5) Reviewer+Verifier runs one review/verification pass.
6) Codex resolves findings, classifies failures, and publishes final report.

Progress reporting policy:
- blocker-only updates during execution
- one final management report after closeout

---

## 5) Parallelism Rules (DAG + wave operation)

- Build a dependency DAG from approved specs.
- Run independent nodes in parallel waves.
- Respect runtime sub-agent limit (baseline 6).
- If file ownership conflict exists, convert conflicted nodes to sequential execution.
- Reuse role types across waves; do not keep idle agents pinned.

---

## 6) Escalation Conditions (Codex -> User)

Codex must pause and request confirmation if any condition appears:
- breaking change
- new dependency
- security or cost policy impact
- data migration requirement
- layout task requiring Gemini SVG draft request

No escalation means Codex continues inside the approved delegation window.

---

## 7) Gemini Bridge Rule (layout tasks only)

Gemini is SVG-only.

Flow:
1) Codex prepares SVG request packet.
2) User relays packet to Gemini.
3) Gemini returns one SVG draft.
4) Codex implements from the draft with internal redlines.

No iterative Gemini regeneration loop is required by default.

---

## 8) Fallback Mode

If sub-agent runtime is disabled or unavailable:
- switch to single Codex execution immediately
- keep same spec gates, scope control, and escalation policy
- continue without redesigning the task plan

---

## 9) Output Contract (Codex -> User)

Final report must include:
- completed task IDs and status
- changed files summary
- gate results (lint/build/scripts)
- failure classification (`pre-existing` vs `new`, `blocking` vs `non-blocking`)
- risks and follow-up recommendations (if any)

