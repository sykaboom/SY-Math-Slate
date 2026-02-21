# Task 461: Core Namespace Scaffold and Compatibility Shims

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-21

---

## Goal (Base Required)
- What to change:
  - 제안된 코어 네임스페이스(`foundation/runtime/domain/pipelines/ui/security`)를 먼저 스캐폴딩하고, 기존 경로와의 호환 shims(re-export)를 구축한다.
- What must NOT change:
  - 기능 동작/런타임 로직 변경 금지.
  - 기존 import 경로를 즉시 제거하지 않는다.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/foundation/**`
- `v10/src/core/runtime/**`
- `v10/src/core/domain/**`
- `v10/src/core/pipelines/**`
- `v10/src/core/ui/theming/**`
- `v10/src/core/security/sanitization/**`
- `v10/src/core/**/index.ts` (re-export shim)
- `v10/docs/architecture/ModEngine.md`

Out of scope:
- `features/**` import cutover
- `src/mod/**` packs/bridge/schema cutover
- legacy 경로 삭제

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO (default)
- Boundary rules:
  - 기존 레이어 규칙(`check_layer_rules`, `check_mod_contract`) 통과 유지.
  - shim은 순수 re-export만 허용 (로직 추가 금지).
- Compatibility:
  - 기존 경로를 사용하는 코드가 모두 그대로 컴파일되어야 한다.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - R1
- Depends on tasks:
  - []
- Enables tasks:
  - ['task_462']
- Parallel group:
  - G-CORE-RELAYOUT
- Max parallel slots:
  - 6 (default)
- Verification stage for this task:
  - end

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 20+
- Files shared with other PENDING tasks:
  - none (R1 단독 선행)
- Cross-module dependency:
  - YES
- Parallelizable sub-units:
  - 3
- Estimated single-agent duration:
  - ~45min
- Recommended mode:
  - DELEGATED
- Batch-eligible:
  - NO (R1 단독 선행)
- Rationale:
  - 폴더/엔트리포인트 생성은 병렬 가능하지만 최종 정합성 검증은 단일 통합이 필요하다.

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: NO

---

## Optional Block B — Delegated Execution

- [ ] Applies: YES
- Execution mode: DELEGATED
- Delegation chain scope:
  - `task_461` only
- Assigned roles:
  - Spec-Writer: Codex
  - Spec-Reviewer: Codex
  - Implementer-A: subagent
  - Implementer-B: subagent
  - Implementer-C: subagent
  - Reviewer+Verifier: subagent
- File ownership lock plan:
  - one file, one implementer
- Parallel slot plan:
  - up to 6 active slots

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

- [ ] AC-1: 신규 core 네임스페이스 폴더 트리가 생성되고 public entrypoint(index) 기준으로 접근 가능.
- [ ] AC-2: 기존 경로 import를 깨지 않도록 호환 shim이 제공된다.
- [ ] AC-3: lint/build/guardrail 스크립트가 PASS한다.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `find v10/src/core -maxdepth 3 -type d | rg 'foundation|runtime|domain|pipelines|ui/theming|security/sanitization'`
   - Expected result:
     - 신규 폴더 구조 확인.
   - Covers: AC-1

2) Step:
   - Command / click path:
     - `rg -n "from '@core/(config|contracts|engine|extensions|math|persistence|sanitize|theme|themes|types)'" v10/src`
   - Expected result:
     - 기존 import가 여전히 유효(컴파일 실패 없음).
   - Covers: AC-2

3) Step:
   - Command / click path:
     - `bash scripts/check_layer_rules.sh && bash scripts/check_mod_contract.sh && cd v10 && npm run lint && npm run build`
   - Expected result:
     - 전체 PASS.
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - re-export 경로 누락 시 빌드 에러 발생.
- Roll-back:
  - R1 커밋 단위 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/foundation/**`
- `v10/src/core/runtime/**`
- `v10/src/core/domain/**`
- `v10/src/core/pipelines/**`
- `v10/src/core/ui/theming/**`
- `v10/src/core/security/sanitization/**`
- legacy shim rewrites:
  - `v10/src/core/config/**`
  - `v10/src/core/contracts/**`
  - `v10/src/core/engine/**`
  - `v10/src/core/extensions/**`
  - `v10/src/core/math/**`
  - `v10/src/core/migrations/**`
  - `v10/src/core/persistence/**`
  - `v10/src/core/export/**`
  - `v10/src/core/sanitize/**`
  - `v10/src/core/theme/**`
  - `v10/src/core/themes/**`
  - `v10/src/core/types/**`
- `v10/docs/architecture/ModEngine.md`
- `v10/tsconfig.json`

Commands run (only if user asked or required by spec):
- `bash scripts/check_layer_rules.sh`
- `bash scripts/check_mod_contract.sh`
- `cd v10 && npm run lint`
- `cd v10 && npm run build`

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
  - `v10/src/core/foundation/index.ts` duplicate export (`JsonSafeValue`) during first build; fixed in-wave.
- Blocking:
  - NO
- Mitigation:
  - Changed `v10/src/core/foundation/index.ts` to namespace export (`FoundationSchemas`, `FoundationTypes`) to remove symbol collision.
