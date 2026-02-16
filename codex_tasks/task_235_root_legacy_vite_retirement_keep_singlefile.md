# Task 235: Root Legacy Vite Retirement (Keep Single Legacy File)

Status: COMPLETED
Owner: Codex (spec / review / implementation)
Target: root/
Date: 2026-02-16

---

## Goal (Base Required)
- What to change:
  - Remove root legacy Vite runtime/deploy path and GitHub Pages workflow.
  - Keep only one legacy reference file: `legacy_archive/phase1_2026-02-15/수학_판서도구_v9.9.html`.
  - Update root docs/cleanup inventories/hook logic to match Vercel-first (`v10/`) operation.
- What must NOT change:
  - Do not modify `v10/` runtime code.
  - Do not delete governance core docs (`AGENTS.md`, `PROJECT_*`, `GEMINI*`, `codex_tasks/**`, `scripts/**`).
  - Do not introduce new dependencies.

---

## Scope (Base Required)

Touched files/directories:
- `.github/workflows/gh-pages.yml` (delete)
- `.githooks/pre-push` (remove root build path checks)
- `index.html` (delete)
- `vite.config.js` (delete)
- `package.json` (delete, root only)
- `package-lock.json` (delete, root only)
- `src/` (delete root legacy runtime)
- `backup/` (delete empty directory)
- `legacy_archive/phase1_2026-02-15/backup/single-file-v9.9.html` (delete)
- `legacy_archive/phase1_2026-02-15/해설생성프롬프트.txt` (delete)
- `README.md` (root usage/deploy docs update to `v10` + Vercel direction)
- `FEATURE_ALIGNMENT_MATRIX.md` (legacy source descriptor update)
- `codex_tasks/cleanup/non_v10_cleanup_matrix.md` (reflect completed purge)
- `codex_tasks/cleanup/non_v10_inventory.md` (remove deleted root runtime inventory rows)
- `codex_tasks/task_235_root_legacy_vite_retirement_keep_singlefile.md`

Out of scope:
- Rewriting historical completed task logs.
- Any feature changes under `v10/src/**`.
- Any additional archive strategy beyond keeping the single approved legacy file.

---

## Dependencies / Constraints (Base Required)

- New dependencies allowed: NO
- Boundary rules:
  - Delete only listed legacy targets.
  - Keep repository checks/push hooks operational after root runtime removal.
- Compatibility:
  - Shell verification suite must pass.

---

## DAG / Wave Metadata (Base Required)

- Wave ID:
  - HOTFIX-CLEANUP
- Depends on tasks:
  - [`task_234`]
- Enables tasks:
  - []
- Parallel group:
  - G-cleanup
- Max parallel slots:
  - 6
- Verification stage for this task:
  - `mid`

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
- If YES:
  - [ ] Structure changes (file/folder add/move/delete):
    - Run `node scripts/gen_ai_read_me_map.mjs`
    - Verify `v10/AI_READ_ME_MAP.md` update if needed
  - [ ] Semantic/rule changes:
    - Verify `v10/AI_READ_ME.md` update if needed

---

## Acceptance Criteria (Base Required)

- [x] AC-1: Root legacy Vite runtime/deploy files are removed (`src/`, `index.html`, `vite.config.js`, root `package*.json`, `.github/workflows/gh-pages.yml`).
- [x] AC-2: Only the approved legacy reference file remains under `legacy_archive/phase1_2026-02-15/`.
- [x] AC-3: `.githooks/pre-push` no longer attempts root `npm run build` for removed runtime paths.
- [x] AC-4: Root docs and cleanup inventory/matrix reflect `v10`+Vercel direction and removed legacy assets.
- [x] AC-5: `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh` passes.

---

## Manual Verification Steps (Base Required)

1) Step:
   - Command / click path: `test -e .github/workflows/gh-pages.yml || echo missing && test -e index.html || echo missing && test -e vite.config.js || echo missing && test -e package.json || echo missing && test -e package-lock.json || echo missing && test -d src || echo missing`
   - Expected result: all targets reported as `missing`.
   - Covers: AC-1

2) Step:
   - Command / click path: `find legacy_archive/phase1_2026-02-15 -maxdepth 2 -type f | sort`
   - Expected result: only `legacy_archive/phase1_2026-02-15/수학_판서도구_v9.9.html`.
   - Covers: AC-2

