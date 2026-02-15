export type PolicyShadowMetadataValue = string | number | boolean | null;

export type PolicyShadowMetadata = Record<string, PolicyShadowMetadataValue>;

export type PolicyBooleanDiffInput = {
  decisionKey: string;
  role: string;
  legacyValue: boolean;
  policyValue: boolean;
  metadata?: PolicyShadowMetadata;
};

const SHADOW_FLAG_ENABLED = process.env.NEXT_PUBLIC_POLICY_SHADOW === "1";
const emittedSignatures = new Set<string>();

const serializeMetadataValue = (value: PolicyShadowMetadataValue): string => {
  if (value === null) {
    return "null";
  }
  if (typeof value === "string") {
    return `s:${value}`;
  }
  if (typeof value === "number") {
    return Number.isFinite(value) ? `n:${value}` : "n:non-finite";
  }
  return value ? "b:1" : "b:0";
};

const createDiffSignature = ({
  decisionKey,
  role,
  legacyValue,
  policyValue,
  metadata,
}: PolicyBooleanDiffInput): string => {
  const metadataEntries = Object.entries(metadata ?? {}).sort(([a], [b]) =>
    a.localeCompare(b)
  );
  const metadataSignature = metadataEntries
    .map(([key, value]) => `${key}=${serializeMetadataValue(value)}`)
    .join("|");

  return [
    decisionKey,
    `role=${role}`,
    `legacy=${legacyValue ? "1" : "0"}`,
    `policy=${policyValue ? "1" : "0"}`,
    `meta=${metadataSignature}`,
  ].join("::");
};

export const isPolicyShadowEnabled = (): boolean => SHADOW_FLAG_ENABLED;

export const reportPolicyBooleanDiff = (input: PolicyBooleanDiffInput): void => {
  if (!SHADOW_FLAG_ENABLED) {
    return;
  }
  if (input.legacyValue === input.policyValue) {
    return;
  }

  const signature = createDiffSignature(input);
  if (emittedSignatures.has(signature)) {
    return;
  }
  emittedSignatures.add(signature);

  console.warn("[policy-shadow] boolean mismatch", {
    decisionKey: input.decisionKey,
    role: input.role,
    legacyValue: input.legacyValue,
    policyValue: input.policyValue,
    metadata: input.metadata ?? null,
  });
};

export const reportPolicyBooleanDiffBatch = (
  entries: ReadonlyArray<PolicyBooleanDiffInput>
): void => {
  if (!SHADOW_FLAG_ENABLED) {
    return;
  }
  for (const entry of entries) {
    reportPolicyBooleanDiff(entry);
  }
};
