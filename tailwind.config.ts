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
        brand: {
          50: "#F5F2FE",
          100: "#EDE9FE",
          200: "#DDD6FE",
          300: "#C4B5FD",
          400: "#A78BFA",
          500: "#8B5CF6",
          600: "#6529E8", // Primary purple from screenshot
          700: "#541FD0",
          800: "#4414B0",
          900: "#320D86",
        },
        navy: {
          950: "#0B0E1E",
          900: "#10152B", // Dark sidebar background
          800: "#161C38",
          700: "#1E2548",
          600: "#2B335C",
        },
        dashboardBg: "#F7F8FC",
        darkText: "#171A2B",
        mutedText: "#64748B",
      },
      fontFamily: {
        sans: [
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
      },
      boxShadow: {
        card: "0 1px 3px 0 rgba(0, 0, 0, 0.04), 0 1px 2px -1px rgba(0, 0, 0, 0.02)",
        soft: "0 4px 20px -2px rgba(16, 21, 43, 0.06)",
        dropdown: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
        brand: "0 4px 14px 0 rgba(101, 41, 232, 0.35)",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.25rem",
      },
    },
  },
  plugins: [],
} satisfies Config;
