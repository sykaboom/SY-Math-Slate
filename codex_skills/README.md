# Codex Skills Bundle

This directory is the repository-owned skill source for portable Codex setups.

## Quick Install (after clone)

```bash
cd SY-Math-Slate
bash scripts/bootstrap_codex_env.sh --apply
```

This installs all entries from `codex_skills/` into `~/.codex/skills`.

## Dry Run

```bash
bash scripts/bootstrap_codex_env.sh --dry-run
```

## Direct Sync Script

```bash
bash scripts/sync_codex_skills.sh --apply
```

## Custom Target (optional)

```bash
bash scripts/sync_codex_skills.sh --apply --target /path/to/alt-codex-home/skills
```

## Verify

```bash
find ~/.codex/skills -mindepth 1 -maxdepth 1 -print | sort
```

Notes:
- `codex_skills/.system/` is included for environment parity with this repo.
- Repo-specific skills may exist in addition to local defaults.
