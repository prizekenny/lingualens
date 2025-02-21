module.exports = {
  content: [
    "./App.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#FF914D",
        secondary: "#FF914D",
        background: "#F2F2F2",
        textPrimary: "#212121",
        textSecondary: "#757575",
        danger: "#E53935",
        success: "#43A047",
      },
    },
  },
  plugins: [],
};
console.log("Tailwind Config Loaded");
