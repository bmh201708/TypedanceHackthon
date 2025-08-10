/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // MediQuest主题色彩
        'medical-blue': '#2E86AB',
        'tech-purple': '#A23B72',
        'health-orange': '#F18F01',
        'health-green': '#C73E1D',
      },
      fontFamily: {
        'sans': ['Source Han Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}