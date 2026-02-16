#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";

const KNOWN_SLOTS = [
  "chrome-top-toolbar",
  "left-panel",
  "toolbar-inline",
  "toolbar-bottom",
];

const readArg = (args, flag) => {
  const index = args.indexOf(flag);
  if (index < 0) return undefined;
  return args[index + 1];
};

const ensureNonEmpty = (value, name) => {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${name} is required.`);
  }
  return value.trim();
};

const toTemplate = ({ pluginId, slot, commandId }) => ({
  manifestVersion: 1,
  pluginId,
  ui: [
    {
      id: `${pluginId}-primary-action`,
      slot,
      type: "button",
      props: {
        label: pluginId,
        icon: "wand",
        disabled: false,
      },
      action: {
        commandId,
        payload: {},
      },
    },
  ],
});

const validateManifest = (candidate) => {
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) {
    return { ok: false, error: "manifest must be an object." };
  }
  if (candidate.manifestVersion !== 1) {
    return { ok: false, error: "manifestVersion must be 1." };
  }
  if (typeof candidate.pluginId !== "string" || candidate.pluginId.trim() === "") {
    return { ok: false, error: "pluginId must be non-empty string." };
  }
  if (!Array.isArray(candidate.ui) || candidate.ui.length === 0) {
    return { ok: false, error: "ui must be non-empty array." };
  }
  const entry = candidate.ui[0];
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
    return { ok: false, error: "ui[0] must be object." };
  }
  if (typeof entry.id !== "string" || entry.id.trim() === "") {
    return { ok: false, error: "ui[0].id must be non-empty string." };
  }
  if (typeof entry.slot !== "string" || !KNOWN_SLOTS.includes(entry.slot)) {
    return { ok: false, error: `ui[0].slot must be one of: ${KNOWN_SLOTS.join(", ")}` };
  }
  if (entry.type !== "button" && entry.type !== "panel") {
    return { ok: false, error: "ui[0].type must be button or panel." };
  }
  if (
    !entry.action ||
    typeof entry.action !== "object" ||
    typeof entry.action.commandId !== "string" ||
    entry.action.commandId.trim() === ""
  ) {
    return { ok: false, error: "ui[0].action.commandId must be non-empty string." };
  }
  return { ok: true };
};

const printUsage = () => {
  console.log("Usage:");
  console.log("  node scripts/modding_sdk_cli.mjs list-slots");
  console.log(
    "  node scripts/modding_sdk_cli.mjs init --plugin-id <id> --slot <slot> --command <commandId> [--out <path>]"
  );
  console.log("  node scripts/modding_sdk_cli.mjs validate --manifest <path>");
};

const main = () => {
  const [, , command, ...rest] = process.argv;
  if (!command || command === "-h" || command === "--help") {
    printUsage();
    return;
  }

  if (command === "list-slots") {
    console.log(KNOWN_SLOTS.join("\n"));
    return;
  }

  if (command === "init") {
    const pluginId = ensureNonEmpty(readArg(rest, "--plugin-id"), "--plugin-id");
    const slot = ensureNonEmpty(readArg(rest, "--slot"), "--slot");
    const commandId = ensureNonEmpty(readArg(rest, "--command"), "--command");
    if (!KNOWN_SLOTS.includes(slot)) {
      throw new Error(`--slot must be one of: ${KNOWN_SLOTS.join(", ")}`);
    }

    const outArg = readArg(rest, "--out");
    const outPath = outArg
      ? path.resolve(outArg)
      : path.resolve(`${pluginId}.manifest.json`);
    const template = toTemplate({ pluginId, slot, commandId });
    fs.writeFileSync(outPath, `${JSON.stringify(template, null, 2)}\n`, "utf8");
    console.log(`created manifest scaffold: ${outPath}`);
    return;
  }

  if (command === "validate") {
    const manifestPath = ensureNonEmpty(readArg(rest, "--manifest"), "--manifest");
    const resolved = path.resolve(manifestPath);
    const raw = fs.readFileSync(resolved, "utf8");
    const parsed = JSON.parse(raw);
    const validation = validateManifest(parsed);
    if (!validation.ok) {
      throw new Error(`manifest validation failed: ${validation.error}`);
    }
    console.log("manifest validation: PASS");
    return;
  }

  throw new Error(`unknown command: ${command}`);
};

try {
  main();
} catch (error) {
  const message = error instanceof Error ? error.message : "unknown error";
  console.error(`[modding-sdk-cli] FAIL: ${message}`);
  process.exit(1);
}
