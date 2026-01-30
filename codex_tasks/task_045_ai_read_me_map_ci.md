# Task 045: AI_READ_ME_MAP 자동 생성 + CI 검증

Status: COMPLETED
Owner: Gemini (spec) / Codex (implementation)
Target: root/ + v10/
Date: 2026-01-30

## Accomplishments
- Created `scripts/gen_ai_read_me_map.mjs` for deterministic ASCII tree generation.
- Generated `v10/AI_READ_ME_MAP.md` reflecting current `v10/` structure.
- Integrated CI check via `.github/workflows/ai-readme-map.yml`.
- Updated `v10/AI_READ_ME.md` and `GEMINI.md` to establish the new Knowledge Hierarchy.

## Goal
- What to change:
  - v10 구조 맵을 자동 생성하는 스크립트 추가
  - GitHub Actions로 맵 최신 여부를 CI에서 검사
  - AI_READ_ME가 맵 파일 위치/갱신 방법을 안내하도록 보완
- What must NOT change:
  - 앱 런타임 로직 및 기존 동작
  - 새 외부 의존성 추가

## Scope (Codex must touch ONLY these)
Touched files/directories:
- scripts/gen_ai_read_me_map.mjs (new)
- v10/AI_READ_ME_MAP.md (generated)
- .github/workflows/ai-readme-map.yml (new)
- v10/AI_READ_ME.md (add brief reference to map + update command)

Out of scope:
- v10 런타임 기능 변경
- 기타 문서 대규모 개편
- 패키지 의존성 추가

## Dependencies / constraints
- New dependencies allowed? NO (Node 내장 모듈만 사용)
- CI: GitHub Actions 사용

## Acceptance criteria (must be testable)
- [x] `node scripts/gen_ai_read_me_map.mjs` 실행 시 `v10/AI_READ_ME_MAP.md`가 생성/갱신된다.
- [x] `node scripts/gen_ai_read_me_map.mjs --check`가 최신이면 exit 0, 다르면 exit 1로 실패한다.
- [x] GitHub Actions가 `pull_request` 및 `push`(main)에서 `--check`를 실행한다.
- [x] `v10/AI_READ_ME.md`에 맵 파일 위치와 갱신 방법이 간단히 안내된다.
- [x] 새 npm 패키지 추가 없음.

## Manual verification steps (since no automated tests)
- `node scripts/gen_ai_read_me_map.mjs`
- `node scripts/gen_ai_read_me_map.mjs --check` (exit 0 확인)

## Risks / roll-back notes
- CI 실패 시: 워크플로우와 스크립트 제거로 롤백 가능

---

## Implementation Log (Codex)
Status: COMPLETED
Changed files:
- scripts/gen_ai_read_me_map.mjs
- v10/AI_READ_ME_MAP.md
- .github/workflows/ai-readme-map.yml
- v10/AI_READ_ME.md

Commands run (only if user asked):
- node scripts/gen_ai_read_me_map.mjs

Notes:
- AI_READ_ME_MAP is excluded from its own listing for stable `--check` output.
- Hotfix: Updated `AGENTS.md` read order per user approval (no spec).
