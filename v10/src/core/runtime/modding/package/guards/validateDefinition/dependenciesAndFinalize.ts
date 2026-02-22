import type { ModPackageDefinition } from "../../types";
import { buildValidatedDefinitionImpl } from "./dependenciesAndFinalize/buildDefinition";
import { parseConflictsImpl } from "./dependenciesAndFinalize/parseConflicts";
import { parseDefaultEnabledImpl } from "./dependenciesAndFinalize/parseDefaultEnabled";
import { parseDependenciesImpl } from "./dependenciesAndFinalize/parseDependencies";
import type { BuildValidatedDefinitionInput } from "./dependenciesAndFinalize/types";

export const parseDependencies = (value: unknown) => parseDependenciesImpl(value);

export const parseConflicts = (value: unknown) => parseConflictsImpl(value);

export const parseDefaultEnabled = (value: unknown) => parseDefaultEnabledImpl(value);

export type { BuildValidatedDefinitionInput };

export const buildValidatedDefinition = (
  input: BuildValidatedDefinitionInput
): ModPackageDefinition => buildValidatedDefinitionImpl(input);
