# Task 107: AI_READ_ME Docs Refresh (Codebase Sync)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: v10/
Date: 2026-02-12

---

## Goal
- What to change:
  - `v10/AI_READ_ME.md`의 구조/경로/요약 설명을 현재 `v10/src` 코드베이스 기준으로 최신화한다.
  - 실제 코드와 어긋난 서술(누락/오래된 디렉터리 맥락)을 정리한다.
  - `v10/AI_READ_ME_MAP.md`를 생성 스크립트 기준 최신 상태로 갱신한다.
- What must NOT change:
  - 런타임 코드(`v10/src/**`) 및 동작 변경 금지.
  - 신규 dependency 추가 금지.

---

## Scope (Codex must touch ONLY these)

Touched files/directories:
- `codex_tasks/task_107_ai_read_me_md_refresh.md`
- `v10/AI_READ_ME.md`
- `v10/AI_READ_ME_MAP.md`

Out of scope:
- `scripts/gen_ai_read_me_map.mjs`
- `v10/src/**` (모든 프로덕션 코드)
- `README.md` 및 루트 문서 전반

---

## Design Artifacts (required for layout/structure changes)

- [x] Layout / structure changes included: NO
- [x] SVG path in `design_drafts/`: N/A
- [x] SVG includes explicit `viewBox` (width / height / ratio label): N/A
- [x] Tablet viewports considered (if applicable): N/A
- [x] Codex must verify SVG file exists before implementation: N/A

> Note:
> - SVG is a structural design artifact only.
> - SVG must NOT be embedded in production code.
> - Gemini provides SVG input only; ownership remains with Codex.

---

## Dependencies / Constraints

- New dependencies allowed: NO
  - If YES, list and justify explicitly.
- Boundary rules:
  - 문서 변경만 수행한다.
  - 실제 경로/모듈명은 로컬 코드베이스 기준으로 검증 후 반영한다.
- Compatibility:
  - 기존 레이어 규칙/불변식 의미를 변경하지 않고 표현만 최신 상태로 맞춘다.

---

## Agent Assignment (execution planning)

- Execution mode: MANUAL
- If delegated, chain scope:
  - N/A
- Assigned agents / roles:
  - Spec-Writer: Codex
  - Spec-Reviewer: Codex
  - Implementer-A: Codex
  - Implementer-B: N/A
  - Implementer-C: N/A
  - Reviewer+Verifier: Codex
- File ownership lock plan:
  - `v10/AI_READ_ME.md`는 Implementer-A 단독 소유로 수정한다.

---

## Speculative Defense Check (guardrail)

- [x] Any defensive branches added: NO
- If YES:
  - Evidence (real input, spec, or bug report):
    - N/A
  - Sunset criteria (when and how to remove):
    - N/A

---

## Documentation Update Check

- [x] Structure changes (file/folder add/move/delete):
  - `node scripts/gen_ai_read_me_map.mjs` 실행으로 맵 문서 freshness를 맞춘다.
- [x] Semantic / rule changes (layers, invariants, core flows):
  - `v10/AI_READ_ME.md` 서술을 코드 기준으로 최신화 필요

---

## Acceptance Criteria (must be testable)

- [x] AC-1: `v10/AI_READ_ME.md`의 Directory Map 요약이 실제 `v10/src` 핵심 디렉터리(`core/persistence`, `core/sanitize`, `core/utils.ts`, `features/canvas/objects`, `features/canvas/viewport`, `app/layout.tsx`)를 반영한다.
- [x] AC-2: 문서 내 경로/모듈 예시는 현재 코드베이스에 존재하거나 alias 규칙에 부합한다.
- [x] AC-3: `v10/AI_READ_ME_MAP.md`가 재생성되며 `node scripts/gen_ai_read_me_map.mjs --check`가 통과한다.
- [x] AC-4: scope 외 파일 수정이 없다.

---

## Manual Verification Steps (since no automated tests)

> Each step should map to one or more Acceptance Criteria.

