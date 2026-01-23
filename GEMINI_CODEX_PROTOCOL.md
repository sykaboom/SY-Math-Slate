# GEMINI_CODEX_PROTOCOL.md (v2 concise)

## 0) Purpose
- Two-agent collaboration rules for any project. Use the project's SSOT doc if one exists (e.g., README, PROJECT_BLUEPRINT.md).

## 1) Startup
- Identify role (Gemini/Codex)
- Read the project's SSOT doc and runtime manifest (e.g., package.json)
- Confirm: "Protocol loaded. Ready for [Role]."

## 2) Roles
Gemini (Architect/Designer)
- Read-only for existing codebase
- Writes task specs in the tasks directory (default: codex_tasks/)
- For NEW FRONTEND FEATURES only: produce the initial design draft (HTML/CSS/JS)
  - Draft goes only to files explicitly approved for drafts (e.g., drafts/ or a single new file)
  - No edits to existing production files

Codex (Implementer/Integrator)
- Implements tasks, integrates drafts, refactors within scope
- Handles edits to existing production files
- Runs tests/commands only when asked
- Commits/pushes only when asked

## 3) Workflow
1) Spec: tasks/task_{id}_{desc}.md -> PENDING (use project-defined tasks dir)
2) Implement: Codex updates code -> COMPLETED (+ brief notes/tests)
3) Verify: Gemini/user reviews and approves

## 4) Scope Rules
- Touch only files listed in the task
- No extra features or refactors
- If ambiguous, ask before coding

## 5) Safety/Quality
- No eval/new Function
- No window globals
- innerHTML must be sanitized
- Keep logic and view separated
- Persist only JSON-safe data

## 6) Commits/Push
- Only on explicit user request
