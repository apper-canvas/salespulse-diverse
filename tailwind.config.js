/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
colors: {
        primary: '#10B981',
        'primary-light': '#34D399',
        accent: '#3B82F6',
        'surface': '#FFFFFF',
        'background': '#F7F8FC',
        success: '#00D4AA',
        warning: '#FFB547',
        error: '#FF5A5F',
        info: '#47B5FF',
        renewal: '#F59E0B',
        'renewal-light': '#FCD34D'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        card: '0 2px 8px rgba(0, 0, 0, 0.08)',
        'card-hover': '0 4px 16px rgba(0, 0, 0, 0.12)',
        modal: '0 20px 60px rgba(0, 0, 0, 0.2)'
      }
    },
  },
  plugins: [],
}