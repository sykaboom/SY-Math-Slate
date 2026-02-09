# TOOLS.md - Local Notes

Skills define _how_ tools work. This file is for _your_ specifics — the stuff that's unique to your setup.

## What Goes Here

Things like:

- Camera names and locations
- SSH hosts and aliases
- Preferred voices for TTS
- Speaker/room names
- Device nicknames
- Anything environment-specific

## Examples

```markdown
### Cameras

- living-room → Main area, 180° wide angle
- front-door → Entrance, motion-triggered

### SSH

- home-server → 192.168.1.100, user: admin

### TTS

- Preferred voice: "Nova" (warm, slightly British)
- Default speaker: Kitchen HomePod
```

## Why Separate?

Skills are shared. Your setup is yours. Keeping them apart means you can update skills without losing your notes, and share skills without leaking your infrastructure.

---

Add whatever helps you do your job. This is your cheat sheet.

## Codex Runtime Checklist

When setting up a new machine:

```bash
./scripts/bootstrap_codex_env.sh --dry-run
./scripts/bootstrap_codex_env.sh --apply
```

Then verify runtime mode in Codex CLI:
- Open `/experimental`
- `sub-agents [x]` -> parallel execution available
- `sub-agents [ ]` -> single-Codex fallback mode

Keep these notes local:
- Any machine-specific path overrides used with `--source` or `--target`
- Whether your current environment should default to parallel or fallback mode
