import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: { 950: "#0a1830", 900: "#0f2347", 800: "#163061", 700: "#1f4080", 100: "#e6ebf5" },
        gold: { 500: "#c9a24a", 600: "#b08a35", 100: "#f6eed9" },
        paper: "#f8f7f4",
        ink: "#18202e",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [],
};
export default config;
