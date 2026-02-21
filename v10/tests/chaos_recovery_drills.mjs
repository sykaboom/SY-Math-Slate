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

const communityRoute = read("src/app/api/community/route.ts");
assertIncludes(
  communityRoute,
  "community-invalid-traffic-blocked",
  "community route must keep invalid-traffic block path."
);
assertIncludes(
  communityRoute,
  "evaluateUgcSafetyText",
  "community route must invoke UGC safety evaluator."
);
assertIncludes(
  communityRoute,
  "verdict === \"block\"",
  "community route must keep UGC safety block branch."
);
assertIncludes(
  communityRoute,
  "safetyEvents",
  "community snapshot path must include safetyEvents."
);
assertIncludes(
  communityRoute,
  "community-host-token-invalid",
  "community route must keep host-token validation path."
);

const communityContract = read("src/core/foundation/schemas/community.ts");
assertIncludes(
  communityContract,
  "validateCommunitySafetyEvent",
  "community contract must validate safety event entries."
);
assertIncludes(
  communityContract,
  "safetyEvents",
  "community snapshot contract must require safetyEvents."
);

const backplane = read("src/features/sync/realtime/backplane.ts");
assertIncludes(
  backplane,
  "NEXT_PUBLIC_SYNC_REALTIME_URL",
  "backplane must keep canonical realtime endpoint key."
);
assertIncludes(
  backplane,
  "broadcast-channel",
  "backplane should keep broadcast-channel fallback."
);

console.log("[chaos_recovery_drills] PASS");
