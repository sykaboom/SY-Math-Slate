const sanitizeTokenPart = (value: string): string =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

export const toGlobalThemeVariable = (tokenKey: string): string =>
  `--theme-${sanitizeTokenPart(tokenKey)}`;

export const toModuleScopedThemeVariable = (
  moduleId: string,
  tokenKey: string
): string => `--mod-${sanitizeTokenPart(moduleId)}-${sanitizeTokenPart(tokenKey)}`;

export const applyThemeDraftPreview = (
  globalTokens: Record<string, string>,
  moduleScopedTokens: Record<string, Record<string, string>>
): void => {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  Object.entries(globalTokens).forEach(([tokenKey, tokenValue]) => {
    root.style.setProperty(toGlobalThemeVariable(tokenKey), tokenValue);
  });
  Object.entries(moduleScopedTokens).forEach(([moduleId, tokens]) => {
    Object.entries(tokens).forEach(([tokenKey, tokenValue]) => {
      root.style.setProperty(
        toModuleScopedThemeVariable(moduleId, tokenKey),
        tokenValue
      );
    });
  });
};
