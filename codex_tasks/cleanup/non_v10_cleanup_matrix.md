# Non-v10 Cleanup Matrix (Task 144/145/157/235)

Date: 2026-02-16  
Repo root safety: `/home/sykab/SY-Math-Slate/**` only

## Decision Tags
- `KEEP`: protected, no cleanup action.
- `REMOVED`: deleted by completed cleanup tasks.

## Matrix

| Path | Tag | Gate | Dependency evidence | Rollback |
|---|---|---|---|---|
| `legacy_archive/phase1_2026-02-15/수학_판서도구_v9.9.html` | KEEP | always | user-approved single legacy reference artifact | restore from git history if modified |
| `legacy_archive/phase1_2026-02-15/backup/single-file-v9.9.html` | REMOVED | task_235 | superseded duplicate legacy snapshot | restore from git history |
| `legacy_archive/phase1_2026-02-15/해설생성프롬프트.txt` | REMOVED | task_235 | no active runtime dependency | restore from git history |
| `src/**` | REMOVED | task_235 | root legacy Vite runtime retired | restore from git history |
| `index.html` | REMOVED | task_235 | root Vite entry retired | restore from git history |
| `vite.config.js` | REMOVED | task_235 | root Vite build config retired | restore from git history |
| `package.json` (root) | REMOVED | task_235 | root Vite script path retired | restore from git history |
| `package-lock.json` (root) | REMOVED | task_235 | root package path retired | restore from git history |
| `.github/workflows/gh-pages.yml` | REMOVED | task_235 | GitHub Pages deployment path retired (Vercel-first) | restore from git history |
| `.githooks/**`, `.github/**`, `scripts/**`, `codex_tasks/**` | KEEP | always | governance/verification critical | N/A |

## Status
- Root legacy Vite/Pages path has been retired.
- Operational runtime/deployment target is `v10/` with Vercel.
