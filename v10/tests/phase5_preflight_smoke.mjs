import fs from "node:fs";
import path from "node:path";

const root = process.cwd();

const read = (relativePath) =>
  fs.readFileSync(path.join(root, relativePath), "utf8");

const exists = (relativePath) => fs.existsSync(path.join(root, relativePath));

const assertIncludes = (content, pattern, message) => {
  if (!content.includes(pattern)) {
    throw new Error(message);
  }
};

const toBool = (value) => {
  if (typeof value !== "string" || value.trim() === "") return false;
  const normalized = value.trim().toLowerCase();
  if (["1", "true", "yes", "on"].includes(normalized)) return true;
  if (["0", "false", "no", "off"].includes(normalized)) return false;
  throw new Error(`invalid boolean env value '${value}'`);
};

const flags = {
  snapshot: toBool(process.env.NEXT_PUBLIC_PHASE5_SNAPSHOT_ENABLED),
  liveOneWay: toBool(process.env.NEXT_PUBLIC_PHASE5_LIVE_ONEWAY_ENABLED),
  liveTwoWay: toBool(process.env.NEXT_PUBLIC_PHASE5_LIVE_TWOWAY_ENABLED),
  partialSharing: toBool(process.env.NEXT_PUBLIC_PHASE5_PARTIAL_SHARING_ENABLED),
  aiApproval: toBool(process.env.NEXT_PUBLIC_PHASE5_AI_APPROVAL_ENABLED),
};

if (flags.liveTwoWay && !flags.liveOneWay) {
  throw new Error("phase5 preflight: liveTwoWay requires liveOneWay enabled");
}

const rolePolicy = read("src/core/config/rolePolicy.ts");
assertIncludes(
  rolePolicy,
  'defaultDecision: "deny"',
  "phase5 preflight: rolePolicy must stay deny-by-default"
);

const commandPolicy = read("src/features/extensions/commandExecutionPolicy.ts");
assertIncludes(
  commandPolicy,
  "shouldQueueCommandApprovalByPolicyForRole",
  "phase5 preflight: command approval queue guard missing"
);

const toolPolicy = read("src/features/extensions/toolExecutionPolicy.ts");
assertIncludes(
  toolPolicy,
  "shouldQueueToolApprovalByPolicyForRole",
  "phase5 preflight: tool approval queue guard missing"
);

if (flags.snapshot) {
  if (!exists("src/app/view/[shareId]/page.tsx")) {
    throw new Error("phase5 preflight: snapshot flag ON but /view/[shareId] route missing");
  }
}

if (flags.liveOneWay) {
  const syncHook = read("src/features/sync/useAsymmetricSessionSync.ts");
  assertIncludes(
    syncHook,
    "createRealtimeBackplane",
    "phase5 preflight: live one-way requires realtime backplane hook"
  );

  if (!process.env.NEXT_PUBLIC_SYNC_REALTIME_URL) {
    throw new Error(
      "phase5 preflight: live one-way flag ON but NEXT_PUBLIC_SYNC_REALTIME_URL missing"
    );
  }
}

if (flags.liveTwoWay) {
  const registry = read("../codex_tasks/workflow/feature_flag_registry.env");
  assertIncludes(
    registry,
    "NEXT_PUBLIC_PHASE5_LIVE_TWOWAY_ENABLED",
    "phase5 preflight: two-way cutover flag not registered"
  );
}

if (flags.partialSharing) {
  const hasLayerShareScope = [
    "src/core/types/snapshot.ts",
    "src/features/sharing/snapshotSerializer.ts",
    "src/features/sharing/useSnapshotShare.ts",
  ].some((candidate) => exists(candidate));

  if (!hasLayerShareScope) {
    throw new Error(
      "phase5 preflight: partial sharing flag ON but sharing scope scaffolding is missing"
    );
  }
}

if (flags.aiApproval) {
  if (!exists("src/features/toolbar/PendingApprovalPanel.tsx")) {
    throw new Error(
      "phase5 preflight: AI approval flag ON but PendingApprovalPanel is missing"
    );
  }
}

console.log(
  `[phase5_preflight_smoke] PASS snapshot=${flags.snapshot} oneWay=${flags.liveOneWay} twoWay=${flags.liveTwoWay} partial=${flags.partialSharing} ai=${flags.aiApproval}`
);
