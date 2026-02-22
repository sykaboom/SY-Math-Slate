export type ResolvedToolbarPlanDrawActions = {
  hand: boolean;
  pen: boolean;
  eraser: boolean;
  laser: boolean;
  text: boolean;
  image: boolean;
  clipboard: boolean;
  undoRedo: boolean;
  breakActions: boolean;
};

export type ResolvedToolbarPlanPlaybackActions = {
  step: boolean;
  undoRedo: boolean;
  sound: boolean;
  extras: boolean;
};

export type ResolvedToolbarPlanCanvasActions = {
  fullscreen: boolean;
  sound: boolean;
};

export type ResolvedToolbarPlanMorePanelSections = {
  step: boolean;
  history: boolean;
};
