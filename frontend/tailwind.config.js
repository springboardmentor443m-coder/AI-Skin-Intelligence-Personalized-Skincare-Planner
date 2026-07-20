/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,jsx}',
    './src/components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          DEFAULT: '#2D3250',
          50: '#F3F4F8',
          100: '#E4E6EF',
          200: '#C3C7DD',
          300: '#9BA1C4',
          400: '#7077A1',
          500: '#565D82',
          600: '#414868',
          700: '#2D3250',
          800: '#20243B',
          900: '#141628',
        },
        slate: {
          DEFAULT: '#7077A1',
          light: '#9BA1C4',
          dark: '#565D82',
        },
        amber: {
          DEFAULT: '#F6B17A',
          light: '#FAD1AC',
          dark: '#E8934F',
        },
        surface: {
          DEFAULT: '#FAFAFC',
          card: '#FFFFFF',
          sunken: '#F1F2F7',
        },
      },
      fontFamily: {
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
        body: ['Inter', 'sans-serif'],
      },
      backgroundImage: {
        'score-gradient': 'conic-gradient(from 180deg, #2D3250, #7077A1, #F6B17A)',
        'brand-sweep': 'linear-gradient(135deg, #2D3250 0%, #7077A1 55%, #F6B17A 100%)',
        'ink-radial': 'radial-gradient(circle at 20% 20%, #414868 0%, #20243B 60%, #141628 100%)',
      },
      boxShadow: {
        card: '0 1px 2px rgba(45,50,80,0.04), 0 8px 24px -8px rgba(45,50,80,0.12)',
        ring: '0 0 0 4px rgba(246,177,122,0.15)',
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      keyframes: {
        sweep: {
          '0%': { strokeDashoffset: '283' },
          '100%': { strokeDashoffset: 'var(--ring-offset)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        sweep: 'sweep 1.2s cubic-bezier(0.16, 1, 0.3, 1) forwards',
        fadeUp: 'fadeUp 0.5s ease-out forwards',
      },
    },
  },
  plugins: [],
};
