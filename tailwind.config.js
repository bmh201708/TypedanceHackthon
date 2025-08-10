/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // MediQuest主题色彩（保持兼容）
        'medical-blue': '#2E86AB',
        'tech-purple': '#A23B72',
        'health-orange': '#F18F01',
        'health-green': '#C73E1D',
        // 新的现代化色彩方案
        'primary-blue': '#6366f1',
        'primary-purple': '#8b5cf6',
        'accent-pink': '#f472b6',
        'accent-orange': '#fb923c',
        'success-green': '#10b981',
      },
      fontFamily: {
        'sans': ['Inter', 'Source Han Sans', 'sans-serif'],
        'inter': ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'card': '0 4px 20px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 8px 30px rgba(0, 0, 0, 0.12)',
      },
      animation: {
        'float': 'float 3s ease-in-out infinite',
        'pulse-slow': 'pulse 3s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}