# Hotfix 054: Gemini Optional Invocation Policy

Status: COMPLETED
Date: 2026-02-17

## Context
- Workflow bottleneck was repeatedly caused by mandatory Gemini SVG flow on routine layout/UI work.
- User requested Gemini to remain available for high-value spatial tasks only, not as default workflow gate.

## Scope
- `AGENTS.md`
- `codex_tasks/_PLAYBOOK_subagent_oneclick.md`
- `GEMINI_CODEX_PROTOCOL.md`

## Root Cause
- Governance docs treated Gemini bridge as effectively mandatory for layout tasks.
- That created unnecessary blocking on many low-risk UI iterations.

## Fix
- Updated governance to make Gemini invocation **optional by default (OFF)**.
- Added explicit invocation triggers:
  - high-complexity spatial/geometry problem
  - repeated blocker after 2 Codex attempts
  - explicit user request
- Added invocation limits:
  - max 1 Gemini round per wave
  - max 1 revision pass
- Clarified non-trigger cases (simple color/spacing/typography and routine placement).
- Kept SVG contract strict **when Gemini is invoked**.

## Validation
- `rg -n "Layout / SVG Gate \\(Gemini Optional\\)|Default: OFF|max 1 Gemini round per wave" AGENTS.md codex_tasks/_PLAYBOOK_subagent_oneclick.md` PASS
- `rg -n "invocation is optional \\(default OFF\\)|when invoked" GEMINI_CODEX_PROTOCOL.md` PASS

## Result
- Gemini remains available for 3D/수학/물리형 고난도 공간 문제 while no longer blocking normal implementation waves.
