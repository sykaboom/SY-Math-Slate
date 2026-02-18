import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "slate-app": "rgba(var(--slate-app-rgb), <alpha-value>)",
        "slate-panel": "rgba(var(--slate-panel-rgb), <alpha-value>)",
        "swatch-red": "rgba(var(--swatch-red-rgb), <alpha-value>)",
        "swatch-yellow": "rgba(var(--swatch-yellow-rgb), <alpha-value>)",
        "swatch-cyan": "rgba(var(--swatch-cyan-rgb), <alpha-value>)",
        "swatch-green": "rgba(var(--swatch-green-rgb), <alpha-value>)",
        "swatch-pink": "rgba(var(--swatch-pink-rgb), <alpha-value>)",
        "swatch-white": "rgba(var(--swatch-white-rgb), <alpha-value>)",
        "neon-yellow": "rgba(var(--swatch-yellow-rgb), <alpha-value>)",
        "neon-cyan": "rgba(var(--swatch-cyan-rgb), <alpha-value>)",
        "neon-pink": "rgba(var(--swatch-pink-rgb), <alpha-value>)",
        "neon-green": "rgba(var(--swatch-green-rgb), <alpha-value>)",
        "cursor-blink": "rgba(var(--cursor-blink-rgb), <alpha-value>)",
        "toolbar-surface": "rgba(var(--toolbar-surface-rgb), <alpha-value>)",
        "toolbar-chip": "rgba(var(--toolbar-chip-rgb), <alpha-value>)",
        "toolbar-border": "rgba(var(--toolbar-border-rgb), <alpha-value>)",
        "toolbar-text": "rgba(var(--toolbar-text-rgb), <alpha-value>)",
        "toolbar-muted": "rgba(var(--toolbar-muted-rgb), <alpha-value>)",
        "toolbar-active-bg": "rgba(var(--toolbar-active-bg-rgb), <alpha-value>)",
        "toolbar-active-text":
          "rgba(var(--toolbar-active-text-rgb), <alpha-value>)",
        "toolbar-menu-bg": "rgba(var(--toolbar-menu-bg-rgb), <alpha-value>)",
        "toolbar-danger": "rgba(var(--toolbar-danger-rgb), <alpha-value>)",
        "theme-text": "rgba(var(--theme-text-rgb), <alpha-value>)",
        "theme-text-muted": "rgba(var(--theme-text-rgb), 0.62)",
        "theme-surface": "rgba(var(--theme-surface-rgb), <alpha-value>)",
        "theme-surface-soft": "var(--theme-surface-soft)",
        "theme-border": "rgba(var(--theme-border-rgb), <alpha-value>)",
        "theme-accent": "rgba(var(--theme-accent-rgb), <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "Noto Sans KR", "sans-serif"],
        mono: [
          "var(--font-mono)",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Monaco",
          "Consolas",
          "Liberation Mono",
          "Courier New",
          "monospace",
        ],
      },
    },
  },
  plugins: [],
};

export default config;
