# Non-v10 Cleanup Matrix (Task 144/145/157)

Date: 2026-02-15  
Repo root safety: `/home/sykab/SY-Math-Slate/**` only

## Decision Tags
- `KEEP`: protected, no cleanup action.
- `ARCHIVE-P1`: move to `legacy_archive/` in Task 145.
- `DELETE-FINAL`: eligible only in Task 157 after Task 156 stabilization gates.

## Matrix

| Path | Tag | Gate | Dependency evidence | Rollback |
|---|---|---|---|---|
| `backup/single-file-v9.9.html` | ARCHIVE-P1 | after-143 | `rg` search found 0 references in docs/scripts/runtime. | restore from `legacy_archive/phase1_2026-02-15/backup/` |
| `수학_판서도구_v9.9.html` | ARCHIVE-P1 | after-143 | `rg` search found 0 references. | restore from `legacy_archive/phase1_2026-02-15/` |
| `해설생성프롬프트.txt` | ARCHIVE-P1 | after-143 | `rg` search found 0 references. | restore from `legacy_archive/phase1_2026-02-15/` |
| `src/**` | KEEP (candidate: DELETE-FINAL) | after-156+stabilization | root GH Pages pipeline still builds legacy root app via `npm run build:gh`; source required until cutover. | keep intact until final cutover commit |
| `index.html` | KEEP (candidate: DELETE-FINAL) | after-156+stabilization | `.github/workflows/gh-pages.yml` root Vite build path requires entry. | keep intact until GH Pages path replacement |
| `vite.config.js` | KEEP (candidate: DELETE-FINAL) | after-156+stabilization | root build scripts and hook checks reference file. | keep intact until legacy deploy retirement |
| `package.json` (root) | KEEP (candidate: DELETE-FINAL) | after-156+stabilization | GH Pages workflow installs/builds root package. | keep intact until deploy migration complete |
| `package-lock.json` (root) | KEEP (candidate: DELETE-FINAL) | after-156+stabilization | lockfile required for deterministic root CI install. | keep intact until root package removal |
| `.githooks/**`, `.github/**`, `scripts/**`, `codex_tasks/**` | KEEP | always | governance/verification critical. | N/A |

## Phase Plan
- Phase 1 (Task 145, post-143): execute only `ARCHIVE-P1`.
- Final purge (Task 157, post-156+stabilization): process `DELETE-FINAL` only after:
  - beta quality gates are green,
  - deploy path migration away from root Vite is completed,
  - rollback plan is documented with path-level restore steps.
