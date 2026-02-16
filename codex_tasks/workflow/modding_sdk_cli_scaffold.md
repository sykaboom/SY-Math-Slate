# Modding SDK + CLI Scaffold (W10)

## Purpose
- Provide a dependency-free local scaffold path for manifest-first mod authors.
- Keep runtime validation as source-of-truth while enabling quick local iteration.

## SDK Facade
- Module: `v10/src/core/extensions/sdk/moddingSdk.ts`
- Exposed operations:
  - `listSlots()`
  - `listCommands()`
  - `validateManifest(input)`
  - `registerManifest(input)`
  - `createManifestTemplate(input)`
  - `dispatchCommand(commandId, payload, context)`

## CLI Commands
- `list-slots`
  - prints known slot names.
- `init --plugin-id <id> --slot <slot> --command <commandId> [--out <path>]`
  - writes a starter manifest JSON scaffold.
- `validate --manifest <path>`
  - runs local shape validation for manifest v1.

## Example
```bash
node scripts/modding_sdk_cli.mjs init \
  --plugin-id demo-quiz \
  --slot toolbar-bottom \
  --command setTool \
  --out /tmp/demo-quiz.manifest.json

node scripts/modding_sdk_cli.mjs validate --manifest /tmp/demo-quiz.manifest.json
```

## Notes
- CLI validation is intentionally minimal for local feedback speed.
- Runtime registration still uses strict validator in `pluginLoader.ts`.
