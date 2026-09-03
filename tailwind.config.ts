import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0F2A44",
          dark: "#0A1D30",
          light: "#1B3D5E",
        },
        gold: {
          DEFAULT: "#C5A021",
          light: "#D9B84A",
          dark: "#A8871A",
        },
        offwhite: "#F8FAFC",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "sans-serif"],
        heading: ["var(--font-poppins)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
