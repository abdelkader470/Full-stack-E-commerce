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
        mist: "#f6f8fb",
        brand: {
          50: "#effcf8",
          100: "#d8f6ef",
          200: "#aeeadc",
          500: "#16a37b",
          600: "#0d8768",
          700: "#096b55",
          900: "#063f35"
        },
        coral: "#f26b5b",
        saffron: "#f5b841"
      },
      boxShadow: {
        glow: "0 24px 80px rgba(16, 24, 40, 0.12)"
      }
    }
  },
  plugins: []
};
