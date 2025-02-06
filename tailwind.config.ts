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
        background: {
          DEFAULT: "var(--background)",
          200: "var(--background-200)",
          300: "var(--background-300)",
        },
        foreground: {
          DEFAULT: "var(--foreground)",
          200: "var(--foreground-200)",
          300: "var(--foreground-300)",
        },
        violet: {
          DEFAULT: "var(--violet)",
          200: "var(--violet-200)",
          300: "var(--violet-300)",
          400: "var(--violet-400)",
        },
        pink: {
          DEFAULT: "var(--pink)",
          200: "var(--pink-200)",
          300: "var(--pink-300)",
          400: "var(--pink-400)",
        },
      },
    },
    fontFamily: {
      display: ["var(--font-display)"],
      body: ["var(--font-body)"],
      secondary: ["var(--font-koluta)"],
    }
  },
  plugins: [],
} satisfies Config;
