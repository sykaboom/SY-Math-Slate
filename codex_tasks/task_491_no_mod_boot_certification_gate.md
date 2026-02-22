# Task 491: No-Mod Boot Certification Gate (core always-on 검증)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: root/
Date: 2026-02-22

---

## Goal (Base Required)
- What to change:
  - 런타임 템플릿팩 자동 부트스트랩을 환경변수로 비활성화 가능한 경로를 추가한다.
  - 툴바 모드 정책 파일에서 template pack 직접 import 의존을 제거한다.
  - no-mod boot 검증 스크립트를 추가해 `core always-on`을 반복 검증 가능하게 만든다.
- What must NOT change:
  - 기본 환경(기능 플래그 미설정)에서 기존 동작 유지.
  - 모드 입력 라우팅/패널 정책/공유 정책 동작 변경 금지.

---

## Scope (Base Required)

Touched files/directories:
- `v10/src/mod/bridge/packRegistryBridge.ts`
- `v10/src/features/chrome/toolbar/toolbarModePolicy.ts`
- `scripts/check_v10_no_mod_boot.sh` (new)
- `codex_tasks/workflow/feature_flag_registry.env`
- `v10/AI_READ_ME.md`
- `codex_tasks/task_491_no_mod_boot_certification_gate.md`

Out of scope:
- 템플릿팩 스키마 변경
- toolbar action catalog 구조 변경
- AppLayout/windowing 동작 변경

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - core/runtime/modding 경계 위반 금지.
  - no-mod 검증은 “비활성 플래그” 경로에서만 수행, 기본 경로 동작 보존.
- Compatibility:
  - `NEXT_PUBLIC_TEMPLATE_PACK_BOOTSTRAP` 미설정 시 기존과 동일하게 기본 템플릿팩이 부트스트랩되어야 한다.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - W-GAP-HIGH-02
- Depends on tasks:
  - `task_490`
- Enables tasks:
  - `task_492` host policy extraction
- Parallel group:
  - G-NOMOD-CERT
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `end`

---

## Execution Mode Assessment (Base Required for new specs)

- Touched file count:
  - 5
- Files shared with other PENDING tasks:
  - none
- Cross-module dependency:
  - YES (mod bridge + toolbar policy + scripts)
- Parallelizable sub-units:
  - 0
- Estimated single-agent duration:
  - `~30min`
- Recommended mode:
  - MANUAL
- Batch-eligible:
  - NO
- Rationale:
  - 런타임 부트스트랩 경로 변경은 직렬 단일 검증이 안전하다.

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
  - no-mod boot gate와 bootstrap env 경로를 `v10/AI_READ_ME.md`에 반영

---

## Acceptance Criteria (Base Required)

- [ ] AC-1: `NEXT_PUBLIC_TEMPLATE_PACK_BOOTSTRAP=0`일 때 기본 템플릿팩 자동 등록이 수행되지 않는다.
- [ ] AC-2: `toolbarModePolicy.ts`가 `@/mod/packs/base-education/*`를 직접 import하지 않는다.
- [ ] AC-3: `scripts/check_v10_no_mod_boot.sh`가 PASS한다.
- [ ] AC-4: `bash scripts/check_mod_contract.sh`, `cd v10 && npm run lint && npm run build`가 PASS한다.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path:
     - `rg -n "NEXT_PUBLIC_TEMPLATE_PACK_BOOTSTRAP|isRuntimeTemplatePackBootstrapEnabled" v10/src/mod/bridge/packRegistryBridge.ts`
   - Expected result:
     - bootstrap toggle 경로가 존재한다.
   - Covers: AC-1

2) Step:
   - Command / click path:
     - `rg -n "@/mod/packs/base-education" v10/src/features/chrome/toolbar/toolbarModePolicy.ts`
   - Expected result:
     - 매치 0.
   - Covers: AC-2

3) Step:
   - Command / click path:
     - `bash scripts/check_v10_no_mod_boot.sh`
   - Expected result:
     - PASS
   - Covers: AC-1, AC-3

4) Step:
   - Command / click path:
     - `bash scripts/check_mod_contract.sh && cd v10 && npm run lint && npm run build`
   - Expected result:
     - PASS
   - Covers: AC-4

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - bootstrap opt-out 경로에서 템플릿팩 의존 코드가 null-safe하지 않으면 런타임 오류 가능.
- Roll-back:
  - packRegistryBridge toggle revert + script 제거 + toolbarModePolicy fallback 복구.

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
- `v10/src/mod/bridge/packRegistryBridge.ts`
- `v10/src/features/chrome/toolbar/toolbarModePolicy.ts`
- `scripts/check_v10_no_mod_boot.sh` (new)
- `codex_tasks/workflow/feature_flag_registry.env`
- `v10/AI_READ_ME.md`
- `codex_tasks/task_491_no_mod_boot_certification_gate.md`

Commands run (only if user asked or required by spec):
- `rg -n "NEXT_PUBLIC_TEMPLATE_PACK_BOOTSTRAP|isRuntimeTemplatePackBootstrapEnabled" v10/src/mod/bridge/packRegistryBridge.ts`
- `rg -n "@/mod/packs/base-education" v10/src/features/chrome/toolbar/toolbarModePolicy.ts || true`
- `bash scripts/check_v10_no_mod_boot.sh`
- `bash scripts/check_mod_contract.sh`
- `bash scripts/check_v10_feature_flag_registry.sh`
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
- AC-1 PASS: bootstrap env toggle added and `NEXT_PUBLIC_TEMPLATE_PACK_BOOTSTRAP=0` build path passes.
- AC-2 PASS: `toolbarModePolicy.ts` no longer imports `@/mod/packs/base-education/*`.
- AC-3 PASS: `scripts/check_v10_no_mod_boot.sh` added and PASS.
- AC-4 PASS: `check_mod_contract.sh`, lint, build all PASS.

Notes:
- (pre-existing failures vs new issues, if any)
