import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    fontSize: {
      "11": ["11px", { lineHeight: "1.4" }],
      "12": ["12px", { lineHeight: "1.5" }],
      "13": ["13px", { lineHeight: "1.5" }],
      "14": ["14px", { lineHeight: "1.5" }],
      "16": ["16px", { lineHeight: "1.5" }],
      "20": ["20px", { lineHeight: "1.4" }],
      "28": ["28px", { lineHeight: "1.25" }],
      "36": ["36px", { lineHeight: "1.2" }],
    },
    extend: {
      colors: {
        bg: "var(--bg)",
        "surface-1": "var(--surface-1)",
        "surface-2": "var(--surface-2)",
        "surface-3": "var(--surface-3)",
        line: "var(--line)",
        "line-strong": "var(--line-strong)",
        text: "var(--text)",
        "text-2": "var(--text-2)",
        "text-3": "var(--text-3)",
        accent: "var(--accent)",
        "accent-strong": "var(--accent-strong)",
        "accent-ink": "var(--accent-ink)",
        "accent-soft": "var(--accent-soft)",
        calm: "var(--calm)",
        "calm-soft": "var(--calm-soft)",
        abstract: "var(--abstract)",
        "abstract-soft": "var(--abstract-soft)",
        success: "var(--success)",
        warning: "var(--warning)",
        danger: "var(--danger)",
        info: "var(--info)",
      },
      spacing: {
        sidebar: "248px",
        "sidebar-collapsed": "64px",
        topbar: "52px",
        "1": "4px",
        "2": "8px",
        "3": "12px",
        "4": "16px",
        "5": "20px",
        "6": "24px",
        "7": "28px",
        "8": "32px",
        "9": "36px",
        "10": "40px",
        "12": "48px",
        "16": "64px",
        "20": "80px",
        "24": "96px",
      },
      borderRadius: {
        control: "4px",
        panel: "8px",
      },
      maxWidth: {
        content: "1240px",
      },
      width: {
        sidebar: "248px",
        "sidebar-collapsed": "64px",
      },
      height: {
        topbar: "52px",
        row: "36px",
        "row-compact": "32px",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
        serif: ["var(--font-serif)", "Georgia", "Times New Roman", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "Menlo", "monospace"],
      },
      transitionDuration: {
        "150": "150ms",
      },
      transitionTimingFunction: {
        out: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
    },
  },
  plugins: [],
};

export default config;
