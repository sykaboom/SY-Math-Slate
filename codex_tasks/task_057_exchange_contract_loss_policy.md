# Task 057: Exchange contract loss policy update

Status: COMPLETED
Owner: Codex (planner/spec) / Codex (implementation)
Target: root/
Date: 2026-02-01

## Goal
- What to change: Fill the loss policy section in `V10_EXCHANGE_CONTRACT.md` with implemented behavior from v10 (assets, autosave, video/audio handling).
- What must NOT change: No production code changes. Do not alter other docs.

## Scope (Codex must touch ONLY these)
Touched files/directories:
- V10_EXCHANGE_CONTRACT.md
- codex_tasks/task_057_exchange_contract_loss_policy.md

Out of scope:
- Any code changes
- Updates to other markdown files

## Dependencies / constraints
- New dependencies allowed? NO
- Boundary rules: N/A (documentation-only)

## Documentation Update Check
- [ ] 구조 변경(파일/폴더 추가·이동·삭제) 발생 시: `node scripts/gen_ai_read_me_map.mjs` 실행하여 `v10/AI_READ_ME_MAP.md` 갱신 여부 확인
- [ ] 규칙/의미 변경(레이어 규칙, 불변조건, 핵심 플로우 등) 발생 시: `v10/AI_READ_ME.md` 갱신 여부 확인

## Acceptance criteria (must be testable)
- [ ] Loss policy section lists current lossy areas for `.slate` export/import.
- [ ] Loss policy notes local autosave image exclusion (non-exchange, but relevant).
- [ ] Loss policy mentions video asset handling (not packaged; URL/Blob caveat).
- [ ] Sources section includes the specific v10 files used as evidence.

## Manual verification steps (since no automated tests)
- Open `V10_EXCHANGE_CONTRACT.md` and verify loss policy text matches code behavior.
- Confirm only the contract and this task file were modified.

## Risks / roll-back notes
- Risk: Loss policy will evolve as export/import adds media bundling.
- Rollback: Revert the two files.

---

## Implementation Log (Codex fills)
Status: COMPLETED
Changed files:
- V10_EXCHANGE_CONTRACT.md
- codex_tasks/task_057_exchange_contract_loss_policy.md

Commands run (only if user asked):
- None (not requested)

Notes:
- Added implemented loss policy details for audio/video/assets and autosave behavior.
