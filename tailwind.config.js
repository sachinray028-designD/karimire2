/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          DEFAULT: '#092965',
          50: '#eef2fb',
          100: '#d6deef',
          200: '#a8b7d9',
          300: '#7b92c3',
          400: '#4d6dad',
          500: '#264a91',
          600: '#092965',
          700: '#071f4e',
          800: '#051638',
          900: '#020817',
        },
        crimson: {
          DEFAULT: '#c8102c',
          50: '#fdecef',
          100: '#f9c8d0',
          200: '#f08695',
          300: '#e45264',
          400: '#d72a41',
          500: '#c8102c',
          600: '#9f0d24',
          700: '#760a1b',
          800: '#4e0612',
          900: '#270309',
        },
        gold: {
          DEFAULT: '#c9a24a',
          light: '#e3c27a',
          dark: '#9c7a2e',
        },
      },
      fontFamily: {
        display: ['Marcellus', '"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'fade-up': 'fadeUp 0.9s ease-out forwards',
        'scale-in': 'scaleIn 0.6s ease-out forwards',
        'marquee': 'marquee 18s linear infinite',
        'shimmer': 'shimmer 2.5s linear infinite',
      },
      keyframes: {
        fadeIn: { '0%': { opacity: 0 }, '100%': { opacity: 1 } },
        fadeUp: { '0%': { opacity: 0, transform: 'translateY(30px)' }, '100%': { opacity: 1, transform: 'translateY(0)' } },
        scaleIn: { '0%': { opacity: 0, transform: 'scale(0.96)' }, '100%': { opacity: 1, transform: 'scale(1)' } },
        marquee: { '0%': { transform: 'translateX(0)' }, '100%': { transform: 'translateX(-50%)' } },
        shimmer: { '0%': { backgroundPosition: '-700px 0' }, '100%': { backgroundPosition: '700px 0' } },
      },
    },
  },
  plugins: [],
};
