# Task 103: Sync local Codex skills for 6-subagent workflow

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: root/
Date: 2026-02-10

---

## Goal
- What to change:
  - Sync repository skill source (`codex_skills/`) into local runtime path (`~/.codex/skills`) so the 6-subagent workflow skills are available locally.
- What must NOT change:
  - Do not edit application source under `v10/`.
  - Do not modify workflow logic files (`AGENTS.md`, `GEMINI_CODEX_PROTOCOL.md`, scripts contents).
  - Do not install external dependencies.

---

## Scope (Codex must touch ONLY these)

Touched files/directories:
- `codex_tasks/task_103_sync_local_skills_for_subagent_workflow.md`
- `/home/sykaboom/.codex/skills/sy-slate-architecture-guardrails.skill`
- `/home/sykaboom/.codex/skills/sy-slate-crossapp-exchange/`
- `/home/sykaboom/.codex/skills/sy-slate-protocol-compat/`
- `/home/sykaboom/.codex/skills/sy-slate-render-sandbox/`
- `/home/sykaboom/.codex/skills/sy-slate-spec-batch-factory/`
- `/home/sykaboom/.codex/skills/sy-slate-subagent-orchestration/`
- `/home/sykaboom/.codex/skills/sy-slate-tool-registry-mcp/`

Out of scope:
- Any path under `/home/sykaboom/.codex/` except listed runtime skill entries
- All source code and docs changes under `v10/` and root project files
- Recreating `.system/skill-installer` or `.system/skill-creator`

---

## Design Artifacts (required for layout/structure changes)

- [ ] Layout / structure changes included: NO
- [ ] SVG path in `design_drafts/`: N/A
- [ ] SVG includes explicit `viewBox` (width / height / ratio label): N/A
- [ ] Tablet viewports considered (if applicable): N/A
- [ ] Codex must verify SVG file exists before implementation: N/A

---

## Dependencies / Constraints

- New dependencies allowed: NO
- Boundary rules:
  - Use existing script only: `scripts/sync_codex_skills.sh`.
  - Apply sync only once after approval.
- Compatibility:
  - Existing single-Codex fallback remains unchanged.

---

## Speculative Defense Check (guardrail)

- [ ] Any defensive branches added: NO
- If YES:
  - Evidence (real input, spec, or bug report):
    - N/A
  - Sunset criteria (when and how to remove):
    - N/A

---

## Documentation Update Check

- [ ] Structure changes (file/folder add/move/delete):
  - N/A (runtime local sync only)
- [ ] Semantic / rule changes (layers, invariants, core flows):
  - N/A

---

## Acceptance Criteria (must be testable)

- [x] AC-1: `scripts/sync_codex_skills.sh --apply` completes successfully.
- [x] AC-2: 6 workflow skill directories exist in `~/.codex/skills/` with `SKILL.md` present:
  - `sy-slate-crossapp-exchange`
  - `sy-slate-protocol-compat`
  - `sy-slate-render-sandbox`
  - `sy-slate-spec-batch-factory`
  - `sy-slate-subagent-orchestration`
  - `sy-slate-tool-registry-mcp`
- [x] AC-3: `sy-slate-architecture-guardrails.skill` exists in `~/.codex/skills/`.
- [x] AC-4: No files under `v10/` are modified.

---

## Manual Verification Steps (since no automated tests)

1) Step:
   - Command / click path: `bash scripts/sync_codex_skills.sh --apply`
   - Expected result: sync apply logs + `Done. Synced entries: 7`
   - Covers: AC-1

2) Step:
   - Command / click path: `find ~/.codex/skills -maxdepth 2 -type f -name 'SKILL.md' | rg 'sy-slate-(crossapp-exchange|protocol-compat|render-sandbox|spec-batch-factory|subagent-orchestration|tool-registry-mcp)'`
   - Expected result: 6개 경로 확인
   - Covers: AC-2

3) Step:
   - Command / click path: `ls -la ~/.codex/skills/sy-slate-architecture-guardrails.skill`
   - Expected result: 파일 존재
   - Covers: AC-3

4) Step:
   - Command / click path: `git -C /home/sykaboom/SY-Math-Slate status --short -- v10`
   - Expected result: 출력 없음
   - Covers: AC-4

---

## Risks / Roll-back Notes

- Risks:
  - Runtime skills overwrite될 수 있어 기존 개인 커스텀 로컬 스킬이 있다면 대체됨.
- Roll-back:
  - `~/.codex/skills/sy-slate-*` entries 삭제 후 필요 시 백업본 복원.

---

## Approval Gate (mandatory)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (e.g. "승인: 진행")

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `/home/sykaboom/.codex/skills/sy-slate-architecture-guardrails.skill`
- `/home/sykaboom/.codex/skills/sy-slate-crossapp-exchange/`
- `/home/sykaboom/.codex/skills/sy-slate-protocol-compat/`
- `/home/sykaboom/.codex/skills/sy-slate-render-sandbox/`
- `/home/sykaboom/.codex/skills/sy-slate-spec-batch-factory/`
- `/home/sykaboom/.codex/skills/sy-slate-subagent-orchestration/`
- `/home/sykaboom/.codex/skills/sy-slate-tool-registry-mcp/`
- `codex_tasks/task_103_sync_local_skills_for_subagent_workflow.md`

Commands run (only if user asked or required by spec):
- `ls -1 codex_skills | sort`
- `bash scripts/sync_codex_skills.sh --dry-run`
- `bash scripts/sync_codex_skills.sh --apply` (sandbox permission denied 1회 후 escalated 재실행)
- `find /home/sykaboom/.codex/skills -maxdepth 2 -type f -name 'SKILL.md' | rg 'sy-slate-(crossapp-exchange|protocol-compat|render-sandbox|spec-batch-factory|subagent-orchestration|tool-registry-mcp)' | sort`
- `ls -la /home/sykaboom/.codex/skills/sy-slate-architecture-guardrails.skill`
- `git -C /home/sykaboom/SY-Math-Slate status --short -- v10`

Manual verification notes:
- AC-1: Passed. `Done. Synced entries: 7` 확인.
- AC-2: Passed. 6개 workflow skill의 `SKILL.md` 경로 확인.
- AC-3: Passed. `sy-slate-architecture-guardrails.skill` 파일 존재 확인.
- AC-4: Passed. `git status --short -- v10` 출력 없음.

Notes:
- User stated workflow was updated to define 6 sub-agents.
- `.system/skill-installer`는 미복구 상태이며, 본 태스크 범위 밖으로 유지.
