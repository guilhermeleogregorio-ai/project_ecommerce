/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f0f5ff',
          100: '#e0ecff',
          200: '#c7dcfe',
          300: '#a1c4fd',
          400: '#72a0fb',
          500: '#3b78f6',
          600: '#1d54ed',
          700: '#143fd9',
          800: '#1634b0',
          900: '#18308b',
          950: '#101d55'
        },
        slate: {
          850: '#172033'
        }
      }
    },
  },
  plugins: [],
}
