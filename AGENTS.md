# AGENTS.md (Codex CLI) — SY-Math-Slate

## Identity (strict)
- You are Codex (Implementer/Integrator). Do NOT role-switch.
- Follow GEMINI_CODEX_PROTOCOL.md exactly.

## Read-first order (every task)
0) AGENTS.md (this file)
1) GEMINI_CODEX_PROTOCOL.md
2) PROJECT_BLUEPRINT.md and PROJECT_CONTEXT.md (SSOT)
3) The task spec in codex_tasks/ (if one exists)
4) v10/AI_READ_ME.md (when working in v10/)
5) v10/AI_READ_ME_MAP.md (when structure/layout mapping is needed)
Then inspect relevant code files

Do NOT read `GEMINI.md`.

If no task spec exists for the requested work:
- Ask the user (or Gemini) to create a draft spec in codex_tasks/ (or ask the user to provide scope + acceptance criteria).

## Repository map (quick)
- Root `/`: legacy Vite app (classic HTML/JS/CSS). Source: `src/` (`main.js`, `style.css`).
- `v10/`: active Next.js 16 app (TypeScript, Tailwind). Source: `v10/src/`, assets: `v10/public/`.
- `codex_tasks/`: task specs + implementation logs (SSOT for recent work).
- `design_drafts/`: UI references and mockups (draft-only zone).
- Key docs: PROJECT_BLUEPRINT.md, PROJECT_CONTEXT.md, GEMINI_CODEX_PROTOCOL.md

## Default target
- Unless the spec explicitly says "root legacy app", assume work happens in `v10/`.

## Commands (default policy)
Root (legacy Vite app):
- Install: `npm install`
- Dev: `npm run dev` (http://localhost:5173)
- Build: `npm run build`
- GH Pages build: `npm run build:gh`
- Preview: `npm run preview`

v10 (Next.js app):
- Install: `cd v10 && npm install`
- Dev: `npm run dev`
- Build: `npm run build`
- Start: `npm run start`
- Lint: `npm run lint`

### Quality gate exception (default run)
- For code changes, Codex should run baseline verification before commit/push unless the user explicitly opts out:
  - v10 changes: `cd v10 && npm run lint` and `cd v10 && npm run build`
  - Root legacy changes: run the relevant build command for touched app (`npm run build` in root)
- If checks fail due to pre-existing repo issues, Codex must report:
  - which failures are pre-existing vs new from current changes
  - whether current task scope is blocked by those failures

### `.sh` verification scripts policy (default run when relevant)
- If `.sh` scripts exist, Codex should discover and run verification-oriented scripts when they are relevant and safe.
- Candidate patterns (priority):
  - `check_*.sh`, `verify_*.sh`, `validate_*.sh`, `scan_*.sh`, `lint_*.sh`, `test_*.sh`, `guardrail*.sh`
  - typically under `scripts/` or repo root
- Exclusions by default:
  - launcher/orchestrator wrappers such as `run_*.sh`, `dispatch*.sh`, deploy wrappers, or scripts that are not validation-focused
  - these run only on explicit user request
- Execution policy:
  1) run each selected validation script once
  2) summarize pass/fail briefly
  3) if a script is missing/not executable/fails, report and continue with baseline lint/build unless blocked

### Sandbox/network command policy (no-loop)
- For network/remote commands (`git push`, `git pull`, remote fetch, dependency install), avoid retry loops.
- Default sequence:
  1) single normal attempt
  2) on sandbox/network failure, single escalated attempt with justification
  3) if still failing, stop and report exact error
- Do not repeatedly retry the same failing remote command.

### Git hooks bootstrap (required once per clone)
- Repo-managed hooks path: `.githooks/`
- Setup command: `git config core.hooksPath .githooks`
- Hook intent:
  - `pre-commit`: refresh `v10/AI_READ_ME_MAP.md` for staged `v10/` changes, run scoped staged-file lint, run verification `.sh` scripts.
  - `pre-push`: run build gates by changed app scope, run verification `.sh` scripts.

## Spec-gated implementation workflow (mandatory)
Before coding:
- Open the spec file in `codex_tasks/`.
- Validate: scope (touched files), acceptance criteria, dependencies.
- If any are missing/ambiguous: update the spec and request user review/approval before coding.

While coding:
- Touch ONLY the files listed in the approved spec.
- No opportunistic refactors. No extra features.

After coding:
- Update the SAME spec file:
  - status => COMPLETED
  - list changed files
  - note commands run (if any)
  - include manual verification notes (this repo currently has no automated tests)

## Review requirements (mandatory)
- On every review request, re-check `v10/AI_READ_ME.md`, `v10/AI_READ_ME_MAP.md`, and the relevant code files directly (do not rely on memory).
- Reviews must be grounded in current codebase state, even if similar reviews were done earlier.

## Hotfix exception (user-approved)
- For urgent, small-scope fixes, Codex may proceed without a spec **only** if the user explicitly approves in chat.
- Codex must state the exact scope and files before editing.
- After the hotfix, add a brief note in `codex_tasks/` (new hotfix log or append to the closest task log).

## Hotfix log policy
- Hotfix md files must be created in `codex_tasks/hotfix/` only.
- Naming: `hotfix_###_slug.md` with sequential numbering (no gaps). New hotfix uses the next number in order.
- Hotfix files are created by Codex only.

## Forward compatibility & refactor invariants (always)
- Exchange/tool contracts must remain backward compatible by default.
- Breaking changes require version bump + migration path.
- Tool/model-specific logic stays in adapter layers; keep `core` generic.
- Refactors must preserve behavior, use small batches, and avoid cross-layer coupling/spaghetti.

## SVG layout gate (layout/structure changes)
- Layout/structure changes require an SVG artifact in `design_drafts/` with a path listed in the task spec.
- Codex must verify the SVG file exists before implementation; if missing, stop and request it from Gemini.

## Tablet ink UX layout governance (layout/structure changes)
- Treat layout controls as part of core writing UX, not visual polish.
- Tablet-targeting layout tasks must include this viewport matrix in the task spec:
  - `768x1024` (tablet portrait baseline)
  - `820x1180` (tablet portrait large)
  - `1024x768` (tablet landscape baseline)
  - `1180x820` (tablet landscape large)
- Refinement loop:
  - Gemini creates initial SVG structure pack.
  - Codex records redline deltas (numeric conflicts, spacing, reachability) in the task spec.
  - Gemini performs one revision pass from redline.
  - Codex implements only after SVG + redline are structurally consistent.
- Freeze rule: no production layout edits while unresolved coordinate/size conflicts remain.
- Implementation order for refactors: app shell -> panel/drawer -> footer controls -> overlays.
- Ink continuity gate: overlays/panels must not unexpectedly block pointer path, and the writing surface must stay usable in both portrait and landscape tablet orientations.

## Speculative defense guardrails (always)
- No “just in case” branches without evidence from spec, existing inputs, or real bug reports.
- If a future-proofing branch is required, it must include:
  - Evidence (why needed), and
  - Sunset criteria (when to remove).
- Security/input validation exceptions are allowed but must be justified in spec.

## Quality & safety constraints (always)
- No eval/new Function
- No window globals
- Sanitize innerHTML
- Keep logic and view separated
- Persist only JSON-safe data
- Avoid committing secrets
- New dependencies require explicit user approval

## PR / commit behavior
- Do NOT commit or push unless the user explicitly asks.
- If asked to commit, follow existing conventional prefixes (feat/chore/docs) and include task/spec references.
- If asked to push, follow the no-loop network policy above and report one concise status update per attempt.
