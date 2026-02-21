import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const read = (relativePath) =>
  fs.readFileSync(path.join(root, relativePath), "utf8");

const assertIncludes = (content, pattern, message) => {
  if (!content.includes(pattern)) {
    throw new Error(message);
  }
};

const rolePolicy = read("src/core/foundation/policies/rolePolicy.ts");
assertIncludes(
  rolePolicy,
  "defaultDecision: \"deny\"",
  "rolePolicy must remain deny-by-default."
);
assertIncludes(
  rolePolicy,
  "publishRolePolicyDocument",
  "rolePolicy publish path must exist."
);

const appLayout = read("src/features/layout/AppLayout.tsx");
assertIncludes(
  appLayout,
  "ModStudioShell",
  "AppLayout must mount Mod Studio shell for host workflow."
);
assertIncludes(
  appLayout,
  "useAsymmetricSessionSync",
  "AppLayout must mount asymmetric sync hook."
);

const commandPolicy = read("src/features/extensions/commandExecutionPolicy.ts");
assertIncludes(
  commandPolicy,
  "shouldQueueCommandApprovalByPolicyForRole",
  "command policy queue guard must exist."
);

const toolPolicy = read("src/features/extensions/toolExecutionPolicy.ts");
assertIncludes(
  toolPolicy,
  "shouldQueueToolApprovalByPolicyForRole",
  "tool policy queue guard must exist."
);

console.log("[beta_gate_smoke] PASS");
