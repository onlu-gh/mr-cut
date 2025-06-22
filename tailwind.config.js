/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx}',     // App directory (App Router)
    './src/components/**/*.{js,ts,jsx,tsx}', // Your component folders
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}