# Task 465: Legacy Path Purge and Program Closeout

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-21

---

## Goal (Base Required)
- What to change:
  - 신규 구조 완전 전환 후 legacy 경로를 제거하고 문서/로드맵/검증 체인을 최종 동기화한다.
- What must NOT change:
  - 사용자 기능 동작 회귀 금지.

---

## Scope (Base Required)

Touched files/directories:
- 삭제 후보(실사용 0 검증 후):
  - `v10/src/core/config/**` (신규 foundation/policies로 100% 이관 시)
  - `v10/src/core/contracts/**`
  - `v10/src/core/engine/**`
  - `v10/src/core/extensions/**`
  - `v10/src/core/migrations/**`
  - `v10/src/core/persistence/**`
  - `v10/src/core/sanitize/**`
  - `v10/src/core/theme/**`, `v10/src/core/themes/**`
  - `v10/src/core/types/**`
  - `v10/src/mod/runtime/**`, `v10/src/mod/templates/**` (packs/bridge/schema 이관 완료 시)
- 문서 동기화:
  - `PROJECT_ROADMAP.md`
  - `v10/AI_READ_ME.md`
  - `v10/docs/architecture/ModEngine.md`
  - `v10/docs/architecture/ModularizationDependencyFlow.md`

Out of scope:
- 신규 기능 개발

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO (default)
- Boundary rules:
  - 삭제는 반드시 `rg` 기반 참조 0 증명 후 진행.
  - 삭제는 stage 단위 커밋으로 수행(대량 일괄 삭제 금지).
- Compatibility:
  - 최종 커밋에서 lint/build/verify 체인 전부 PASS.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - R5
- Depends on tasks:
  - ['task_464']
- Enables tasks:
  - []
- Parallel group:
  - G-CLOSEOUT
- Max parallel slots:
  - 6 (default)
- Verification stage for this task:
  - end

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 20+
- Files shared with other PENDING tasks:
  - docs + scripts + wide tree
- Cross-module dependency:
  - YES
- Parallelizable sub-units:
  - 1
- Estimated single-agent duration:
  - ~60min
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - NO
- Rationale:
  - 대규모 삭제는 순차 검증-삭제-재검증 흐름이 안전하다.

---

## Staged Purge Plan (Mandatory)

- R5A: `v10/src/core/*` legacy 축 purge
  - 후보: `config`, `contracts`, `engine`, `extensions`, `migrations`, `persistence`, `sanitize`, `theme`, `themes`, `types`
  - 규칙: 폴더별로 pre/post 참조 0 증명 후 개별 커밋.
- R5B: `v10/src/mod/runtime`, `v10/src/mod/templates` purge
  - 전제: `src/mod/packs|bridge|schema` + core package bridge가 완전 대체.
- R5C: 문서/로드맵 동기화
  - `PROJECT_ROADMAP.md`, `v10/AI_READ_ME.md`, `ModEngine.md`, `ModularizationDependencyFlow.md`
- R5D: 최종 gate + closeout
  - `check_layer_rules`, `check_mod_contract`, `lint`, `build`, `run_repo_verifications`.

Stage fallback:
- stage 중 하나라도 참조 0 증명이 실패하면 해당 경로 삭제를 보류하고 deferred 목록으로 이관한다(강행 금지).

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: NO

---

## Optional Block B — Delegated Execution

- [ ] Applies: NO
If NO:
- Execution mode: MANUAL

---

## Optional Block C — Hotfix Exception

- [ ] Applies: NO

---

## Optional Block D — Speculative Defense Check

- [ ] Applies: NO

---

## Optional Block E — Documentation Update Check

- [ ] Applies: YES
- If YES:
  - [ ] Structure changes:
    - Run `node scripts/gen_ai_read_me_map.mjs`
    - Verify `v10/AI_READ_ME_MAP.md`
  - [ ] Semantic/rule changes:
    - Verify `v10/AI_READ_ME.md`

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: 삭제된 각 경로마다 pre/post 참조 0 증명 로그가 남는다.
- [ ] AC-2: docs/roadmap/ai-readme가 신규 구조 기준으로 일치한다.
- [ ] AC-3: R5A~R5D stage 커밋/로그가 남고 stage fallback 규칙 위반이 없다.
- [ ] AC-4: end gate(`layer/mod_contract/lint/build/verify`) 전체 PASS.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `rg -n \"@core/(config|contracts|engine|extensions|migrations|persistence|sanitize|theme|themes|types)\" v10/src`
     - `rg -n \"@/mod/(runtime|templates)|src/mod/(runtime|templates)\" v10/src`
   - Expected result:
     - stage별 삭제 대상 참조 0(삭제 전/후 기록 보존).
   - Covers: AC-1

2) Step:
   - Command / click path:
     - `node scripts/gen_ai_read_me_map.mjs --check`
   - Expected result:
     - AI 문서 맵 최신 상태.
   - Covers: AC-2

3) Step:
   - Command / click path:
     - `bash scripts/check_layer_rules.sh && bash scripts/check_mod_contract.sh && cd v10 && npm run lint && npm run build && cd .. && scripts/run_repo_verifications.sh`
   - Expected result:
     - 전체 PASS.
   - Covers: AC-4

4) Step:
   - Command / click path:
     - R5A~R5D stage 로그/커밋 메시지 검토 (deferred 목록 포함)
   - Expected result:
     - stage fallback 위반 없음, 보류 항목은 명시됨.
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - 과삭제 시 런타임/빌드 즉시 붕괴.
- Roll-back:
  - R5 커밋 revert (삭제 복원) 후 재검증.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- Purged legacy core paths:
  - `v10/src/core/config/**`
  - `v10/src/core/contracts/**`
  - `v10/src/core/engine/**`
  - `v10/src/core/extensions/**`
  - `v10/src/core/migrations/**`
  - `v10/src/core/persistence/**`
  - `v10/src/core/sanitize/**`
  - `v10/src/core/theme/**`
  - `v10/src/core/themes/**`
  - `v10/src/core/types/**`
- Purged legacy mod paths:
  - `v10/src/mod/runtime/**`
  - `v10/src/mod/templates/**`
- Closeout docs/tests sync:
  - `PROJECT_ROADMAP.md` (verified; no change required)
  - `v10/AI_READ_ME.md`
  - `v10/docs/architecture/ModEngine.md`
  - `v10/docs/architecture/ModularizationDependencyFlow.md`
  - `v10/tests/**` (path assertions updated to new namespaces)
  - `scripts/**` (verification paths updated)

Commands run (only if user asked or required by spec):
- pre/post purge proof scans:
  - `rg -n \"@core/(config|contracts|engine|extensions|migrations|persistence|sanitize|theme|themes|types)\" v10/src`
  - `rg -n \"@/mod/(runtime|templates)|mod/runtime/templatePackRegistry|mod/templates\" v10/src`
- gates:
  - `bash scripts/check_layer_rules.sh`
  - `bash scripts/check_mod_contract.sh`
  - `cd v10 && npm run lint`
  - `cd v10 && npm run build`
  - `scripts/run_repo_verifications.sh --stage end`
  - `node scripts/gen_ai_read_me_map.mjs`
  - `node scripts/gen_ai_read_me_map.mjs --check`

## Gate Results (Codex fills)

- Lint:
  - PASS
- Build:
  - PASS
- Script checks:
  - PASS

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - None
- Newly introduced failures:
  - Initial `run_repo_verifications` failure due test fixtures referencing removed legacy paths.
- Blocking:
  - NO
- Mitigation:
  - Updated all affected tests/scripts/docs to new path contracts and re-ran full verify to PASS.
