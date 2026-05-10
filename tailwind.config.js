/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        /* ── Luxury Neutral Palette ── */
        ink: {
          DEFAULT: '#1C1C1C',
          light: '#2D2926',
          muted: '#6B6560',
        },
        cream: {
          DEFAULT: '#FDFCFB',
          50: '#FDFCFB',
          100: '#FAFAF7',
          200: '#F4F2EC',
          300: '#ECEAE5',
          400: '#D8D6CE',
        },
        camel: {
          DEFAULT: '#C4A882',
          50: '#F9F4EE',
          100: '#EFE3D0',
          200: '#DDC9A8',
          300: '#C4A882',
          400: '#B09068',
          500: '#9A7A52',
          600: '#7D6040',
          700: '#5E4630',
        },
        gold: {
          DEFAULT: '#B8965A',
          light: '#D4B27A',
          dark: '#9A7840',
          muted: '#C4A882',
        },
        /* ── Keep leather for admin ── */
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
        beige: {
          50: '#FDFCFB',
          100: '#FAFAF7',
          200: '#F4F2EC',
        },
      },

      fontFamily: {
        display: ['"Cormorant Garamond"', '"Playfair Display"', 'Georgia', 'serif'],
        body: ['"DM Sans"', 'Inter', 'system-ui', 'sans-serif'],
        arabic: ['"Cairo"', '"Noto Sans Arabic"', 'sans-serif'],
        mono: ['"DM Mono"', 'monospace'],
      },

      fontSize: {
        '8xl': ['6rem', { lineHeight: '1.05', letterSpacing: '-0.03em' }],
        '9xl': ['8rem', { lineHeight: '1', letterSpacing: '-0.04em' }],
        '10xl': ['10rem', { lineHeight: '0.95', letterSpacing: '-0.04em' }],
      },

      letterSpacing: {
        widest: '0.25em',
        luxury: '0.15em',
        editorial: '0.08em',
      },

      spacing: {
        18: '4.5rem',
        22: '5.5rem',
        26: '6.5rem',
        30: '7.5rem',
        34: '8.5rem',
        38: '9.5rem',
        42: '10.5rem',
        46: '11.5rem',
        section: '7rem',
        hero: '90vh',
      },

      maxWidth: {
        '8xl': '88rem',
        '9xl': '96rem',
        luxury: '1440px',
      },

      transitionTimingFunction: {
        luxury: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
        in: 'cubic-bezier(0.4, 0, 1, 1)',
        out: 'cubic-bezier(0, 0, 0.2, 1)',
      },

      transitionDuration: {
        400: '400ms',
        600: '600ms',
        800: '800ms',
        1000: '1000ms',
        1200: '1200ms',
      },

      animation: {
        'fade-in': 'fadeIn 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
        'fade-up': 'fadeUp 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
        'slide-left': 'slideLeft 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
        shimmer: 'shimmer 1.8s ease-in-out infinite',
        'scale-in': 'scaleIn 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards',
        'pan-slow': 'panSlow 20s ease-in-out infinite alternate',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(32px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideLeft: {
          '0%': { opacity: '0', transform: 'translateX(40px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.94)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        panSlow: {
          '0%': { transform: 'scale(1.08) translate(0px, 0px)' },
          '100%': { transform: 'scale(1.08) translate(-20px, -10px)' },
        },
      },

      aspectRatio: {
        portrait: '3 / 4',
        cinematic: '21 / 9',
        square: '1 / 1',
        golden: '1.618 / 1',
      },

      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
};
