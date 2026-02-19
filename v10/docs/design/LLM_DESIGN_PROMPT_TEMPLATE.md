# LLM Design Prompt Template

Use this template to generate deterministic, token-first UI design specs for v10.

## Required Inputs
| Input | Required | Format |
| --- | --- | --- |
| `palette_hex` | Yes | Array of hex values (example: `["#0B1220", "#111827", "#22C55E"]`) |
| `token_constraints` | Yes | Allowed token names/prefixes and banned patterns |
| `viewport_matrix` | Yes | Desktop/tablet/mobile matrix with IDs and dimensions |
| `output_format` | Yes | Exact sections/tables to return |
| `module_policy` | Yes | Windowed vs docked behavior constraints |
| `safe_area_policy` | Yes | Rules for top/bottom/horizontal safe-area handling |

## Hard Rules (Always On)
1. No hardcoded colors in generated styles/components.
2. All colors must be referenced by semantic tokens (`var(--token-name)`).
3. Hex codes are allowed only in the `palette_hex` input block and optional token mapping table.
4. Design must be canvas-first and preserve writing surface before module expansion.
5. Windowed modules must remain movable/recoverable and must not trap core controls.

## Copy-Ready Structured Template
```text
[ROLE]
You are a UI system designer for SY-Math-Slate v10. Generate a deterministic design spec, not prose advice.

[INPUTS]
palette_hex:
- <HEX_1>
- <HEX_2>
- <HEX_3>
- <HEX_4>
- <HEX_5>

token_constraints:
- allowed_token_prefixes: [--theme-, --surface-, --accent-, --state-]
- required_semantics: [bg, fg, border, focus, accent, danger, success]
- banned_patterns: [hardcoded hex in style rules, bg-slate-*, text-white/* as final values]

viewport_matrix:
- desktop-ref-1440x1080: 1440x1080
- tablet-768x1024: 768x1024
- tablet-820x1180: 820x1180
- tablet-1024x768: 1024x768
- tablet-1180x820: 1180x820
- mobile-360x800: 360x800
- mobile-390x844: 390x844
- mobile-412x915: 412x915

module_policy:
- canvas_first: true
- windowed_modules: [movable, edge_snap, reset_position]
- conflict_resolution: "module adapts before canvas"

safe_area_policy:
- apply_top_inset_on_supported_non_desktop: true
- apply_bottom_inset_on_supported_non_desktop: true
- apply_horizontal_inset_on_supported_landscape: true
- inset_source: "env(safe-area-inset-*) only"

output_format:
- section_1: DESIGN_INTENT (max 5 bullets)
- section_2: TOKEN_MAP (table: token, purpose, palette source)
- section_3: VIEWPORT_LAYOUT_MATRIX (table per viewport id)
- section_4: SAFE_AREA_RULES (explicit yes/no rules)
- section_5: WINDOWED_MODULE_RULES (open/drag/reset/recovery)
- section_6: QA_CHECKLIST (pass/fail checklist aligned to matrix)
- section_7: BLOCKERS (missing inputs or contract conflicts)

[TASK]
Generate the full design contract.

[CONSTRAINTS]
- Do not output final style snippets with raw hex values.
- Do not invent viewport IDs outside the input matrix.
- Do not reduce canvas priority to satisfy module density.
- If a rule cannot be satisfied, report it in BLOCKERS instead of guessing.
```

## Short KR Variant
```text
v10 디자인 계약 생성.
입력: palette_hex, token_constraints, viewport_matrix, output_format.
규칙:
1) 하드코딩 색상 금지 (최종 산출물은 토큰만 사용)
2) canvas-first 유지
3) windowed module은 이동/스냅/리셋 가능
4) safe-area는 env(safe-area-inset-*)만 사용
출력: DESIGN_INTENT, TOKEN_MAP, VIEWPORT_LAYOUT_MATRIX, SAFE_AREA_RULES, QA_CHECKLIST.
```

## Short EN Variant
```text
Generate a v10 design contract using palette_hex, token_constraints, viewport_matrix, and output_format.
Rules:
1) No hardcoded colors in final styles (token references only)
2) Keep canvas-first priority
3) Windowed modules must support move/snap/reset
4) Safe-area must use env(safe-area-inset-*) only
Output: DESIGN_INTENT, TOKEN_MAP, VIEWPORT_LAYOUT_MATRIX, SAFE_AREA_RULES, QA_CHECKLIST.
```
