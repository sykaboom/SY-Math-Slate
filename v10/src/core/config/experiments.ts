export const EXPERIMENT_VARIANTS = ["control", "treatment"] as const;

export type ExperimentVariant = (typeof EXPERIMENT_VARIANTS)[number];

export const EXPERIMENT_DEFINITIONS = [
  {
    id: "marketplace-layout-v1",
    description: "marketplace catalog ranking and grouping treatment",
    owner: "growth",
    rolloutPercent: 20,
    enabled: true,
    variants: EXPERIMENT_VARIANTS,
  },
  {
    id: "sdk-quickstart-hints-v1",
    description: "modding sdk quickstart hint treatment",
    owner: "growth",
    rolloutPercent: 30,
    enabled: true,
    variants: EXPERIMENT_VARIANTS,
  },
] as const;

export type ExperimentDefinition = (typeof EXPERIMENT_DEFINITIONS)[number];
export type ExperimentId = ExperimentDefinition["id"];

export type ExperimentRegistryValidationResult =
  | { ok: true }
  | { ok: false; code: string; message: string };

const isVariant = (value: unknown): value is ExperimentVariant =>
  typeof value === "string" &&
  (EXPERIMENT_VARIANTS as readonly string[]).includes(value);

export const validateExperimentRegistry = (
  registry: readonly ExperimentDefinition[] = EXPERIMENT_DEFINITIONS
): ExperimentRegistryValidationResult => {
  const ids = new Set<string>();
  for (const definition of registry) {
    if (ids.has(definition.id)) {
      return {
        ok: false,
        code: "duplicate-experiment-id",
        message: `duplicate experiment id '${definition.id}'.`,
      };
    }
    ids.add(definition.id);

    if (
      typeof definition.rolloutPercent !== "number" ||
      !Number.isFinite(definition.rolloutPercent) ||
      definition.rolloutPercent < 0 ||
      definition.rolloutPercent > 100
    ) {
      return {
        ok: false,
        code: "invalid-rollout-percent",
        message: `experiment '${definition.id}' rolloutPercent must be between 0 and 100.`,
      };
    }

    for (const variant of definition.variants) {
      if (!isVariant(variant)) {
        return {
          ok: false,
          code: "invalid-variant",
          message: `experiment '${definition.id}' includes unsupported variant.`,
        };
      }
    }
  }

  return { ok: true };
};

export const listExperimentDefinitions = (): ExperimentDefinition[] =>
  [...EXPERIMENT_DEFINITIONS];

export const getExperimentDefinitionById = (
  experimentId: string
): ExperimentDefinition | null =>
  EXPERIMENT_DEFINITIONS.find((entry) => entry.id === experimentId) ?? null;
