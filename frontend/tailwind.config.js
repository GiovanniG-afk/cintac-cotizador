/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        papel: "#EFF2F1",
        tinta: "#16232B",
        acero: "#2F4858",
        "acero-claro": "#5C7A8A",
        ambar: "#D69A2D",
        exito: "#3C7A5E",
        peligro: "#B23A2E",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
      },
      fontSize: {
        base: ["1.05rem", "1.6rem"],
        lg: ["1.2rem", "1.75rem"],
      },
    },
  },
  plugins: [],
};
