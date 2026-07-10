import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette
        bg: {
          DEFAULT: "#080B10",
          secondary: "#0F141C",
          tertiary: "#151B24",
          elevated: "#1A2232",
        },
        border: {
          DEFAULT: "#1E2A3A",
          subtle: "#131B27",
          bright: "#243045",
        },
        brand: {
          red: "#E8192C",
          "red-dim": "#B01020",
          "red-glow": "rgba(232,25,44,0.15)",
        },
        accent: {
          cyan: "#00D4FF",
          "cyan-dim": "#0098B8",
          "cyan-glow": "rgba(0,212,255,0.12)",
        },
        text: {
          primary: "#F0F4FA",
          secondary: "#8A9BB0",
          muted: "#4A5A70",
          dim: "#2A3848",
        },
        status: {
          critical: "#E8192C",
          high: "#F59E0B",
          normal: "#22C55E",
          info: "#3B82F6",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "ticker": "ticker 40s linear infinite",
        "slide-in-right": "slideInRight 0.25s ease-out",
        "slide-in-left": "slideInLeft 0.2s ease-out",
        "fade-in": "fadeIn 0.2s ease-out",
        "shimmer": "shimmer 1.5s infinite",
      },
      keyframes: {
        ticker: {
          "0%": { transform: "translateX(100%)" },
          "100%": { transform: "translateX(-100%)" },
        },
        slideInRight: {
          "0%": { transform: "translateX(100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideInLeft: {
          "0%": { transform: "translateX(-100%)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
