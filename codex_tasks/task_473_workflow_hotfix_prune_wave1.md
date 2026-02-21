# Task 473: Workflow/Hotfix Prune Wave 1

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: root/
Date: 2026-02-21

---

## Goal (Base Required)
- What to change:
  - `codex_tasks/workflow`와 `codex_tasks/hotfix`에서 현재 실행/운영에 불필요한 문서를 삭제한다.
- What must NOT change:
  - `scripts/*`가 참조하는 workflow 파일은 삭제하지 않는다.
  - `v10/` 코드 동작 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- Delete targets:
  - workflow obsolete docs:
    - `codex_tasks/workflow/roadmap_70spec_local_ai_mesh_master.md`
    - `codex_tasks/workflow/roadmap_70spec_local_ai_mesh_task_matrix.csv`
    - `codex_tasks/workflow/tablet_pointer_panel_signoff.md`
    - `codex_tasks/workflow/tablet_pointer_panel_signoff.csv`
    - `codex_tasks/workflow/task_hygiene_runbook.md`
  - hotfix noisy historical logs:
    - `codex_tasks/hotfix/hotfix_001_*.md` ~ `hotfix_039_*.md`
- Keep set (must remain):
  - workflow files used by scripts/checklists/budgets
  - hotfix `040~057`
- Spec/update:
  - `codex_tasks/task_473_workflow_hotfix_prune_wave1.md`

Out of scope:
- `codex_tasks/workflow/*.env` 삭제
- `codex_tasks/workflow/release_*` 및 `trust_safety*` 삭제
- hotfix `040~057` 삭제

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - 삭제 후 `scripts`의 workflow 참조 파일 존재 확인 필수
- Compatibility:
  - hygiene/verification 스크립트 정상 실행 유지

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W473
- Depends on tasks:
  - ['task_472']
- Enables tasks:
  - []
- Parallel group:
  - G-task-hygiene-delete-wave2
- Max parallel slots:
  - 6
- Verification stage for this task:
  - mid

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - ~45
- Files shared with other PENDING tasks:
  - none
- Cross-module dependency:
  - NO
- Parallelizable sub-units:
  - 1
- Estimated single-agent duration:
  - ~15min
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - NO
- Rationale:
  - 파일명 범위 기반 삭제라 단일 실행/검증이 가장 안전.

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: NO

---

## Optional Block B — Delegated Execution

- [ ] Applies: NO
If NO:
- Execution mode: MANUAL

---

## Optional Block E — Documentation Update Check

- [ ] Applies: NO

---

## Acceptance Criteria (Base Required)

- [x] AC-1: workflow obsolete 5개 파일 삭제 완료.
- [x] AC-2: hotfix `001~039` 삭제, `040~057` 유지.
- [x] AC-3: scripts에서 참조하는 workflow 파일 존재 검증 PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `for f in codex_tasks/workflow/roadmap_70spec_local_ai_mesh_master.md codex_tasks/workflow/roadmap_70spec_local_ai_mesh_task_matrix.csv codex_tasks/workflow/tablet_pointer_panel_signoff.md codex_tasks/workflow/tablet_pointer_panel_signoff.csv codex_tasks/workflow/task_hygiene_runbook.md; do test ! -f "$f" && echo "deleted: $f"; done`
   - Expected result:
     - 5개 모두 deleted
   - Covers: AC-1

2) Step:
   - Command / click path:
     - `find codex_tasks/hotfix -maxdepth 1 -type f -name 'hotfix_0*.md' | sort`
   - Expected result:
     - `hotfix_040` 이상만 표시
   - Covers: AC-2

3) Step:
   - Command / click path:
     - `node - <<'NODE'\nconst fs=require('fs');\nconst {execSync}=require('child_process');\nconst out=execSync("rg -n 'codex_tasks/workflow/[A-Za-z0-9_./-]+' scripts -o").toString().split(/\\n+/).filter(Boolean).map(s=>s.split(':').slice(2).join(':')).map(s=>s.trim());\nconst refs=[...new Set(out)];\nlet fail=0;\nfor(const p of refs){if(!fs.existsSync(p)){console.log('MISSING',p);fail=1;}}\nif(!fail) console.log('OK');\nprocess.exit(fail);\nNODE`
   - Expected result:
     - `OK`
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - workflow 문서 삭제로 운영 가이드 일부 손실 가능
- Roll-back:
  - 단일 커밋 revert

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- Deleted workflow files:
  - `codex_tasks/workflow/roadmap_70spec_local_ai_mesh_master.md`
  - `codex_tasks/workflow/roadmap_70spec_local_ai_mesh_task_matrix.csv`
  - `codex_tasks/workflow/tablet_pointer_panel_signoff.md`
  - `codex_tasks/workflow/tablet_pointer_panel_signoff.csv`
  - `codex_tasks/workflow/task_hygiene_runbook.md`
- Deleted hotfix files:
  - `codex_tasks/hotfix/hotfix_001_*.md` ~ `codex_tasks/hotfix/hotfix_039_*.md`
- Updated:
  - `codex_tasks/task_473_workflow_hotfix_prune_wave1.md`

Commands run:
- delete execution script (range/path-based)
- workflow delete check (5 files absent)
- hotfix keep-range check (`040~057` only)
- scripts workflow reference existence check
- `scripts/task_hygiene_report.sh`

## Gate Results (Codex fills)

- Lint:
  - N/A (docs-only cleanup)
- Build:
  - N/A (docs-only cleanup)
- Script checks:
  - PASS (`task_hygiene_report`, workflow refs existence)

Manual verification notes:
- hotfix files count: `18` (`040~057`)
- workflow files count: `14`
- scripts-referenced workflow files: all exist (`OK refs 12`)
