/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        maroon: {
          light: "#9c3738",
          DEFAULT: "#7a1c1c",
          dark: "#4A0E0E",
        },
        gold: {
          light: "#F5D061",
          DEFAULT: "#F0C040",
          dark: "#c7971e",
        },
        saffron: "#e08316",
        sand: "#fdfbf7",
      },
      fontFamily: {
        heading: ["var(--font-heading)", "serif"],
        body: ["var(--font-body)", "sans-serif"],
      },
    },
  },
  plugins: [],
}
