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
        brand: {
          burgundy: {
            DEFAULT: "#6B1F32",
            dark: "#541726",
            light: "#84273E",
            soft: "#F8EFF1",
          },
          cream: {
            DEFAULT: "#F5F0E8",
            light: "#FAF7F2",
            dark: "#EADECF",
          },
          black: {
            DEFAULT: "#171717",
            light: "#262626",
            dark: "#0F0F0F",
          },
          grey: {
            DEFAULT: "#777777",
            light: "#A3A3A3",
            border: "#E5E5E5",
          },
        },
      },
      fontFamily: {
        serif: ["Playfair Display", "Georgia", "serif"],
        sans: ["Inter", "system-ui", "-apple-system", "sans-serif"],
      },
    },
  },
  plugins: [],
};

export default config;
