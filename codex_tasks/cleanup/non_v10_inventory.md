# Non-v10 Inventory (Task 144)

Date: 2026-02-15  
Repo root: `/home/sykab/SY-Math-Slate`

## Purpose
- Deterministic inventory for all root-level assets outside `v10/`.
- This file is plan-only: no delete/move is executed here.

## Guardrails (Hard Protect)
- Never touch outside repo root.
- Never classify these as delete candidates:
  - `v10/**`
  - `codex_tasks/**`
  - `.githooks/**`, `.github/**`, `scripts/**`
  - `AGENTS.md`, `PROJECT_BLUEPRINT.md`, `PROJECT_CONTEXT.md`, `GEMINI_CODEX_PROTOCOL.md`
  - `README.md`, `PROJECT_ROADMAP.md`, `FEATURE_ALIGNMENT_MATRIX.md`, `V10_EXCHANGE_CONTRACT.md`

## Top-level Inventory (excluding `v10/`)

| Path | Type | Current Role | Classification |
|---|---|---|---|
| `.githooks/` | dir | local quality gates / push guards | KEEP |
| `.github/` | dir | CI / GitHub Pages workflow | KEEP |
| `AGENTS.md` | file | execution constitution | KEEP |
| `PROJECT_BLUEPRINT.md` | file | SSOT architecture policy | KEEP |
| `PROJECT_CONTEXT.md` | file | product context | KEEP |
| `GEMINI_CODEX_PROTOCOL.md` | file | Codex/Gemini protocol | KEEP |
| `GEMINI.md` | file | Gemini instruction set | KEEP |
| `codex_tasks/` | dir | task specs/log SSOT | KEEP |
| `scripts/` | dir | verification and workflow automation | KEEP |
| `codex_skills/` | dir | local skill packs | KEEP |
| `README.md` | file | root app/docs entry | KEEP |
| `PROJECT_ROADMAP.md` | file | roadmap | KEEP |
| `FEATURE_ALIGNMENT_MATRIX.md` | file | planning matrix | KEEP |
| `V10_EXCHANGE_CONTRACT.md` | file | cross-app contract | KEEP |
| `package.json` | file | root Vite build scripts (GH Pages path) | KEEP |
| `package-lock.json` | file | root dependency lock | KEEP |
| `vite.config.js` | file | root Vite build config | KEEP |
| `index.html` | file | root Vite entry | KEEP |
| `src/` | dir | root legacy Vite runtime source | KEEP (until final purge gate) |
| `backup/` | dir | legacy snapshots | ARCHIVE candidate |
| `수학_판서도구_v9.9.html` | file | legacy single-file artifact | ARCHIVE candidate |
| `해설생성프롬프트.txt` | file | legacy prompt note | ARCHIVE candidate |
| `design_drafts/` | dir | Gemini SVG/layout artifacts | KEEP |
| `node_modules/` | dir | local install artifact (ignored) | N/A (not tracked target) |
| `.git/` | dir | git metadata | N/A (system-managed) |

## Phase Gates
- `after-143`:
  - Only low-risk non-runtime artifacts can be moved to archive.
  - Prefer `ARCHIVE` over `DELETE`.
- `after-156+stabilization`:
  - Final destructive decisions only after beta gates and rollback evidence.
