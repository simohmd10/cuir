/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        leather: {
          50: '#fdf8f3',
          100: '#f5ebd9',
          200: '#ead5b3',
          300: '#d9b88a',
          400: '#c49a62',
          500: '#8b5e3c',
          600: '#7a5234',
          700: '#63432a',
          800: '#4e3421',
          900: '#3d2919',
        },
        gold: {
          300: '#e8d08a',
          400: '#dab96d',
          500: '#c9a84c',
          600: '#b8942e',
          700: '#a07f22',
        },
        beige: {
          50: '#fdfaf6',
          100: '#f5ebd9',
          200: '#ead5b3',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        arabic: ['"Cairo"', '"Noto Sans Arabic"', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.5s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
