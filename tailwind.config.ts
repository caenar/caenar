import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "background-100": "#141414",
        "background-200": "#95979d",
        "background-300": "#d0d3d9",
        "background-400": "#3d3d3d",

        "foreground-100": "#eaefff",
        "foreground-200": "#d6dfff",
        "foreground-300": "#c3cdec",

        "violet-100": "#8d49ed",
        "violet-200": "#7e45cd",
        "violet-300": "#6a3aae",
        "violet-400": "#562d8f",

        "pink-100": "#ff54a1",
        "pink-200": "#e45093",
        "pink-300": "#bd447b",
        "pink-400": "#9a2c5d",
      },
      fontFamily: {
        body: ["Inclusive Sans", "sans-serif"],
        secondary: ["Koluta", "monospace"],
      },
    },
  },
  plugins: [],
} satisfies Config;
