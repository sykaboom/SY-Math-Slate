# Non-v10 Inventory (Current)

Date: 2026-02-16  
Repo root: `/home/sykab/SY-Math-Slate`

## Purpose
- Deterministic inventory for root-level assets outside `v10/` after root legacy Vite retirement.

## Guardrails (Hard Protect)
- Never touch outside repo root.
- Never classify these as delete candidates without explicit task approval:
  - `v10/**`
  - `codex_tasks/**`
  - `.githooks/**`, `.github/**`, `scripts/**`
  - `AGENTS.md`, `PROJECT_BLUEPRINT.md`, `PROJECT_CONTEXT.md`, `GEMINI_CODEX_PROTOCOL.md`
  - `README.md`, `PROJECT_ROADMAP.md`, `FEATURE_ALIGNMENT_MATRIX.md`, `V10_EXCHANGE_CONTRACT.md`

## Top-level Inventory (excluding `v10/`)

| Path | Type | Current Role | Classification |
|---|---|---|---|
| `.githooks/` | dir | local quality gates / push guards | KEEP |
| `.github/` | dir | CI workflows (non-pages) | KEEP |
| `AGENTS.md` | file | execution constitution | KEEP |
| `PROJECT_BLUEPRINT.md` | file | SSOT architecture policy | KEEP |
| `PROJECT_CONTEXT.md` | file | product context | KEEP |
| `GEMINI_CODEX_PROTOCOL.md` | file | Codex/Gemini protocol | KEEP |
| `GEMINI.md` | file | Gemini instruction set | KEEP |
| `codex_tasks/` | dir | task specs/log SSOT | KEEP |
| `scripts/` | dir | verification and workflow automation | KEEP |
| `codex_skills/` | dir | local skill packs | KEEP |
| `README.md` | file | root docs entry | KEEP |
| `PROJECT_ROADMAP.md` | file | roadmap | KEEP |
| `FEATURE_ALIGNMENT_MATRIX.md` | file | planning matrix | KEEP |
| `V10_EXCHANGE_CONTRACT.md` | file | cross-app contract | KEEP |
| `legacy_archive/` | dir | archived legacy assets | KEEP |
| `legacy_archive/phase1_2026-02-15/수학_판서도구_v9.9.html` | file | single legacy reference artifact | KEEP |
| `design_drafts/` | dir | Gemini SVG/layout artifacts | KEEP |
| `node_modules/` | dir | local install artifact (ignored) | N/A (not tracked target) |
| `.git/` | dir | git metadata | N/A (system-managed) |

## Notes
- Root legacy Vite runtime/deploy assets were removed in task_235.
- Deployment target is Vercel for `v10/`.
