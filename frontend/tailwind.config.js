/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        navy: {
          950: '#0A0D14',
          900: '#0F1117',
          800: '#1A1F2E',
          700: '#242A3B',
          600: '#2A3042',
          500: '#3A4052',
        },
        gold: {
          DEFAULT: '#C9A84C',
          light: '#E0C068',
          dark:  '#A8892F',
          muted: '#C9A84C1A',
        },
        lex: {
          text:    '#E8EAF0',
          muted:   '#8892A4',
          border:  '#2A3042',
          success: '#22C55E',
          warning: '#F59E0B',
          danger:  '#EF4444',
          info:    '#3B82F6',
        },
      },
      fontFamily: {
        heading: ['"Playfair Display"', 'Georgia', 'serif'],
        body:    ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card:  '0 2px 16px rgba(0,0,0,0.4)',
        modal: '0 8px 40px rgba(0,0,0,0.6)',
        gold:  '0 0 20px rgba(201,168,76,0.15)',
      },
      animation: {
        'fade-in':   'fadeIn 0.2s ease-out',
        'slide-up':  'slideUp 0.25s ease-out',
        'spin-slow': 'spin 2s linear infinite',
      },
      keyframes: {
        fadeIn:  { from: { opacity: 0 }, to: { opacity: 1 } },
        slideUp: { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'translateY(0)' } },
      },
    },
  },
  plugins: [],
};
