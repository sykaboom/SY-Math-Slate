# Layout Task 238: Redlines (Remediated)

## Required Viewports
- `768x1024`
- `820x1180`
- `1024x768`
- `1180x820`

## Top/Bottom Chrome Rects (per viewport, px)
- `768x1024`
  - top: `x:0 y:0 w:768 h:60`
  - bottom: `x:0 y:964 w:768 h:60`
- `820x1180`
  - top: `x:0 y:0 w:820 h:60`
  - bottom: `x:0 y:1120 w:820 h:60`
- `1024x768`
  - top: `x:0 y:0 w:1024 h:60`
  - bottom: `x:0 y:708 w:1024 h:60`
- `1180x820`
  - top: `x:0 y:0 w:1180 h:60`
  - bottom: `x:0 y:760 w:1180 h:60`

## Canvas Safe Region (per viewport, px)
- `768x1024`: `x:0 y:60 w:768 h:904`
- `820x1180`: `x:0 y:60 w:820 h:1060`
- `1024x768`: `x:0 y:60 w:1024 h:648`
- `1180x820`: `x:0 y:60 w:1180 h:700`

## Launcher Anchors (per viewport, px)
- host/student anchors are aligned to left-bottom safe zone for each viewport:
  - `768x1024`: `x:24 y:884 w:56 h:56`
  - `820x1180`: `x:24 y:1040 w:56 h:56`
  - `1024x768`: `x:24 y:628 w:56 h:56`
  - `1180x820`: `x:24 y:680 w:56 h:56`

## Panel Min/Max (global constraints, px)
- DataInput: `min 320x240`, `max 640x800`
- ToolbarAux: `min 240x56`, `max 480x56`

## Default Rects (numeric, per viewport)
- Windowed defaults:
  - DataInput: `x:100 y:150 w:320 h:400`
  - ToolbarAux: `x:450 y:150 w:240 h:56`
- Docked defaults:
  - `768x1024`
    - DataInput: `x:448 y:60 w:320 h:904`
    - ToolbarAux: `x:0 y:908 w:448 h:56`
  - `820x1180`
    - DataInput: `x:500 y:60 w:320 h:1060`
    - ToolbarAux: `x:0 y:1064 w:500 h:56`
  - `1024x768`
    - DataInput: `x:704 y:60 w:320 h:648`
    - ToolbarAux: `x:0 y:652 w:704 h:56`
  - `1180x820`
    - DataInput: `x:860 y:60 w:320 h:700`
    - ToolbarAux: `x:0 y:704 w:860 h:56`

## Drag Clamp Formulas
- `minX = clampBounds.x`
- `minY = clampBounds.y`
- `maxX = clampBounds.x + clampBounds.width - panel.width`
- `maxY = clampBounds.y + clampBounds.height - panel.height`

## Touch Target Constraint
- Minimum: `44x44`
- `close_target_datainput`: remediated to `44x44`
- `close_target_toolbar`: remediated to `44x44`

## Reachability (per viewport)
- `768x1024`: close target `PASS`, recover target `PASS`
- `820x1180`: close target `PASS`, recover target `PASS`
- `1024x768`: close target `PASS`, recover target `PASS`
- `1180x820`: close target `PASS`, recover target `PASS`

## Policy Expectations
- host: launcher visible, edit panels visible
- student: launcher hidden, edit panels hidden
