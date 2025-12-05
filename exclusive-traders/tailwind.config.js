// In your tailwind.config.js
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#0a2540',
        secondary: '#00ffcc',
        accent: '#ff00ff',
        light: '#f0f4f8',
        dark: '#001122',
        gray: {
          100: '#f0f4f8',
          500: '#a0b0c0',
          700: '#6b7280',
        },
      },
      boxShadow: {
        'neon': '0 0 10px #00ffcc, 0 0 20px #00ffcc',
        'neon-hover': '0 0 20px #00ffcc, 0 0 40px #00ffcc',
      },
      fontFamily: {
        sans: ['Segoe UI', 'Tahoma', 'Geneva', 'Verdana', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}