# UI Golden Screen Contract

## Purpose
Define the baseline "golden screen" that must hold across desktop, tablet, and mobile for the v10 canvas-first product shell.

This contract is design SSOT for:
- viewport coverage
- canvas-first behavior
- windowed module behavior
- safe-area handling

## Golden Screen Definition
The golden screen is the first stable layout state where:
- canvas is immediately usable
- top/bottom chrome is visible and non-blocking
- module launcher is reachable
- no blocking overlay hides the writing surface by default

## Viewport Class Rules
| Class | Runtime rule | Notes |
| --- | --- | --- |
| Mobile | width `<= 767` | Thumb-first, compact controls |
| Tablet | width `768-1279` | Dual-mode (ink + modules) with strict safe-area checks |
| Desktop | width `>= 1280` | Full workspace baseline, reference design at `1440x1080` |

## Viewport Matrix (Contract Targets)
| Class | ID | Width x Height | Orientation | Priority |
| --- | --- | --- | --- | --- |
| Desktop | `desktop-ref-1440x1080` | `1440x1080` | Landscape | Required reference |
| Tablet | `tablet-768x1024` | `768x1024` | Portrait | Required |
| Tablet | `tablet-820x1180` | `820x1180` | Portrait | Required |
| Tablet | `tablet-1024x768` | `1024x768` | Landscape | Required |
| Tablet | `tablet-1180x820` | `1180x820` | Landscape | Required |
| Mobile | `mobile-360x800` | `360x800` | Portrait | Required |
| Mobile | `mobile-390x844` | `390x844` | Portrait | Required |
| Mobile | `mobile-412x915` | `412x915` | Portrait | Required |

## Canvas-First + Windowed Module Contract
1. Canvas has priority over module surface area at every viewport.
2. On initial render, no module may fully cover the center writing lane.
3. Module launcher must remain visible and tappable in every matrix viewport.
4. Windowed modules must support edge snap and reset-to-default actions.
5. If space conflict occurs, modules collapse/dock before shrinking canvas below usable state.
6. Module movement/resize must stay inside safe bounds (including safe-area insets).

## Safe-Area Contract
1. Use `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)` on non-desktop when supported.
2. Use horizontal safe-area padding in landscape when supported (`env(safe-area-inset-left/right)`).
3. Never hardcode notch values; safe-area must be env-driven.
4. If safe-area is unsupported, behavior must degrade to zero inset with no layout break.

## Invariant Checklist
Mark every item `PASS` before design sign-off.

| ID | Invariant | PASS/FAIL |
| --- | --- | --- |
| GS-01 | Viewport class thresholds follow mobile/tablet/desktop rules exactly. |  |
| GS-02 | All viewport IDs in the matrix are covered by design output. |  |
| GS-03 | Canvas is interactive at first stable frame (no blocking default overlay). |  |
| GS-04 | Default module state preserves the main writing surface. |  |
| GS-05 | Windowed module launcher is reachable in all matrix viewports. |  |
| GS-06 | Windowed modules provide edge snap behavior. |  |
| GS-07 | Windowed modules provide reset-to-default position behavior. |  |
| GS-08 | Top chrome applies safe-area inset on supported non-desktop devices. |  |
| GS-09 | Bottom chrome applies safe-area inset on supported non-desktop devices. |  |
| GS-10 | Horizontal safe-area inset is applied for supported landscape cases. |  |
| GS-11 | Minimum touch target is `>= 44px` for primary controls. |  |
| GS-12 | Conflict policy is canvas-first (module adapts first, not canvas). |  |

## Fail Conditions
- Any viewport in the matrix missing from redline/spec output
- Any default layout where module chrome blocks primary writing area
- Any use of hardcoded safe-area padding values
