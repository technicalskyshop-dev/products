/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      colors: {
        lavender: {
          50: '#FAF8FC',
          100: '#F5F2F9',
          200: '#EDE8F5',
          300: '#E2DCEE',
          400: '#D5CCE4',
          500: '#C4B7D8',
          bg: '#EDE8F5',
        },
        card: {
          bg: '#F5F3FA',
        },
        accentPink: {
          DEFAULT: '#E87A90',
          light: '#FCE7EE',
          dark: '#D8657C',
        }
      }
    },
  },
  plugins: [],
}

