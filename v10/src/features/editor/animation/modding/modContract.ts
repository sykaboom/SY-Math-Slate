import type { ModInput } from "@core/foundation/types/canvas";
import type { AnimationProfile } from "@features/editor/animation/model/animationProfile";

// External mod payload can arrive from any transport/serialization format.
export type AnimationModInput = ModInput;

export type AnimationModNormalizer = (
  input: AnimationModInput
) => AnimationProfile | null;
