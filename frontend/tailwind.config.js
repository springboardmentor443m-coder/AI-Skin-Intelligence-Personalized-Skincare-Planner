/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        darkBg: '#0b0f19',
        darkCard: 'rgba(17, 24, 39, 0.7)',
        lightBg: '#f8fafc',
        lightCard: 'rgba(255, 255, 255, 0.7)',
        accentColor: '#ec4899', # Pink accent for skin care theme
        accentCyan: '#06b6d4', # Cyan accent for technical diagnostics
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
