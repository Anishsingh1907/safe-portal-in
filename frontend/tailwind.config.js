/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: "#0f2b36",
          light: "#16404f",
          deep: "#081a21",
        },
        coral: {
          DEFAULT: "#f07a63",
          dark: "#e15a3f",
        },
        sand: "#fbf7f4",
        safe: "#2a9d6f",
        caution: "#e0a63a",
        risk: "#d43b2a",
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Inter'", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 8px 24px rgba(8, 26, 33, 0.08)",
      },
    },
  },
  plugins: [],
};
