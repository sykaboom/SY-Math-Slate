import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const read = (relativePath) =>
  fs.readFileSync(path.join(root, relativePath), "utf8");

const experimentsSource = read("v10/src/core/config/experiments.ts");
const abFlagsSource = read("v10/src/features/experiments/abFlags.ts");
const registryEnv = read("codex_tasks/workflow/experiment_registry.env");
const featureFlags = read("codex_tasks/workflow/feature_flag_registry.env");

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

assert(
  experimentsSource.includes("EXPERIMENT_DEFINITIONS"),
  "experiments.ts must export EXPERIMENT_DEFINITIONS."
);
assert(
  abFlagsSource.includes("resolveExperimentAssignment"),
  "abFlags.ts must expose resolveExperimentAssignment."
);
assert(
  abFlagsSource.includes("NEXT_PUBLIC_EXPERIMENT_SALT"),
  "abFlags.ts must consume NEXT_PUBLIC_EXPERIMENT_SALT."
);
assert(
  featureFlags.includes("NEXT_PUBLIC_EXPERIMENT_SALT="),
  "feature flag registry must include NEXT_PUBLIC_EXPERIMENT_SALT."
);

const idMatches = [...experimentsSource.matchAll(/id:\s*"([^"]+)"/g)];
const experimentIds = idMatches.map((entry) => entry[1]);
assert(experimentIds.length > 0, "experiment registry must define at least one id.");

const toEnvKey = (id) =>
  `EXPERIMENT_${id.toUpperCase().replace(/[^A-Z0-9]+/g, "_")}=`;

for (const id of experimentIds) {
  const expectedKey = toEnvKey(id);
  assert(
    registryEnv.includes(expectedKey),
    `experiment registry env missing key for id '${id}'.`
  );
}

console.log("[experiment_registry_guard] PASS");
