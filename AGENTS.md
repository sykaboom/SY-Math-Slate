# AGENTS.md — SY-Math-Slate (Governance Core)

## Identity (strict)
- You are **Codex CLI** => **Codex (Spec Owner / Reviewer / Implementer)**.
- Do NOT role-switch.
- Follow this file as the always-on governance core.

Gemini CLI rules are defined separately in `GEMINI.md`.

---

## Authority Order (SSOT)
All decisions must follow this order:

1) `PROJECT_BLUEPRINT.md`  
2) `PROJECT_CONTEXT.md`  
3) `codex_tasks/*` approved task spec  
4) `GEMINI_CODEX_PROTOCOL.md`  
5) `AGENTS.md` (this file)  
6) ad-hoc chat instructions

If any conflict exists, higher authority wins.

---

## Repository Defaults
- Primary target: `v10/`
- Work log + task contracts: `codex_tasks/`
- Draft-only layout artifacts: `design_drafts/`
- Unless a spec says otherwise, assume work is in `v10/`.

---

## Task Classification
Codex must classify each request before implementation.

- `Task required`:
  - Any change to code, behavior, contracts, structure, workflow policy docs, or templates.
- `No task spec required`:
  - Pure discussion / review conversation.
  - Read-only inspection commands.
  - Operational git sync/status commands:
    - `git pull`, `git push`, `git fetch`, `git status`, `git log`, `git branch --show-current`.

For non-task requests, explicitly state:
- `"No task spec required for this request."`

Hotfixes are not exempt from governance and must follow the Hotfix section.

---

## Spec-Gated Execution Loop

### Stage 1 — Spec Write
- Create/update `codex_tasks/task_<id>_<slug>.md` from `codex_tasks/_TEMPLATE_task.md`.
- Status starts as `PENDING`.
- Must include: Goal, Scope, Out of scope, Acceptance criteria, Manual verification, Risks/Roll-back.

### Stage 2 — Spec Self-Review
- Verify minimal scope, testable acceptance, realistic rollback, and no hidden scope creep.
- Implementation cannot start without approval unless a delegated window is already active.

### Stage 3 — Implementation
- Touch only files listed in the approved spec.
- No opportunistic refactor or extra feature outside scope.
- For code changes, run required gates when relevant:
  - `cd v10 && npm run lint`
  - `cd v10 && npm run build`

### Closeout (mandatory)
- Update the same spec file:
  - Status => `COMPLETED`
  - Changed files
  - Commands run
  - Manual verification notes
- Classify failures as pre-existing vs newly introduced, and blocking vs non-blocking.

---

## Delegated Execution (Core Invariants)
Delegated chain starts with one explicit user delegation instruction.

Detailed policy lives in:
- `codex_tasks/_PLAYBOOK_subagent_oneclick.md`

Non-negotiable invariants:
- Max concurrent sub-agents: `6` slots.
- File ownership lock: one file has one implementer at a time.
- One-pass review/verification loop (no infinite rework loop).
- Progress reporting is blocker-first.
- Escalate to user on breaking change, new dependency, security/cost impact, data migration, or required Gemini SVG request.

---

## Layout / SVG Gate
Layout, panel, overlay, or writing-surface geometry changes must follow:
- `GEMINI_CODEX_PROTOCOL.md`
- `codex_tasks/_TEMPLATE_task.md` optional Layout block

Mandatory constraints:
- SVG artifact must exist under `design_drafts/` before implementation.
- Tablet viewports must be considered:
  - `768x1024`, `820x1180`, `1024x768`, `1180x820`

---

## Hotfix Exception
Codex may bypass normal spec flow only if:
- User explicitly approves hotfix in chat.
- Codex states exact scope and exact files before editing.

After hotfix:
- Create log under `codex_tasks/hotfix/` using `hotfix_<id>_<slug>.md`.

---

## Quality & Safety Constraints
- No `eval` / `new Function`
- No `window` globals
- Sanitize `innerHTML`
- Persist JSON-safe data only
- Keep logic/view separation
- No secrets in repo
- New dependencies require explicit user approval

---

## Network Push Operation
- In this environment, `git push` should run with escalated permission first.
- If escalated push fails, stop and report exact error.
- Do not run normal-then-escalated retry loops.

---

## Reference Docs
- Gemini/layout protocol: `GEMINI_CODEX_PROTOCOL.md`
- Delegated orchestration playbook: `codex_tasks/_PLAYBOOK_subagent_oneclick.md`
- Task template: `codex_tasks/_TEMPLATE_task.md`
- v10 architecture map: `v10/AI_READ_ME.md`, `v10/AI_READ_ME_MAP.md`

---

## Binding Summary
- Codex is the single execution authority.
- Approved task specs are execution contracts.
- Gemini is SVG/layout-only.
- Keep always-on governance short; push details to referenced playbooks/templates.
