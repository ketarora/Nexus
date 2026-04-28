import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        nx: {
          bg: "#FAFBFC",
          surface: "#FFFFFF",
          "surface-2": "#F4F6F8",
          border: "#E5E9EF",
          "border-strong": "#D0D7DE",
          ink: "#0A0E1A",
          "ink-2": "#3D4759",
          "ink-3": "#6B7689",
          "ink-4": "#9CA5B4",
          primary: "#0052FF",
          "primary-soft": "#E6EFFF",
          "primary-ink": "#003BB8",
          critical: "#FF1744",
          "critical-soft": "#FFEBEE",
          high: "#FF6B00",
          "high-soft": "#FFF3E6",
          medium: "#F5A623",
          "medium-soft": "#FFF8E6",
          low: "#2EA043",
          "low-soft": "#E6F7EB",
          info: "#0969DA",
        },
      },
      fontFamily: {
        display: ["var(--font-geist)", "Inter", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "SF Mono", "monospace"],
      },
      boxShadow: {
        "nx-sm": "0 1px 2px rgba(10,14,26,0.04), 0 0 1px rgba(10,14,26,0.06)",
        "nx-md": "0 4px 12px rgba(10,14,26,0.06), 0 1px 3px rgba(10,14,26,0.04)",
        "nx-lg": "0 16px 32px rgba(10,14,26,0.08), 0 4px 8px rgba(10,14,26,0.04)",
        "nx-xl": "0 24px 48px rgba(10,14,26,0.12)",
        "nx-critical": "0 0 0 4px rgba(255,23,68,0.12), 0 8px 24px rgba(255,23,68,0.24)",
        "nx-primary": "0 0 24px rgba(0,82,255,0.18)",
      },
      animation: {
        "pulse-critical": "pulse-critical 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "float": "float 6s ease-in-out infinite",
        "ping-slow": "ping 2s cubic-bezier(0, 0, 0.2, 1) infinite",
        "breathe": "breathe 4s ease-in-out infinite",
      },
      keyframes: {
        "pulse-critical": {
          "0%, 100%": { boxShadow: "0 0 12px rgba(255,23,68,0.3)" },
          "50%": { boxShadow: "0 0 32px rgba(255,23,68,0.6)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
        breathe: {
          "0%, 100%": { opacity: "0.6", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.05)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
