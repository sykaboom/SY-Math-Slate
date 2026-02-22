# Task 493: Pack-first Contract Lock (Template Pack Toolbar Contract 일치화)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-22

---

## Goal (Base Required)
- What to change:
  - template pack 계약에서 toolbar 정의를 단일 소스(`manifest.toolbar.*`)로 고정한다.
  - `templatePackAdapter.types` / guard / adapter / base manifest / contract check script 간 불일치를 제거한다.
- What must NOT change:
  - 런타임에서 base-education pack 활성화 동작 유지.
  - toolbar action surface 결과(사용자 체감 툴바 노출) 회귀 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/core/runtime/modding/package/templatePackAdapter.types.ts`
- `v10/src/mod/schema/templatePack.types.ts`
- `v10/src/mod/schema/templatePack.guards.ts`
- `v10/src/core/runtime/modding/package/templatePackAdapter.ts`
- `v10/src/mod/packs/base-education/manifest.ts`
- `scripts/check_template_pack_contract.mjs`
- `v10/AI_READ_ME.md`
- `codex_tasks/task_493_pack_first_contract_lock.md`

Out of scope:
- runtime mod package merge semantics 변경
- toolbar UI 컴포넌트 변경
- session policy / sharing flow 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - core/runtime 쪽 adapter는 `features/*` import 금지
  - schema/guards는 runtime selector에 의존 금지
- Compatibility:
  - `manifest.toolbar.actionSurfaceRules`가 없으면 validation 실패하도록 고정
  - legacy top-level `manifest.actionSurfaceRules` 경로는 제거

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-GAP-HIGH-04
- Depends on tasks:
  - `task_492`
- Enables tasks:
  - `task_494` legacy alias isolation
- Parallel group:
  - G-PACK-CONTRACT-LOCK
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 8
- Files shared with other PENDING tasks:
  - none
- Cross-module dependency:
  - YES (core package adapter + mod schema + scripts)
- Parallelizable sub-units:
  - 0
- Estimated single-agent duration:
  - `~40min`
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - NO
- Rationale:
  - 계약 타입/가드/어댑터를 동시에 맞춰야 하므로 직렬 원샷 검증이 안전하다.

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

- [x] Applies: YES
- [x] Semantic/rule changes:
  - template pack toolbar 계약 SSOT를 `manifest.toolbar.*`로 고정한 사항을 `v10/AI_READ_ME.md` 반영

---

## Acceptance Criteria (Base Required)

- [x] AC-1: `TemplatePackAdapterManifest` 타입이 `toolbar` 정의를 필수로 포함한다.
- [x] AC-2: guard/adapter가 `manifest.toolbar.actionSurfaceRules` 단일 경로만 사용한다.
- [x] AC-3: base-education manifest에 top-level `actionSurfaceRules`가 제거되고 toolbar 내부 정의만 유지된다.
- [x] AC-4: `node scripts/check_template_pack_contract.mjs`, `bash scripts/check_mod_contract.sh`, `cd v10 && npm run lint && npm run build`가 PASS한다.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `rg -n "export type TemplatePackAdapterManifest|toolbar:" v10/src/core/runtime/modding/package/templatePackAdapter.types.ts`
   - Expected result:
     - manifest 타입에 toolbar 필드가 필수로 존재한다.
   - Covers: AC-1

2) Step:
   - Command / click path:
     - `rg -n "manifest\.actionSurfaceRules|toolbar\.actionSurfaceRules" v10/src/mod/schema/templatePack.guards.ts v10/src/core/runtime/modding/package/templatePackAdapter.ts`
   - Expected result:
     - `manifest.actionSurfaceRules` 참조는 없고, `toolbar.actionSurfaceRules`만 사용한다.
   - Covers: AC-2

3) Step:
   - Command / click path:
     - `sed -n '/baseEducationTemplatePackWithToolbar = {/,/};/p' v10/src/mod/packs/base-education/manifest.ts | rg -n "actionSurfaceRules" || true`
   - Expected result:
     - runtime manifest object 블록에 `actionSurfaceRules` key가 존재하지 않는다.
   - Covers: AC-3

4) Step:
   - Command / click path:
     - `node scripts/check_template_pack_contract.mjs && bash scripts/check_mod_contract.sh && cd v10 && npm run lint && npm run build`
   - Expected result:
     - PASS
   - Covers: AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - manifest schema tightening으로 기존 샘플/테스트 데이터가 실패할 수 있음.
- Roll-back:
  - 타입/가드/어댑터/manifest 변경을 한 커밋 단위로 revert하면 원복 가능.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - User quote: "오케이 다음 단계 시작해."

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `v10/src/core/runtime/modding/package/templatePackAdapter.types.ts`
- `v10/src/mod/schema/templatePack.types.ts`
- `v10/src/mod/schema/templatePack.guards.ts`
- `v10/src/core/runtime/modding/package/templatePackAdapter.ts`
- `v10/src/mod/packs/base-education/manifest.ts`
- `scripts/check_template_pack_contract.mjs`
- `v10/AI_READ_ME.md`
- `codex_tasks/task_493_pack_first_contract_lock.md`

Commands run (only if user asked or required by spec):
- `rg -n "export type TemplatePackAdapterManifest|toolbar:" v10/src/core/runtime/modding/package/templatePackAdapter.types.ts`
- `rg -n "manifest\\.actionSurfaceRules|toolbar\\.actionSurfaceRules" v10/src/mod/schema/templatePack.guards.ts v10/src/core/runtime/modding/package/templatePackAdapter.ts`
- `sed -n '/baseEducationTemplatePackWithToolbar = {/,/};/p' v10/src/mod/packs/base-education/manifest.ts | rg -n "actionSurfaceRules" || true`
- `node scripts/check_template_pack_contract.mjs`
- `bash scripts/check_mod_contract.sh`
- `cd v10 && npm run lint && npm run build`

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

Manual verification notes:
- AC-1 PASS: adapter manifest 타입이 `toolbar` 필수 계약을 가진다.
- AC-2 PASS: guard/adapter에서 `manifest.actionSurfaceRules` 참조 제거, `toolbar.actionSurfaceRules`만 유지.
- AC-3 PASS: runtime manifest object(`baseEducationTemplatePackWithToolbar`)에 top-level `actionSurfaceRules` 없음.
- AC-4 PASS: template pack contract check + mod contract + lint/build 모두 통과.

Notes:
- legacy top-level actionSurfaceRules 호환 경로를 제거해 pack 선언과 runtime 반영 경로를 1:1로 고정했다.
