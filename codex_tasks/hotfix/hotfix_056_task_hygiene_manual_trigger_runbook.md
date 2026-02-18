# Hotfix 056: Task Hygiene Manual-Trigger Process

Status: COMPLETED
Date: 2026-02-18

## Context
- User requested practical task-cleanup operation without fake time-based cadence.
- Agent runtimes do not own a real weekly scheduler; cleanup must be user-triggered.

## Scope
- `scripts/task_hygiene_report.sh` (new)
- `AGENTS.md`
- `codex_tasks/_PLAYBOOK_subagent_oneclick.md`
- `codex_tasks/workflow/task_hygiene_runbook.md` (new)

## Root Cause
- Cleanup guidance existed as discussion only; no executable/manual trigger flow.
- Time-based wording (`weekly`) can be misunderstood as automatic behavior.

## Fix
- Added executable inventory script: `scripts/task_hygiene_report.sh`.
- Added natural-language trigger policy in `AGENTS.md`:
  - light cleanup
  - archive-wave cleanup
- Added playbook section for manual hygiene operation.
- Added standalone workflow runbook for repeatable usage.

## Validation
- `scripts/task_hygiene_report.sh` PASS
- `rg -n "Task Hygiene Trigger|task hygiene light|task hygiene archive wave" AGENTS.md` PASS
- `rg -n "Task Hygiene Operation|manual trigger" codex_tasks/_PLAYBOOK_subagent_oneclick.md` PASS
- `test -f codex_tasks/workflow/task_hygiene_runbook.md` PASS

## Result
- Cleanup cadence is now explicit, manual, and trigger-driven.
- Agents can run hygiene consistently without assuming nonexistent wall-clock scheduling.
