/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",

  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",           // if you have src/
    "./(auth)/**/*.{js,ts,jsx,tsx,mdx}",        // grouped routes
    "./(tabs)/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  presets: [require("nativewind/preset")],

  theme: {
    extend: {
      colors: {
        cream: "#EDEEDA",
        navy: "#283A55",
        gold: "#b89d63",
        tan: "#b8a48c",
        danger: "#dc2626",
        cardLight: "#ffffff",
        cardDark: "#1e293b",
        backgroundDark: "#0f172a",
        textLightPrimary: "#283A55",
        textLightSecondary: "#555555",
        textDarkSecondary: "#bbbbbb",
        primary: "#283A55",
        "primary-light": "#ffffff",
      },
      borderRadius: {
        none: "0",
        sm: "0.125rem",
        DEFAULT: "0.25rem",
        md: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },

  plugins: [],
};