# Sub-agent One-click Playbook (Codex Orchestration Standard)

Status: ACTIVE
Owner: Codex
Last Updated: 2026-02-17

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

Orchestration mode signal (natural language):
- Max mode ON:
  - "맥스오케스트레이션모드로 해"
  - "맥스모드 켜"
  - "max orchestration mode on"
- Max mode OFF:
  - "기본모드로 돌아가"
  - "맥스모드 꺼"
  - "max orchestration mode off"

---

## 3) Role Set (6 baseline)

- Spec-Writer
- Spec-Reviewer
- Implementer-A
- Implementer-B
- Implementer-C
- Reviewer+Verifier

Role duplication policy (allowed):
- Same role may be called multiple times (`Implementer-A1`, `Implementer-A2`) when tasks are independent.
- Duplicate-role agents must still obey file ownership lock.

Codex remains final decision owner for:
- spec lock
- merge decision
- completion status

Model policy for sub-agents:
- Preferred profile: `gpt-5.3 extremelyhigh`
- If runtime cannot pin this profile, continue with current runtime default (do not block execution).

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
- Respect runtime sub-agent limit (hard max `6` active slots).
- If file ownership conflict exists, convert conflicted nodes to sequential execution.
- Reuse role types across waves; do not keep idle agents pinned.

Dispatch blueprint:
1) Wave-Spec:
   - `Spec-Writer` -> `Spec-Reviewer`
2) Wave-Implement:
   - Up to 3 implementer slots in parallel (`A/B/C` or duplicated role IDs)
3) Wave-Verify:
   - `Reviewer+Verifier` single pass

Slot accounting rules:
- Active slot count must stay `<= 6`.
- New agent launches only when dependency + file-lock constraints are satisfied.
- If verification requires rework, spawn a mini-wave instead of reopening infinite loops.
- Codex must use scheduler-first operation:
  - do not wait for all active agents to finish when any ready node exists
  - collect completions opportunistically and immediately backfill freed slots
  - close completed agents immediately and recycle slots

Recommended dynamic slot profile:
- Start of implementation waves: `4 executors + 2 reviewers`
- High-conflict waves (shared files): `3 executors + 3 reviewers`
- Closeout waves: `2 executors + 4 reviewers`
- If no review work is ready, temporarily use extra executor slots, then rebalance.

Ready-queue operation:
1) compute runnable tasks from approved DAG (all dependencies satisfied)
2) reserve file ownership locks
3) spawn only runnable tasks that do not conflict on files
4) on each completion event, recompute runnable set and refill slots immediately
5) never keep idle slots while runnable, non-conflicting tasks exist

---

## 5.1) Verification Cadence (Bottleneck Control)

To avoid lint/build bottlenecks while preserving safety:
- `mid` verification:
  - run frequently during implementation waves (changed-lint + script checks)
  - preferred cadence: after each mini-wave or significant merge
- `end` verification:
  - run at wave boundaries, release-candidate checkpoints, and before final push
  - avoid running full `end` gate after every small patch unless risk is high

Max mode execution defaults:
- use `mid` as continuous guardrail
- batch patches and run `end` once per logical wave closeout
- if `end` fails, open scoped fix mini-wave and rerun `end` immediately

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

## 9) Agent Heartbeat and Reassignment Safety

Definition of "output":
- any meaningful progress signal, including:
  - intermediate status update
  - command progress log
  - measurable diff growth
  - final completion report
- "no output" is a state-unknown signal, not immediate failure.

Safety-first heartbeat policy:
1) `~90s` no output:
   - send soft status ping only (no termination)
2) `4~6m` no output and no file/diff progress:
   - send second status ping
3) hard termination/reassignment allowed only when all are true:
   - two consecutive unanswered status pings
   - task is not a known long-running operation
   - no lock-critical operation is in progress

Long-running exception classes (do not terminate early):
- lint/build/test suites
- dependency install/update
- large file generation or migration

Reassignment rule:
- if termination criteria are met, release file lock, spawn replacement agent with same scope, and append incident note to task closeout.

---

## 10) Output Contract (Codex -> User)

Final report must include:
- completed task IDs and status
- changed files summary
- gate results (lint/build/scripts)
- failure classification (`pre-existing` vs `new`, `blocking` vs `non-blocking`)
- risks and follow-up recommendations (if any)

Execution report must also include:
- peak/average active slot usage
- number of slot refills after completion events
- number of reassignment events (if any)
- verification cadence summary:
  - how many `mid` and `end` runs occurred
  - where `end` was intentionally deferred for batching
