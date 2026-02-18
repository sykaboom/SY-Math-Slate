# Task Hygiene Runbook

Status: ACTIVE
Owner: Codex

## Purpose
Keep `codex_tasks/` readable for planning agents while preserving execution traceability.

## Trigger Model (Manual)
There is no time scheduler. Run only when user requests.

Supported trigger intent:
- Light cleanup: `태스크 라이트 정리해` / `task hygiene light`
- Archive wave: `태스크 아카이브 웨이브 실행` / `task hygiene archive wave`

## Step 1: Inventory Report (mandatory)
Run:

```bash
scripts/task_hygiene_report.sh
```

Optional strict gate:

```bash
scripts/task_hygiene_report.sh --strict
```

Env overrides (optional):
- `TASK_HYGIENE_PENDING_WARN` (default: 20)
- `TASK_HYGIENE_SUPERSEDED_WARN` (default: 30)
- `TASK_HYGIENE_BATCH_KEEP` (default: 2)

## Step 2A: Light Cleanup (default)
Actions:
- strengthen ARCHIVE/SUPERSEDED headers
- add SSOT pointers to active sources
- do not move/delete files

Use when:
- pending/superseded counts are growing
- planning tools show context noise

## Step 2B: Archive Wave (explicit approval required)
Actions may include:
- moving old batch plans/superseded tasks under archive path
- deleting non-authoritative duplicates

Guards:
- explicit user approval in chat
- keep roadmap SSOT (`PROJECT_ROADMAP.md`) and task SSOT (`codex_tasks/task_*.md`) obvious
- write a task/hotfix log

## Completion Criteria
- report executed and attached in log
- SSOT pointers remain explicit
- no ambiguity about executable vs historical docs
