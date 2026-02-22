import type {
  ResolvedToolbarPlan,
  ResolvedToolbarPlanInput,
} from "../../../types";
import { selectToolbarBaseProvider } from "./baseProvider";
import { buildFallbackResolvedToolbarPlan } from "./constants";

export const selectResolvedToolbarPlan = (
  plan: ResolvedToolbarPlan
): ResolvedToolbarPlan => plan;

export const selectRuntimeToolbarCutoverEnabled = (): boolean =>
  process.env.NEXT_PUBLIC_CORE_TOOLBAR_CUTOVER !== "0";

export const selectResolvedToolbarPlanInputFromBaseProvider = (
  input: ResolvedToolbarPlanInput
): ResolvedToolbarPlan | null => {
  const provider = selectToolbarBaseProvider();
  if (!provider) return null;
  return provider.resolvePlan(input);
};

export const selectResolvedToolbarPlanInputFromRuntimeResolver = (
  input: ResolvedToolbarPlanInput
): ResolvedToolbarPlan =>
  selectResolvedToolbarPlanInputFromBaseProvider(input) ??
  selectResolvedToolbarPlan(buildFallbackResolvedToolbarPlan(input));
