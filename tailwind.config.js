/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#FFF8EC',
        ink: '#2B1B12',
        primary: '#E8601C',
        accent: '#F4A623',
        success: '#2F6B4F',
        error: '#C23B22',
      },
      fontFamily: {
        display: ['Fraunces', 'serif'],
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
