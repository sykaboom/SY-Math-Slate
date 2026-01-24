import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "slate-app": "#111111",
        "slate-panel": "rgba(30, 30, 30, 0.95)",
        "neon-yellow": "#FFFF00",
        "neon-cyan": "#00FFFF",
        "neon-pink": "#FF10F0",
        "neon-green": "#39FF14",
        "cursor-blink": "#FFA500",
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
