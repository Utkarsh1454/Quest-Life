/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        quest: {
          darkest: '#0d0d14',
          dark: '#161622',
          accent: '#FFFAF3',
          primary: '#F62440',
          secondary: '#FFE5BF',
          gold: '#FFF2DB',
          success: '#22c55e',
          danger: '#F62440',
          str: '#F62440',
          end: '#FFE5BF',
          spd: '#06b6d4',
          dis: '#FFE5BF',
          con: '#FFF2DB',
          rec: '#22c55e',
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        heading: ['Outfit', 'sans-serif'],
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleUp: {
          '0%': { opacity: '0', transform: 'scale(0.85)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        scan: {
          '0%': { transform: 'translateY(0%)' },
          '100%': { transform: 'translateY(100%)' },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out',
        'scale-up': 'scaleUp 0.3s ease-out',
        'scan': 'scan 2s linear infinite',
      },
    },
  },
  plugins: [],
}
