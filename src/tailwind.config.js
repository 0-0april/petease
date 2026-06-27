export default {
  content: [
    "./frontend/index.html",
    "./frontend/**/*.html",
    "./frontend/**/*.js",
    "./frontend/**/*.jsx",
    "./frontend/**/*.ts",
    "./frontend/**/*.tsx",
    "./frontend/**/*.css"
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#166534',
          dark: '#14532d',
          light: '#22c55e'
        }
      }
    }
  },
  plugins: []
};
