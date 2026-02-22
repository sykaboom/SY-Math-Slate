import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const CORE_RUNTIME_FEATURE_IMPORT_PATTERNS = [
  "@features/*",
  "@features/**",
  "@/features/*",
  "@/features/**",
  "features/*",
  "features/**",
  "../features/*",
  "../features/**",
  "../../features/*",
  "../../features/**",
  "../../../features/*",
  "../../../features/**",
  "../../../../features/*",
  "../../../../features/**",
  "../../../../../features/*",
  "../../../../../features/**",
];

const DEPRECATED_CORE_COMPAT_IMPORT_PATTERNS = [
  "@core/mod",
  "@core/mod/*",
  "@core/config",
  "@core/config/*",
  "@core/contracts",
  "@core/contracts/*",
  "@core/engine",
  "@core/engine/*",
  "@core/extensions",
  "@core/extensions/*",
  "@core/math",
  "@core/math/*",
  "@core/migrations",
  "@core/migrations/*",
  "@core/persistence",
  "@core/persistence/*",
  "@core/sanitize",
  "@core/sanitize/*",
  "@core/theme",
  "@core/theme/*",
  "@core/themes",
  "@core/themes/*",
  "@core/types",
  "@core/types/*",
];

const LEGACY_FEATURE_COMPAT_IMPORT_PATTERNS = [
  "@features/layout",
  "@features/layout/*",
  "@features/toolbar",
  "@features/toolbar/*",
  "@features/ui-host",
  "@features/ui-host/*",
  "@features/shortcuts",
  "@features/shortcuts/*",
  "@features/theme",
  "@features/theme/*",
  "@features/viewer",
  "@features/viewer/*",
  "@features/sharing",
  "@features/sharing/*",
  "@features/sync",
  "@features/sync/*",
  "@features/canvas",
  "@features/canvas/*",
  "@features/editor-core",
  "@features/editor-core/*",
  "@features/animation",
  "@features/animation/*",
  "@features/input-studio",
  "@features/input-studio/*",
  "@features/community",
  "@features/community/*",
  "@features/moderation",
  "@features/moderation/*",
  "@features/policy",
  "@features/policy/*",
  "@features/extensions",
  "@features/extensions/*",
  "@features/mod-studio",
  "@features/mod-studio/*",
  "@features/observability",
  "@features/observability/*",
  "@features/store",
  "@features/store/*",
  "@features/experiments",
  "@features/experiments/*",
  "@features/hooks",
  "@features/hooks/*",
];

const RUNTIME_MODDING_DEEP_IMPORT_PATTERNS = [
  "@core/runtime/modding/package/*",
  "@core/runtime/modding/package/**",
  "@core/runtime/modding/host/inputRoutingBridge",
  "@core/runtime/modding/**/internal/*",
  "@core/runtime/modding/**/internal/**",
  "@core/mod/**/internal/*",
  "@core/mod/**/internal/**",
];

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    files: [
      "src/core/mod/builtin/**/*.{ts,tsx}",
      "src/core/runtime/modding/builtin/**/*.{ts,tsx}",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            "@features/layout",
            "@features/layout/*",
            "@features/store",
            "@features/store/*",
            "@features/layout/windowing",
            "@features/layout/windowing/*",
          ],
        },
      ],
    },
  },
  {
    files: [
      "src/core/mod/host/**/*.{ts,tsx}",
      "src/core/runtime/modding/host/**/*.{ts,tsx}",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [...CORE_RUNTIME_FEATURE_IMPORT_PATTERNS],
        },
      ],
    },
  },
  {
    files: [
      "src/core/mod/package/**/*.{ts,tsx}",
      "src/core/runtime/modding/package/**/*.{ts,tsx}",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            ...CORE_RUNTIME_FEATURE_IMPORT_PATTERNS,
            "@core/runtime/modding/host",
            "@core/runtime/modding/host/*",
            "@core/mod/host",
            "@core/mod/host/*",
          ],
        },
      ],
    },
  },
  {
    files: ["src/core/runtime/**/*.{ts,tsx}"],
    ignores: [
      "src/core/runtime/modding/host/**/*.{ts,tsx}",
      "src/core/runtime/modding/package/**/*.{ts,tsx}",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [...CORE_RUNTIME_FEATURE_IMPORT_PATTERNS],
        },
      ],
    },
  },
  {
    files: ["src/features/ui-host/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            "@core/runtime/modding/**/internal/*",
            "@core/mod/**/internal/*",
          ],
        },
      ],
    },
  },
  {
    files: [
      "src/features/**/*.{ts,tsx}",
      "src/app/**/*.{ts,tsx}",
      "src/mod/**/*.{ts,tsx}",
    ],
    rules: {
      // Finalized guardrail mode: deprecated compat/deep-import paths are hard-failed.
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            ...DEPRECATED_CORE_COMPAT_IMPORT_PATTERNS,
            ...LEGACY_FEATURE_COMPAT_IMPORT_PATTERNS,
            ...RUNTIME_MODDING_DEEP_IMPORT_PATTERNS,
          ],
        },
      ],
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
