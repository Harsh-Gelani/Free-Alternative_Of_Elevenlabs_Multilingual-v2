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
        studio: {
          950: "#090a0f",
          900: "#0e1017",
          850: "#13151f",
          800: "#181a27",
          700: "#222538",
          600: "#2d324d",
          500: "#444b70",
        },
        eleven: {
          purple: "#7c3aed",
          violet: "#8b5cf6",
          accent: "#a855f7",
          glow: "rgba(139, 92, 246, 0.25)",
        },
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "Courier New", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