3) Step:
   - Command / click path: `rg -n "needs_root_build|npm run build" .githooks/pre-push`
   - Expected result: no root-legacy build trigger remains.
   - Covers: AC-3

4) Step:
   - Command / click path: `rg -n "GitHub Pages|build:gh|root Vite|src/main.js" README.md FEATURE_ALIGNMENT_MATRIX.md codex_tasks/cleanup/non_v10_cleanup_matrix.md codex_tasks/cleanup/non_v10_inventory.md`
   - Expected result: no stale operational instructions; mentions in cleanup matrix must be in `REMOVED` context only.
   - Covers: AC-4

5) Step:
   - Command / click path: `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh`
   - Expected result: PASS.
   - Covers: AC-5

---

## Risks / Roll-back Notes (Base Required)

- Risks:
  - If any hidden automation still expects root `package.json` or root Vite assets, local scripts could fail.
- Roll-back:
  - Revert this commit to restore deleted root runtime/deploy files.

---

## Approval Gate (Base Required)

- [x] Spec self-reviewed by Codex
- [x] Explicit user approval received (or delegated chain approval reference)
  - User quote: "응. 수학_판서도구_v9.9.html 말곤 날려도 되는거지? ... 깃허브 배포도 결국 vercel로 연결시키는 거잖아."

> Implementation MUST NOT begin until both boxes are checked.

---

## Implementation Log (Codex fills)

Status: COMPLETED

Changed files:
- `.githooks/pre-push`
- `.github/workflows/gh-pages.yml` (deleted)
- `index.html` (deleted)
- `package.json` (deleted)
- `package-lock.json` (deleted)
- `vite.config.js` (deleted)
- `src/main.js` (deleted)
- `src/style.css` (deleted)
- `src/utils/sanitizer.js` (deleted)
- `legacy_archive/phase1_2026-02-15/backup/single-file-v9.9.html` (deleted)
- `legacy_archive/phase1_2026-02-15/해설생성프롬프트.txt` (deleted)
- `README.md`
- `FEATURE_ALIGNMENT_MATRIX.md`
- `codex_tasks/cleanup/non_v10_cleanup_matrix.md`
- `codex_tasks/cleanup/non_v10_inventory.md`
- `codex_tasks/task_235_root_legacy_vite_retirement_keep_singlefile.md`

Commands run (only if user asked or required by spec):
- `find .github -maxdepth 3 -type f | sort`
- `rg -n "build:gh|gh-pages|GitHub Pages|npm run build:gh|root legacy build|vite build|index\.html|src/main\.js|package-lock\.json|vite\.config\.js" --hidden --glob '!.git' --glob '!node_modules' .`
- `ls -la legacy_archive/phase1_2026-02-15`
- `ls -la backup`
- `find src -type f | sort`
- `test -e .github/workflows/gh-pages.yml || echo missing && test -e index.html || echo missing && test -e vite.config.js || echo missing && test -e package.json || echo missing && test -e package-lock.json || echo missing && test -d src || echo missing`
- `find legacy_archive/phase1_2026-02-15 -maxdepth 2 -type f | sort`
- `rg -n "needs_root_build|npm run build" .githooks/pre-push`
- `rg -n "GitHub Pages|build:gh|root Vite|src/main.js" README.md FEATURE_ALIGNMENT_MATRIX.md codex_tasks/cleanup/non_v10_cleanup_matrix.md codex_tasks/cleanup/non_v10_inventory.md`
- `VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh`

## Gate Results (Codex fills)

- Lint:
  - N/A (no `v10` JS/TS changes)
- Build:
  - N/A
- Script checks:
  - PASS (`VERIFY_STAGE=mid bash scripts/run_repo_verifications.sh`)

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
- Root legacy runtime/deploy files are removed.
- `legacy_archive/phase1_2026-02-15/수학_판서도구_v9.9.html` only file remains in phase1 archive.
- `pre-push` no longer contains root build trigger (`needs_root_build` / `npm run build`).
- Root docs now point to `v10` + Vercel; cleanup docs mark removed paths explicitly.

Notes:
- `backup/`, `src/`, and `legacy_archive/phase1_2026-02-15/backup/` empty directories were removed.
