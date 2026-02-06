import type { ModInput } from "@core/types/canvas";
import type { AnimationProfile } from "@features/animation/model/animationProfile";

// External mod payload can arrive from any transport/serialization format.
export type AnimationModInput = ModInput;

export type AnimationModNormalizer = (
  input: AnimationModInput
) => AnimationProfile | null;
