import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: ["class", '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        radya: {
          blue: "#1793E8",
          bright: "#29B6F6",
          navy: "#0F172A",
          deep: "#020617",
          teal: "#43D3A4",
          magenta: "#EC008C",
        },
      },
      fontFamily: {
        head: ["var(--font-exo)", "sans-serif"],
        body: ["var(--font-raleway)", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
