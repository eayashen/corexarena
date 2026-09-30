import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        pitch: {
          50: "#eefbf2",
          100: "#d6f7e0",
          200: "#aff0c3",
          300: "#7ae3a0",
          400: "#41ce79",
          500: "#10b958",
          600: "#089744",
          700: "#097738",
          800: "#0c5e2f",
          900: "#0b4d28",
          950: "#032b15",
        },
        stadium: {
          50: "#f8fafc",
          100: "#f1f5f9",
          200: "#e2e8f0",
          300: "#cbd5e1",
          400: "#94a3b8",
          500: "#64748b",
          600: "#475569",
          700: "#334155",
          800: "#1e293b",
          850: "#131d2e",
          900: "#0f172a",
          950: "#070d18",
        },
        gold: {
          400: "#fbbf24",
          500: "#f59e0b",
          600: "#d97706",
        }
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "-apple-system", "sans-serif"],
        display: ["var(--font-outfit)", "system-ui", "-apple-system", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 25px -5px rgba(16, 185, 88, 0.4)",
        "glow-gold": "0 0 25px -5px rgba(245, 158, 11, 0.4)",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "mesh-pattern": "radial-gradient(rgba(16, 185, 88, 0.15) 1px, transparent 1px)",
      }
    },
  },
  plugins: [],
};
export default config;
