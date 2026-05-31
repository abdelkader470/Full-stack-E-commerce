export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"]
      },
      colors: {
        ink: "#101828",
        mist: "#f7f7f7",
        bone: "#f7f7f7",
        noir: "#111111",
        brand: {
          50: "#f7f7f7",
          100: "#eeeeee",
          200: "#d7d7d7",
          500: "#6b6b6b",
          600: "#111111",
          700: "#000000",
          900: "#050505"
        },
        coral: "#d32f2f",
        saffron: "#111111"
      },
      boxShadow: {
        glow: "0 30px 90px rgba(17, 17, 17, 0.14)",
        editorial: "0 18px 60px rgba(17, 17, 17, 0.18)"
      }
    }
  },
  plugins: []
};
