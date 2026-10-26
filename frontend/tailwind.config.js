/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        darkgreen: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        gold: {
          100: '#fffbeb',
          200: '#fef3c7',
          300: '#fcd34d',
          400: '#eab308',
          500: '#gold',
          600: '#a16207',
          700: '#854d0e',
          800: '#713f12',
          900: '#4d2b05',
        }
      }
    }
  },
  plugins: []
}