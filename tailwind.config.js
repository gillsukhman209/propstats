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
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      screens: {
        xs: "400px",
        "3xl": "1970px", // For very large screens (e.g., Full HD)
        "4xl": "2760px", // For 2K resolutions
        "5xl": "3840px", // For 4K resolutions
      },
    },
  },
  plugins: [],
};
