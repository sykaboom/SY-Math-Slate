let hasRegisteredCoreDeclarativeManifest = false;

export const registerCoreDeclarativeManifest = (): void => {
  if (hasRegisteredCoreDeclarativeManifest) return;

  hasRegisteredCoreDeclarativeManifest = true;
};
