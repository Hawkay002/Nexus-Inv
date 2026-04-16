/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      colors: {
        premium: {
          900: '#0F172A',
          800: '#1E293B',
          700: '#334155',
          100: '#F1F5F9',
          50: '#F8FAFC'
        },
        accent: {
          500: '#6366F1',
          600: '#4F46E5'
        }
      }
    },
  },
  plugins: [],
}
