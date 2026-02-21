import {
  getExperimentDefinitionById,
  validateExperimentRegistry,
  type ExperimentId,
  type ExperimentVariant,
} from "@core/foundation/policies/experiments";

export type ExperimentAssignment = {
  experimentId: string;
  variant: ExperimentVariant;
  bucket: number;
  eligible: boolean;
};

const DEFAULT_EXPERIMENT_SALT = "sy-math-slate-v10";

const getExperimentSalt = (): string => {
  const fromEnv = process.env.NEXT_PUBLIC_EXPERIMENT_SALT;
  if (typeof fromEnv !== "string") return DEFAULT_EXPERIMENT_SALT;
  const normalized = fromEnv.trim();
  return normalized === "" ? DEFAULT_EXPERIMENT_SALT : normalized;
};

const fnv1aHash32 = (input: string): number => {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const toBucket = (seed: string): number => fnv1aHash32(seed) % 100;

const toVariantIndex = (seed: string, total: number): number => {
  if (total <= 1) return 0;
  return fnv1aHash32(seed) % total;
};

export const resolveExperimentAssignment = (input: {
  experimentId: string;
  subjectKey: string;
}): ExperimentAssignment => {
  const registryValidation = validateExperimentRegistry();
  if (!registryValidation.ok) {
    return {
      experimentId: input.experimentId,
      variant: "control",
      bucket: 0,
      eligible: false,
    };
  }

  const definition = getExperimentDefinitionById(input.experimentId);
  if (!definition) {
    return {
      experimentId: input.experimentId,
      variant: "control",
      bucket: 0,
      eligible: false,
    };
  }

  const salt = getExperimentSalt();
  const subject = input.subjectKey.trim();
  const bucket = toBucket(`${salt}:${definition.id}:${subject}`);
  const rollout = Math.floor(definition.rolloutPercent);
  const eligible = definition.enabled && subject.length > 0 && bucket < rollout;

  if (!eligible) {
    return {
      experimentId: definition.id,
      variant: "control",
      bucket,
      eligible: false,
    };
  }

  const variantIndex = toVariantIndex(
    `${salt}:${definition.id}:${subject}:variant`,
    definition.variants.length
  );
  const variant = definition.variants[variantIndex] ?? "control";

  return {
    experimentId: definition.id,
    variant,
    bucket,
    eligible: true,
  };
};

export const resolveExperimentVariant = (
  experimentId: ExperimentId,
  subjectKey: string
): ExperimentVariant =>
  resolveExperimentAssignment({ experimentId, subjectKey }).variant;
