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
        background: 'var(--bg-color)',
        surface: 'var(--surface-color)',
        surfaceBorder: 'var(--surface-border)',
        primary: 'var(--primary-color)',
        secondary: 'var(--secondary-color)',
        textPrimary: 'var(--text-primary)',
        textSecondary: 'var(--text-secondary)',
      },
      backdropBlur: {
        xs: '2px',
      }
    },
  },
  plugins: [],
}
