# DESIGN_SYSTEM_BLUEPRINT

## 1) Purpose
- Define the design-system execution contract for AI coding agents and human implementers.
- Keep visual consistency token-first and implementation-safe.
- Reduce design drift caused by ad-hoc color choices.

## 2) SSOT Boundary
- Design SSOT for implementation is repository docs + token sources in code.
- External MCP tools, Figma files, screenshots, and moodboards are optional references only.
- External references can inform proposals, but they do not override repo tokens/rules.

## 3) Token-First Color Policy
- Component code must consume color tokens only.
- Component code must not contain ad-hoc color literals (`#hex`, `rgb()`, `hsl()`, named colors).
- If a required color does not exist, add/adjust a token in theme sources first, then consume that token.
- Keep token naming semantic (role-based), not visual-only (avoid names like `brightBlueButton`).

## 4) Default Strategy: Two Accent Families
- Default theme strategy uses exactly two accent families:
  - `accentA`: primary CTA, active/focus intent, key highlights.
  - `accentB`: secondary emphasis, informational highlights, alternate emphasis lane.
- Do not introduce a third accent family in component code.
- Status colors (`success`, `warning`, `error`, `info`) must be semantic status tokens, not new accents.

## 5) Neutral Ramp Usage
- Neutrals handle structure and readability; accents handle emphasis.
- Use neutral ramp for:
  - page/surface backgrounds
  - borders/dividers
  - text hierarchy (primary/secondary/disabled)
  - non-interactive UI chrome
- Keep high-contrast text/background pairings on distant neutral steps.
- Avoid using accent colors for large background surfaces unless explicitly specified by tokenized theme rules.

## 6) Exception Policy (Where Literal Colors Are Allowed)
- Allowed only in these cases:
  - design prototypes and draft artifacts under `design_drafts/`
  - one-off visual experiments explicitly scoped by approved task spec
  - third-party embed constraints where token injection is technically blocked
- Any exception must include:
  - task ID reference
  - reason
  - rollback/removal condition
- Exceptions are not allowed in stable component runtime paths by default.

## 7) Agent Execution Rules
1. Need a color in component code: select an existing semantic token.
2. Missing color role: create/update token definition first (theme layer), then use token.
3. Receiving external design input: map visual intent to existing tokens; if mapping fails, propose token delta.
4. Before merge: scan for banned literals in runtime component paths.

## 8) Do / Don't

| Area | Do | Don't |
| --- | --- | --- |
| Component styling | Use semantic token variables/constants | Hardcode `#hex`, `rgb()`, `hsl()`, named colors |
| Accent usage | Stay within `accentA` + `accentB` | Add per-component custom accent colors |
| Neutrals | Use neutral ramp for surfaces/text/borders | Use accents as default structural color system |
| External design refs | Treat MCP/Figma as optional input | Treat MCP/Figma as implementation SSOT |
| New visual need | Update token source, then consume | Patch component with local literal value |
| Exceptions | Document task ID + reason + expiry | Leave undocumented "temporary" literals |

## 9) Rollout Checklist
- [ ] Confirm token source files for current theme stack are identified.
- [ ] Enforce no-literal-color rule in runtime component paths.
- [ ] Migrate existing hardcoded literals to semantic tokens.
- [ ] Verify 2-accent strategy in primary UI states.
- [ ] Verify neutral ramp covers all structural/text layers.
- [ ] Record and scope any exception with task ID + removal condition.
- [ ] Re-check changed files for literal color regressions before merge.

## 10) Fast Validation Commands
```bash
# find likely ad-hoc color literals in runtime code
rg -n "#[0-9a-fA-F]{3,8}|rgb\(|hsl\(|\b(white|black|red|blue|green|yellow|orange|purple|pink|gray|grey)\b" v10/src
```

