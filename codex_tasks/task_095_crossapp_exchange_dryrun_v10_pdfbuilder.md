# Task 095: Cross-App Exchange Dryrun (v10 -> pdf-builder Adapter Path)

Status: PARKED
Owner: Codex (spec / review / implementation)
Target: v10/ + cross-app validation docs
Date: 2026-02-09
Parking note: 2026-02-09 기준 비블로커로 분류. `task_090~093` 완료 후 재검토.

---

## Goal
- What to change:
  - v10 기준 draft 계약(`NormalizedContent`, optional `RenderPlan`, `TTSScript`)의 교환 가능성을 dryrun으로 검증한다.
  - `v10 -> exchange payload -> pdf-builder adapter(시뮬레이션) -> exchange payload -> v10` 왕복 경로에서 필드 손실/변형을 계량화한다.
  - freeze gate 판단에 사용할 증거 리포트를 남긴다.
- What must NOT change:
  - pdf-builder 저장소 직접 수정 금지.
  - v1 freeze 확정 금지.
  - 신규 dependency 추가 금지.
  - UI/layout 변경 금지.

---

## Scope (Codex must touch ONLY these)

Touched files/directories:
- `codex_tasks/task_095_crossapp_exchange_dryrun_v10_pdfbuilder.md`
- `codex_tasks/reports/task_095_crossapp_exchange_dryrun_report.md` (new)
- `v10/src/core/contracts/fixtures/index.ts` (if fixture entry aggregation needed)
- `v10/src/core/contracts/migrationGuard.ts` (if dryrun classification helper reuse needed)
- `v10/src/core/export/exportPipeline.ts` (if deterministic export hook needed for dryrun)

Out of scope:
- `math-pdf-builder-codex` 코드 직접 변경
- 실 MCP/네트워크 호출
- `v10/src/features/**` UI/상호작용 수정
- 실제 사용자 데이터 마이그레이션 실행

---

## Design Artifacts (required for layout/structure changes)
- [x] Layout / structure changes included: NO
- [x] SVG path in `design_drafts/`: N/A
- [x] SVG includes explicit `viewBox`: N/A
- [x] Tablet viewports considered (if applicable): N/A
- [x] Codex must verify SVG file exists before implementation: N/A

---

## Dependencies / Constraints
- New dependencies allowed: NO
- Preconditions:
  - `task_091` (slice2 contract) 완료 권장
  - `task_094` (fixture + migration guard) 완료 권장
- Must align with:
  - `codex_tasks/task_071_mcp_ready_content_pipeline_spec.md`
  - `codex_tasks/task_085_crossapp_contract_provisional_freeze_policy.md`
  - `PROJECT_CONTEXT.md` (v10 lead, pdf-builder adapter follow)
- Boundary rules:
  - canonical exchange payload는 `NormalizedContent` 기준
  - `RenderPlan`은 optional로 취급
  - 앱 특화 필드는 payload 본체에 삽입 금지
- Compatibility:
  - breaking 징후 발견 시 version bump + migration 필요 항목으로 명시

---

## Dryrun Dataset / Method
Dataset minimum:
- Case A: `text + math`
- Case B: `text + media(imageRef)`
- Case C: `text + math + tts segments` (optional render hints 포함)

Path:
1) v10 source representation -> exchange payload
2) pdf-builder adapter simulation import
3) simulation export -> exchange payload
4) v10 re-import simulation

Evaluation axes:
- `preserved` (동일 유지)
- `degraded` (의미 유지, 표현 축소)
- `dropped` (정보 유실)
- `unknown` (현 단계 판정 불가)

---

## Speculative Defense Check
- [x] Any defensive branches added: NO
- [x] Evidence provided: YES (`task_085` freeze gate에 round-trip 검증 요구)
- [x] Sunset criteria: YES (v1 freeze 완료 후 dryrun을 회귀 체크로 축소)

---

## Documentation Update Check
- [ ] Structure changes:
  - `codex_tasks/reports/` 신규 파일 생성 시 구조 반영 필요성 검토
  - `node scripts/gen_ai_read_me_map.mjs` (v10 구조 변경이 발생한 경우만)
- [ ] Semantic / rule changes:
  - `v10/AI_READ_ME.md` 업데이트 필요성 검토 (flow 변경 시만)

---

## Acceptance Criteria (must be testable)
- [ ] AC-1: dryrun report 파일이 생성되고 3개 케이스(A/B/C)를 모두 포함한다.
- [ ] AC-2: 케이스별 field-level matrix(`preserved/degraded/dropped/unknown`)가 기록된다.
- [ ] AC-3: freeze gate 관점의 결론(`ready / not-ready`)과 blocker 목록이 명시된다.
- [ ] AC-4: 발견된 breaking 후보에 대해 `version/migration` 권고가 명시된다.
- [ ] AC-5: scope 외 파일 수정이 없다.

---

## Manual Verification Steps
1) Report 존재 확인
   - Command / path: `ls -1 codex_tasks/reports | rg 'task_095_crossapp_exchange_dryrun_report\\.md'`
   - Expected result: report 파일 존재
   - Covers: AC-1

2) 케이스/매트릭스 확인
   - Command / path: `rg -n "Case A|Case B|Case C|preserved|degraded|dropped|unknown" codex_tasks/reports/task_095_crossapp_exchange_dryrun_report.md`
   - Expected result: 케이스 및 판정 축 모두 존재
   - Covers: AC-1, AC-2

3) Freeze gate 결론 확인
   - Command / path: `rg -n "ready|not-ready|blocker|migration|version bump" codex_tasks/reports/task_095_crossapp_exchange_dryrun_report.md`
   - Expected result: 결론 및 후속 액션 제시
   - Covers: AC-3, AC-4

4) Scope 확인
   - Command / path: `git diff --name-only`
   - Expected result: spec/report 및 scope 내 파일만 변경
   - Covers: AC-5

---

## Risks / Roll-back Notes
- Risks:
  - 실제 pdf-builder 코드 실행 없이 시뮬레이션만 수행하면 일부 리스크가 숨을 수 있음
  - fixture 품질이 낮으면 dryrun 결론 신뢰도 저하
- Roll-back:
  - 리포트 산출물은 독립 문서이므로 파일 단위 revert 가능
  - 코드 변경이 섞일 경우 dryrun 보조 코드와 리포트를 커밋 분리해 선택 revert 가능

---

## Approval Gate (mandatory)
- [x] Spec self-reviewed by Codex
- [ ] Explicit user approval received (e.g. "승인: 진행")

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)
Status: PARKED

Changed files:
- `codex_tasks/task_095_crossapp_exchange_dryrun_v10_pdfbuilder.md`

Commands run:
- `sed -n '1,220p' /home/sykab/.codex/skills/sy-slate-crossapp-exchange/SKILL.md`
- `sed -n '1,240p' /home/sykab/.codex/skills/sy-slate-protocol-compat/SKILL.md`
- `sed -n '1,260p' codex_tasks/task_094_contract_fixtures_and_migration_guard.md`

Manual verification notes:
- Spec stage only. Implementation not started.

Notes:
- 본 태스크는 cross-repo 코드 변경이 아니라, freeze gate 판단을 위한 증거 수집 태스크다.
