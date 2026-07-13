/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#1E3A8A",
          hover: "#1D4ED8"
        },
        background: "#EBEBEB",
        card: "#FFFFFF",
        heading: "#222222",
        body: "#5D636E",
        border: "#D4D6D9",
        success: "#22C55E",
        error: "#EF4444"
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"]
      },
      boxShadow: {
        soft: "0 1px 2px rgba(0, 0, 0, 0.04), 0 2px 8px rgba(0, 0, 0, 0.06)",
        card: "0 1px 3px rgba(0, 0, 0, 0.05), 0 4px 12px rgba(0, 0, 0, 0.05)"
      }
    }
  },
  plugins: []
};
