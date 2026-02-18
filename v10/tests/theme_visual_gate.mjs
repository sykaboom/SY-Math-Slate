import fs from 'node:fs';
import path from 'node:path';

const rootDir = path.resolve(process.cwd());

const readText = (relativePath) =>
  fs.readFileSync(path.join(rootDir, relativePath), 'utf8');

const assertIncludes = (content, needle, message) => {
  if (!content.includes(needle)) {
    throw new Error(message);
  }
};

const themeTokenSource = readText('src/core/config/themeTokens.ts');
const presetSource = readText('src/core/themes/presets.ts');
const isolationSource = readText('src/features/mod-studio/theme/themeIsolation.ts');
const applyThemeSource = readText('src/core/theme/applyTheme.ts');
const storeSource = readText('src/features/store/useModStudioStore.ts');

['chalk', 'parchment', 'notebook'].forEach((presetId) => {
  assertIncludes(
    presetSource,
    `id: "${presetId}"`,
    `[theme_visual_gate] missing preset: ${presetId}`
  );
});

[
  'surface',
  'surface-soft',
  'surface-overlay',
  'text',
  'text-muted',
  'border',
  'accent',
  'success',
  'warning',
  'danger',
].forEach((tokenKey) => {
  assertIncludes(
    themeTokenSource,
    `"${tokenKey}"`,
    `[theme_visual_gate] missing token key: ${tokenKey}`
  );
});

assertIncludes(
  isolationSource,
  'resolveThemeDraftTokens',
  '[theme_visual_gate] resolveThemeDraftTokens is required for preset + override merge.'
);
assertIncludes(
  isolationSource + applyThemeSource,
  'THEME_MODULE_PREFIX',
  '[theme_visual_gate] module theme prefix constant is missing.'
);
assertIncludes(
  isolationSource + applyThemeSource,
  'toModuleScopedThemeVariable',
  '[theme_visual_gate] module scoped variable helper is missing.'
);
assertIncludes(
  isolationSource + applyThemeSource,
  'removeProperty(',
  '[theme_visual_gate] stale theme variables must be removed during preview/apply path.'
);
assertIncludes(
  storeSource,
  'delete nextGlobalTokens[normalizedKey]',
  '[theme_visual_gate] empty global token value should remove override entry.'
);
assertIncludes(
  storeSource,
  'delete nextModuleTokens[normalizedKey]',
  '[theme_visual_gate] empty module token value should remove override entry.'
);

console.log('[theme_visual_gate] PASS');
