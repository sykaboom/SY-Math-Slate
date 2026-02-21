# Task 351: Task Hygiene Light — Status Normalization

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: root/
Date: 2026-02-21

---

## Goal (Base Required)
- What to change:
  - `scripts/task_hygiene_report.sh` 기준으로 상태가 `APPROVED`로 남아있는 완료 태스크를 `COMPLETED`로 정규화한다.
  - 실행 SSOT 혼선을 줄이기 위해 태스크 인벤토리 집계를 정돈한다.
- What must NOT change:
  - 코드/런타임/배포 동작 변경 금지.
  - 파일 이동/삭제(archive-wave) 금지.

---

## Scope (Base Required)

Touched files/directories:
- `codex_tasks/task_247_ingest_gemini_svg_pack_temp_review.md`
- `codex_tasks/task_248_task238_svg_temp_pack_remediation.md`
- `codex_tasks/task_249_promote_task238_svg_pack_to_canonical.md`
- `codex_tasks/task_259_portable_codex_skills_full_sync.md`
- `codex_tasks/task_260_ai_read_me_directory_sync.md`
- `codex_tasks/task_351_task_hygiene_light_status_normalization.md`

Out of scope:
- `codex_tasks/` 내 파일 move/delete
- 새로운 기능 스펙 생성
- hotfix/cleanup 폴더 구조 재배치

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO (default)
- Boundary rules:
  - status 정규화는 실제 구현 로그/산출물이 확인된 태스크만 적용
- Compatibility:
  - 기존 task 문서의 본문/AC/로그 내용은 유지

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - HYGIENE-LIGHT-2026-02-21
- Depends on tasks:
  - []
- Enables tasks:
  - archive-wave 의사결정
- Parallel group:
  - G-doc
- Max parallel slots:
  - 6 (default)
- Verification stage for this task:
  - `mid`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 6
- Files shared with other PENDING tasks:
  - none
- Cross-module dependency:
  - NO (task docs only)
- Parallelizable sub-units:
  - 1
- Estimated single-agent duration:
  - ~10min
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - YES
- Rationale:
  - 문서 상태 필드만 정규화하는 저위험 작업.

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: NO

---

## Optional Block B — Delegated Execution

- [ ] Applies: NO
- Execution mode: MANUAL

---

## Optional Block C — Hotfix Exception

- [ ] Applies: NO

---

## Optional Block D — Speculative Defense Check

- [ ] Applies: NO

---

## Optional Block E — Documentation Update Check

- [ ] Applies: NO

---

## Acceptance Criteria (Base Required)

- [x] AC-1: 산출물 확인 가능한 `APPROVED` 5개 태스크가 `COMPLETED`로 정규화된다.
- [x] AC-2: 변경 범위가 `codex_tasks/` 문서에 한정된다.
- [x] AC-3: `scripts/task_hygiene_report.sh` 재실행 시 pending은 기존과 동일(1), 상태 집계가 개선된다.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `scripts/task_hygiene_report.sh`
   - Expected result:
     - 상태 집계 반영 확인
   - Covers: AC-3

2) Step:
   - Command / click path:
     - 대상 5개 task 파일의 `Status:` 라인 확인
   - Expected result:
     - 모두 `COMPLETED`
   - Covers: AC-1

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - 잘못된 태스크 상태 오인 갱신 가능성
- Roll-back:
  - 해당 5개 파일의 status 라인만 되돌리면 즉시 복구 가능

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/task_247_ingest_gemini_svg_pack_temp_review.md`
- `codex_tasks/task_248_task238_svg_temp_pack_remediation.md`
- `codex_tasks/task_249_promote_task238_svg_pack_to_canonical.md`
- `codex_tasks/task_259_portable_codex_skills_full_sync.md`
- `codex_tasks/task_260_ai_read_me_directory_sync.md`
- `codex_tasks/task_351_task_hygiene_light_status_normalization.md`

Commands run (only if user asked or required by spec):
- `scripts/task_hygiene_report.sh` (before)
- artifact/state verification via `ls`, `cmp -s`, `git log --oneline -- <task-file>`
- `scripts/task_hygiene_report.sh` (after)
- status distribution check via `awk`

## Gate Results (Codex fills)

- Lint:
  - N/A
- Build:
  - N/A
- Script checks:
  - PASS (`scripts/task_hygiene_report.sh`)

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - N/A
- Newly introduced failures:
  - N/A
- Blocking:
  - NO
- Mitigation:
  - N/A

Manual verification notes:
- AC-1 PASS: 5개 대상 태스크 `APPROVED -> COMPLETED` 정규화 완료.
- AC-2 PASS: 변경 파일 모두 `codex_tasks/*.md` 범위.
- AC-3 PASS: hygiene 리포트 기준 `completed` 증가(278 -> 283), `other` 감소(91 -> 86).

Notes:
- 라이트 정리 정책에 따라 파일 이동/삭제는 수행하지 않음.
