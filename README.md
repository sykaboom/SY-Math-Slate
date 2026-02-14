# SY-Math-Slate

Math board / writing tool.

Live demo: https://sykaboom.github.io/SY-Math-Slate/

## Requirements
- Node.js 18+ (recommended 20)

## Quick start
```bash
npm install
npm run dev
```

Open http://localhost:5173/

## Build
```bash
npm run build
npm run build:gh
```

## Deployment (GitHub Pages)
This repo uses `.github/workflows/gh-pages.yml`. Pushing to `main` triggers
`npm run build:gh` and deploys `dist` to GitHub Pages.

## Project docs
- `PROJECT_BLUEPRINT.md` (architecture, SSOT, and integration rules)
- `AGENTS.md` (Codex execution rules and workflow gates)
- `codex_tasks/_PLAYBOOK_subagent_oneclick.md` (delegated sub-agent orchestration policy)

## Codex Environment Bootstrap
For Codex workflow portability across machines:

```bash
./scripts/bootstrap_codex_env.sh --dry-run
./scripts/bootstrap_codex_env.sh --apply
```

Detailed runtime checklist and machine-specific overrides are maintained in:
- `TOOLS.md`

## Notes
- For tablet testing on the same network:
  `npm run dev -- --host 0.0.0.0` then open `http://<PC_IP>:5173/`.
