# Task 272: Local Artifact Ignore + Claude Local Settings Untrack

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: root/
Date: 2026-02-17

---

## Goal (Base Required)
- What to change:
  - `repo_study_roadmap.md`를 로컬 메모 아티팩트로 `.gitignore`에 추가한다.
  - `.claude/settings.local.json`을 로컬 전용 파일로 관리하도록 Git 추적에서 제외한다.
- What must NOT change:
  - `CLAUDE.md` 같은 협업 규칙 문서는 유지한다.
  - 앱 런타임 코드(`v10/src/**`)는 변경하지 않는다.

---

## Scope (Base Required)

Touched files/directories:
- `.gitignore` (read/write)
- `.claude/settings.local.json` (git index only: untrack)
- `codex_tasks/task_272_local_artifacts_ignore_and_claude_local_untrack.md` (read/write)

Out of scope:
- Claude/Codex 협업 정책 문서 내용 변경
- 기능 구현 코드 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - 파일 삭제는 로컬 워킹트리에서 수행하지 않고 `git rm --cached`로 추적만 해제한다.
- Compatibility:
  - 다른 환경에서도 `CLAUDE.md` 기반 협업 규칙은 유지된다.

---

## DAG / Wave Metadata (Base Required)

- Wave ID: W-GOV
- Depends on tasks: [task_268]
- Enables tasks: []
- Parallel group: G-governance
- Max parallel slots: 6
- Verification stage for this task: `mid`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count: 2
- Files shared with other PENDING tasks: none
- Cross-module dependency: NO
- Parallelizable sub-units: 0
- Estimated single-agent duration: ~10min
- Recommended mode: MANUAL
- Batch-eligible: YES
  - 다른 문서성 거버넌스 태스크와 병합 가능하나 단독 처리도 충분히 짧다.
- Rationale:
  - `.gitignore`와 index 상태 조정 중심의 단일 저장소 운영 작업이다.

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: NO

If NO:
- Execution mode: MANUAL

---

## Optional Block C — Hotfix Exception

- [x] Applies: NO

---

## Optional Block D — Speculative Defense Check

- [x] Applies: NO

---

## Optional Block E — Documentation Update Check

- [x] Applies: NO

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: `.gitignore`에 `repo_study_roadmap.md` 항목이 추가됨.
- [ ] AC-2: `.gitignore`에 `.claude/settings.local.json` 항목이 추가됨.
- [ ] AC-3: `.claude/settings.local.json`이 Git 추적 대상에서 제외됨.
- [ ] AC-4: `CLAUDE.md`는 추적 유지됨.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: `rg -n "repo_study_roadmap.md|\\.claude/settings\\.local\\.json" .gitignore`
   - Expected result: 두 ignore 규칙이 존재
   - Covers: AC-1, AC-2

2) Step:
   - Command / click path: `git ls-files .claude/settings.local.json CLAUDE.md`
   - Expected result: `CLAUDE.md`만 출력됨
   - Covers: AC-3, AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - 기존에 추적 중이던 로컬 설정 파일의 이력 제거로 팀원 혼선 가능.
- Roll-back:
  - `.gitignore` 되돌리고 `git add .claude/settings.local.json`로 재추적하면 복구 가능.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `.gitignore`
- `.claude/settings.local.json` (index untracked)
- `codex_tasks/task_272_local_artifacts_ignore_and_claude_local_untrack.md`

Commands run (only if user asked or required by spec):
- `git rm --cached .claude/settings.local.json`
- `rg -n "repo_study_roadmap.md|\\.claude/settings\\.local\\.json" .gitignore`
- `git ls-files .claude/settings.local.json CLAUDE.md`

## Gate Results (Codex fills)

- Lint:
  - N/A
- Build:
  - N/A
- Script checks:
  - N/A

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - None
- Newly introduced failures:
  - None
- Blocking:
  - NO
- Mitigation:
  - N/A

Manual verification notes:
- AC-1 PASS: `.gitignore`에 `repo_study_roadmap.md` 추가.
- AC-2 PASS: `.gitignore`에 `.claude/settings.local.json` 추가.
- AC-3 PASS: `git ls-files` 결과에서 `.claude/settings.local.json` 미출력(추적 해제).
- AC-4 PASS: `git ls-files` 결과에서 `CLAUDE.md` 출력(추적 유지).

Notes:
- 저장소 협업 규칙은 `CLAUDE.md`를 통해 유지하고, `settings.local.json`은 환경별 로컬로 분리한다.
