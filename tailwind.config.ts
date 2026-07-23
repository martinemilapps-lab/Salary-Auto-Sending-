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
        background: "var(--background)",
        foreground: "var(--foreground)",
        brand: {
          50: "#eefdff",
          100: "#d8f9ff",
          500: "#00b4d8",
          600: "#0096c7",
          700: "#03045e",
        },
        whatsapp: {
          500: "#25D366",
          600: "#128C7E",
          700: "#075E54",
        }
      },
    },
  },
  plugins: [],
};
export default config;
