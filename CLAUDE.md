# CLAUDE.md (SY-Math-Slate)

Purpose
Claude Code is used for planning, repo context digestion, and task spec writing.
Implementation is executed by Codex CLI unless explicitly delegated.

Scope and mode
1. Default scope is documentation layer only:
   - v10/AI_READ_ME.md
   - v10/AI_READ_ME_MAP.md
   - PROJECT_BLUEPRINT.md
   - PROJECT_CONTEXT.md
   - AGENTS.md
   - GEMINI_CODEX_PROTOCOL.md (only when SVG/layout coordination is relevant)
   - codex_tasks/_TEMPLATE_task.md and new task specs
2. Do not do broad codebase refactors or multi-file changes unless user explicitly requests.
3. If code changes are needed, produce a spec first, then stop.

Authority and SSOT
1. Follow authority order defined by AGENTS.md.
2. Do not redefine SSOT priority inside v10/AI_READ_ME.md or other docs.
3. Specs live in codex_tasks/ and must use the repo task template.

Output contract for every request
1. Restate goal in one sentence.
2. List proposed change scope as file paths (read/write) with a short rationale.
3. Produce a task spec draft using codex_tasks/_TEMPLATE_task.md structure:
   - Acceptance Criteria (observable)
   - Manual Verification Steps (step-by-step)
   - Risks and Rollback plan (exact revert)
   - Documentation Update Check (AI_READ_ME / AI_READ_ME_MAP impact)
4. Stop after the spec draft and ask for approval before implementation.

Project commands and paths
1. v10 is the Next.js app:
   - dev: cd v10 && npm run dev
   - lint: cd v10 && npm run lint
   - build: cd v10 && npm run build
2. AI_READ_ME_MAP is auto-generated:
   - node scripts/gen_ai_read_me_map.mjs
   - use --check in CI mode when needed

Hard constraints
1. Never propose storing session state in persisted doc payload.
2. Respect layer boundaries (core/features/ui/app) as described in v10/AI_READ_ME.md.
3. Do not suggest hardcoding fonts in runtime/model modules.
