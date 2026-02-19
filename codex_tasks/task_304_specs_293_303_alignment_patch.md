# Task 304: task_293~303 스펙 정합화 보정

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: root/
Date: 2026-02-19

---

## Goal (Base Required)
- What to change:
  - `task_293~303` 스펙에서 발견된 정합성 오류(스코프/의존성/AC/실행 가능성)를 실제 코드베이스 기준으로 수정
- What must NOT change:
  - 각 태스크의 기능 목표 자체(P0/P1/P2 우선순위)는 유지
  - 구현 코드 변경은 하지 않음 (스펙 문서만 수정)

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_293_host_live_session_wiring.md`
- `codex_tasks/task_295_viewer_pointer_overlay_fix.md`
- `codex_tasks/task_296_student_kiosk_policy_leak.md`
- `codex_tasks/task_297_commandid_registry_validation.md`
- `codex_tasks/task_298_playerbar_mobile_responsive.md`
- `codex_tasks/task_300_safe_area_top_chrome.md`
- `codex_tasks/task_301_theme_hardcode_removal.md`
- `codex_tasks/task_302_ai_module_generation.md`
- `codex_tasks/task_303_scan_guardrails_script.md`

Out of scope:
- 실제 구현 코드 수정
- 새로운 기능 추가

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - 스펙 문서만 수정
- Compatibility:
  - 기존 Wave 순서 제약(`293 -> 296 -> 300`, `294 -> 301`)은 유지

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - HOTFIX-SPEC
- Depends on tasks:
  - []
- Enables tasks:
  - `task_293~303` 구현 착수 품질 게이트 복구
- Parallel group:
  - G-spec-fix
- Max parallel slots:
  - 1
- Verification stage for this task:
  - `mid`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 9
- Files shared with other PENDING tasks:
  - none (spec 문서만)
- Cross-module dependency:
  - NO
- Parallelizable sub-units:
  - 0
- Estimated single-agent duration:
  - ~30min
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - YES
- Rationale:
  - 문서 정합화 작업이므로 단일 실행이 가장 안전

---

## Optional Block A — Layout / SVG Gate

- [x] Applies: NO

---

## Optional Block B — Delegated Execution

- [x] Applies: NO
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

- [ ] AC-1: `task_293` 스코프/의존성/레이아웃 게이트가 실제 코드 경로와 일치
- [ ] AC-2: `task_295/296/297/303` 핵심 정합성 결함이 제거됨
- [ ] AC-3: `task_298/300/301/302` 모호한 구현 분기가 제거되어 단일 구현안으로 고정됨

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: 각 스펙 파일의 Goal/Scope/Dependencies/AC/Manual Verification 라인 점검
   - Expected result: 스코프-AC-실행순서가 모순 없이 연결됨
   - Covers: AC-1, AC-2, AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - 스펙 축소/고정 과정에서 구현 유연성이 줄어들 수 있음
- Roll-back:
  - `git revert <commit>`

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received ("보정하라.")

> Implementation may proceed.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/task_293_host_live_session_wiring.md`
- `codex_tasks/task_295_viewer_pointer_overlay_fix.md`
- `codex_tasks/task_296_student_kiosk_policy_leak.md`
- `codex_tasks/task_297_commandid_registry_validation.md`
- `codex_tasks/task_298_playerbar_mobile_responsive.md`
- `codex_tasks/task_300_safe_area_top_chrome.md`
- `codex_tasks/task_301_theme_hardcode_removal.md`
- `codex_tasks/task_302_ai_module_generation.md`
- `codex_tasks/task_303_scan_guardrails_script.md`

Commands run (only if user asked or required by spec):
- `rg`/`nl` 기반 스펙 정합성 점검 명령

## Gate Results (Codex fills)

- Lint:
  - N/A (spec-only)
- Build:
  - N/A (spec-only)
- Script checks:
  - N/A (spec-only)

## Failure Classification (Codex fills when any gate fails)

- none

Manual verification notes:
- P0 결함 지적 4건(`293/295/297/303`) 반영 완료
- 스코프-의존성-AC 불일치 항목 정합화 완료

Notes:
- 
