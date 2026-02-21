import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

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
          patterns: ["@features/*"],
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
            "@features/*",
            "@features/**",
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
      // Compat allowlist mode (R3): old core paths are warned, not hard-failed.
      "no-restricted-imports": [
        "warn",
        {
          patterns: [
            "@core/mod",
            "@core/mod/*",
            "@core/config/*",
            "@core/contracts",
            "@core/contracts/*",
            "@core/engine/*",
            "@core/extensions/*",
            "@core/math/*",
            "@core/migrations/*",
            "@core/persistence/*",
            "@core/sanitize/*",
            "@core/theme/*",
            "@core/themes/*",
            "@core/types/*",
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
