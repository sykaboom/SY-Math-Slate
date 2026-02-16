# SY-Math-Slate

Math board / writing tool. Active runtime is `v10/` (Next.js).

Primary deployment: Vercel (`main` branch).

## Requirements
- Node.js 18+ (recommended 20)

## Quick start
```bash
cd v10
npm install
npm run dev
```

Open http://localhost:3000/

## Build
```bash
cd v10
npm run build
```

## Deployment
- Production deployment target: Vercel
- GitHub Pages legacy deployment path has been retired.

## Project docs
- `PROJECT_BLUEPRINT.md` (architecture, SSOT, and integration rules)
- `AGENTS.md` (Codex execution rules and workflow gates)
- `codex_tasks/_PLAYBOOK_subagent_oneclick.md` (delegated sub-agent orchestration policy)
- `legacy_archive/phase1_2026-02-15/수학_판서도구_v9.9.html` (single-file legacy reference kept intentionally)

## Codex Environment Bootstrap
For Codex workflow portability across machines:

```bash
./scripts/bootstrap_codex_env.sh --dry-run
./scripts/bootstrap_codex_env.sh --apply
```

## Notes
- For tablet testing on the same network:
  `cd v10 && npm run dev -- --hostname 0.0.0.0 --port 3000` then open `http://<PC_IP>:3000/`.
