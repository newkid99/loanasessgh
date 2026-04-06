/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ghana: {
          red: '#CE1126',
          gold: '#FCD116',
          green: '#006B3F',
        },
        primary: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#006B3F',
          600: '#005a35',
          700: '#00492b',
          800: '#003820',
          900: '#002716',
        }
      }
    },
  },
  plugins: [],
}
