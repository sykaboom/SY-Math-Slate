# Task 462: Mod Catalog Packs/Bridge/Schema Cutover

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-21

---

## Goal (Base Required)
- What to change:
  - `v10/src/mod` 축을 `packs/bridge/schema` 계약으로 재배치하여 엔진(core/modding)과 카탈로그(src/mod) 역할을 명확히 분리한다.
- What must NOT change:
  - core mod manager/command 동작 semantics 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/mod/packs/**` (구 templates 이관)
- `v10/src/mod/bridge/packRegistryBridge.ts` (구 runtime bridge 대체)
- `v10/src/mod/schema/**` (구 templates/_contracts 정리)
- `v10/src/mod/runtime/templatePackRegistry.ts` (compat facade로 축소 또는 re-export)
- `v10/src/mod/templates/**` (compat alias 경로 유지 범위 내)
- `v10/src/core/mod/package/templatePackAdapter*.ts`
- `v10/docs/architecture/ModEngine.md`

Out of scope:
- features import 전면 수정
- eslint/script 규칙 전면 교체 (task_463)
- legacy 경로 삭제 (task_465)

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO (default)
- Boundary rules:
  - `src/mod`는 선언 데이터 + 브리지 책임만 갖고 core internal deep import 금지.
  - bridge는 `@core/mod/package` 공개 API만 사용.
- Compatibility:
  - 기존 `base-education` 로딩 및 활성 패키지 선택 동작 유지.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - R2
- Depends on tasks:
  - ['task_461']
- Enables tasks:
  - ['task_463']
- Parallel group:
  - G-MOD-CATALOG
- Max parallel slots:
  - 6 (default)
- Verification stage for this task:
  - end

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 15+
- Files shared with other PENDING tasks:
  - `core/mod/package/*`, `src/mod/runtime/*`
- Cross-module dependency:
  - YES
- Parallelizable sub-units:
  - 2
- Estimated single-agent duration:
  - ~60min
- Recommended mode:
  - DELEGATED
- Batch-eligible:
  - NO (R2 단독 선행)
- Rationale:
  - bridge/schema/packs 재배치는 충돌 위험이 커서 wave 전용 집중 실행이 안전하다.

---

## Optional Block A — Layout / SVG Gate

- [ ] Applies: NO

---

## Optional Block B — Delegated Execution

- [ ] Applies: YES
- Execution mode: DELEGATED
- Delegation chain scope:
  - `task_462` only
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

- [ ] AC-1: `src/mod/packs`, `src/mod/bridge`, `src/mod/schema` 경로가 활성 경로가 된다.
- [ ] AC-2: 기존 template runtime 경로는 compat facade로 동작하며 회귀가 없다.
- [ ] AC-3: mod contract/script/lint/build가 PASS한다.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `find v10/src/mod -maxdepth 3 -type d | rg 'packs|bridge|schema'`
   - Expected result:
     - 신규 카탈로그 구조 확인.
   - Covers: AC-1

2) Step:
   - Command / click path:
     - `rg -n 'templatePackRegistry|packRegistryBridge|base-education' v10/src/mod v10/src/core/mod/package`
   - Expected result:
     - compat facade + 신규 bridge 공존 확인.
   - Covers: AC-2

3) Step:
   - Command / click path:
     - `bash scripts/check_mod_contract.sh && cd v10 && npm run lint && npm run build`
   - Expected result:
     - PASS.
   - Covers: AC-3

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - bridge/adapter miswire로 template activation 실패 가능.
- Roll-back:
  - R2 커밋 revert.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/mod/packs/**` (new active pack catalog)
- `v10/src/mod/schema/**` (new active contract schema)
- `v10/src/mod/bridge/packRegistryBridge.ts` (new active runtime bridge)
- compat facade conversion:
  - `v10/src/mod/runtime/templatePackRegistry.ts`
  - `v10/src/mod/templates/**`
- `v10/docs/architecture/ModEngine.md`

Commands run (only if user asked or required by spec):
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
  - None
- Blocking:
  - NO
- Mitigation:
  - N/A