1) Step:
   - Command / click path:
     - `find v10/src -maxdepth 2 -type d | sort`
     - `find v10/src/features/canvas -maxdepth 2 -type d | sort`
   - Expected result:
     - 문서 요약과 실제 디렉터리 간 누락/불일치가 해소됨
   - Covers: AC-1, AC-2

2) Step:
   - Command / click path:
     - `rg -n "Directory Map|core/persistence|core/sanitize|core/utils|features/canvas/objects|features/canvas/viewport|app/layout.tsx" v10/AI_READ_ME.md`
   - Expected result:
     - 최신화된 요약 키워드가 문서에 반영됨
   - Covers: AC-1, AC-2

3) Step:
   - Command / click path:
     - `node scripts/gen_ai_read_me_map.mjs`
     - `node scripts/gen_ai_read_me_map.mjs --check`
   - Expected result:
     - 맵 문서가 최신 상태로 재생성되고 freshness 체크 통과
   - Covers: AC-3

4) Step:
   - Command / click path:
     - `git status --short -- codex_tasks/task_107_ai_read_me_md_refresh.md v10/AI_READ_ME.md v10/AI_READ_ME_MAP.md`
   - Expected result:
     - scope 내 파일만 변경됨
   - Covers: AC-4

---

## Risks / Roll-back Notes

- Risks:
  - 문서 요약 업데이트 중 기존 불변식 표현을 과도하게 재서술하면 해석 오차가 생길 수 있음.
  - 자동 생성 맵이 로컬 구조를 기준으로 변경되므로 CI freshness와 충돌 가능성은 낮지만 diff가 커질 수 있음.
- Roll-back:
  - `v10/AI_READ_ME.md`, `v10/AI_READ_ME_MAP.md` 변경분만 revert하면 즉시 원복 가능.

---

## Approval Gate (mandatory)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received - user message: "진행. 그리고 마무리되면 ai_read_me_map.md 도 업데이트해 (스크립트든 직접 업데이트든)"

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `codex_tasks/task_107_ai_read_me_md_refresh.md`
- `v10/AI_READ_ME.md`
- `v10/AI_READ_ME_MAP.md`

Commands run (only if user asked or required by spec):
- `nl -ba codex_tasks/task_107_ai_read_me_md_refresh.md | sed -n '1,280p'`
- `nl -ba v10/AI_READ_ME.md | sed -n '34,90p'`
- `find v10/src -maxdepth 2 -type d | sort`
- `find v10/src/features/canvas -maxdepth 2 -type d | sort`
- `node scripts/gen_ai_read_me_map.mjs`
- `node scripts/gen_ai_read_me_map.mjs --check`
- `rg -n "Directory Map|core/persistence|core/sanitize|core/utils|features/canvas/objects|features/canvas/viewport|app/layout.tsx|buildPersistedDoc" v10/AI_READ_ME.md`
- `git status --short -- codex_tasks/task_107_ai_read_me_md_refresh.md v10/AI_READ_ME.md v10/AI_READ_ME_MAP.md`

## Gate Results (Codex fills)

- Lint:
  - N/A
- Build:
  - N/A
- Script checks:
  - PASS (`node scripts/gen_ai_read_me_map.mjs --check`)

## Failure Classification (Codex fills when any gate fails)

- Pre-existing failures:
  - 없음
- Newly introduced failures:
  - 없음
- Blocking:
  - NO
- Mitigation:
  - N/A

Manual verification notes:
- AC-1: Passed. Directory Map에 `core/persistence`, `core/sanitize`, `core/utils.ts`, `features/canvas` 하위 맥락, `app/layout.tsx` 반영 확인.
- AC-2: Passed. dependency hotspot에 `@core/persistence/buildPersistedDoc` 추가 및 경로 표기 정합성 확인.
- AC-3: Passed. 맵 재생성 후 `node scripts/gen_ai_read_me_map.mjs --check` 통과 확인.
- AC-4: Passed. scope 대상 3개 파일만 변경 확인.

Notes:
- 사용자 추가 지시("...ai_read_me_map.md 도 업데이트...")를 반영해 스펙 범위를 확장 후 동일 태스크 내에서 완료했다.
