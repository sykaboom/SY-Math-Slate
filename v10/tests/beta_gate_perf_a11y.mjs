import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const read = (relativePath) =>
  fs.readFileSync(path.join(root, relativePath), "utf8");

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const appLayout = read("src/features/layout/AppLayout.tsx");
assert(
  appLayout.includes("aria-label=\"입력 편집실 열기\"") &&
    appLayout.includes("aria-label=\"전체화면 필기 시작\""),
  "critical app layout controls must keep aria labels."
);

const modStudioPanel = read("src/features/mod-studio/core/ModStudioPanel.tsx");
assert(
  modStudioPanel.includes("aria-label=\"Mod Studio\""),
  "Mod Studio panel must expose aria label."
);

const chunksDir = path.join(root, ".next", "static", "chunks");
assert(fs.existsSync(chunksDir), "build artifacts missing: .next/static/chunks");

const files = fs.readdirSync(chunksDir, { withFileTypes: true });
let totalBytes = 0;
for (const entry of files) {
  if (!entry.isFile()) continue;
  if (!entry.name.endsWith(".js")) continue;
  const fullPath = path.join(chunksDir, entry.name);
  totalBytes += fs.statSync(fullPath).size;
}

const maxBytesFromEnv = Number.parseInt(
  process.env.BETA_JS_BUNDLE_MAX_BYTES ?? "",
  10
);
const maxBytes = Number.isFinite(maxBytesFromEnv) && maxBytesFromEnv > 0
  ? maxBytesFromEnv
  : 3_200_000;
assert(
  totalBytes <= maxBytes,
  `JS bundle budget exceeded: ${totalBytes} > ${maxBytes}`
);

console.log(
  `[beta_gate_perf_a11y] PASS (js_bytes=${totalBytes}, budget=${maxBytes})`
);
