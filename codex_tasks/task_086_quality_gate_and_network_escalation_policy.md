# Task 086: Quality Gate + Network Escalation Policy Clarification

Status: COMPLETED
Owner: Codex
Target: repo policy docs
Date: 2026-02-07

## Goal
- What to change:
  - Clarify default verification behavior so Codex runs baseline checks (`lint`, `build`) for code changes.
  - Clarify sandbox/network behavior so remote commands do not retry in loops.
  - Define a single-attempt + escalate-once flow for `git push` and similar remote commands.
  - Add a policy to run relevant verification `.sh` scripts when present.
- What must NOT change:
  - No production code changes.
  - No dependency changes.
  - No layout/spec protocol changes outside operation policy wording.

## Scope (Codex must touch ONLY these)
- `AGENTS.md`
- `codex_tasks/task_086_quality_gate_and_network_escalation_policy.md`

## Acceptance criteria
- [x] `AGENTS.md` explicitly allows default `lint` + `build` quality gates for code changes.
- [x] `AGENTS.md` explicitly defines no-loop policy for remote/network commands in sandbox.
- [x] `AGENTS.md` explicitly defines one retry path via escalation for push-like commands.
- [x] `AGENTS.md` explicitly defines `.sh` verification script discovery/execution/exclusion policy.
- [x] Scope is limited to policy docs only.

## Risks / notes
- Risk: wording conflict with existing "do NOT run unless explicitly asked" command policy.
- Mitigation: add a narrow exception for quality gates and a clear network retry policy.

---

## Implementation Log (Codex fills)
Status: COMPLETED
Changed files:
- `codex_tasks/task_086_quality_gate_and_network_escalation_policy.md`
- `AGENTS.md`

Commands run:
- `rg --files -g '*.sh'`
- `sed -n '1,260p' AGENTS.md`
- `git status --short`

Notes:
- Docs-only policy update completed.
- `.sh` scan result at update time:
  - `oc_tools/run_codex.sh`
  - `oc_tools/run_gemini.sh`
  - `oc_tools/dispatch.sh`
- No verification-oriented `.sh` scripts were found in this scan set.
