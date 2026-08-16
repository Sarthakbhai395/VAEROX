/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary': '#C9A84C',      // Rich Luxury Gold
        'secondary': '#E8E0CC',    // Champagne / Light Gold
        'accent': '#FFF5D6',       // Bright Gold Highlight
        'gold': {
          DEFAULT: '#C9A84C',
          light: '#E8E0CC',
          bright: '#FFF5D6',
          dark: '#8A6C1B',
        },
        'dark': '#000000',         // Deep Black
        'dark-card': '#0A0A0A',    // Dark Luxury Card
        'dark-surface': '#121212', // Surface Black
        'dark-border': '#26241E',  // Dark Gold Border
        'light': '#E8E0CC',        // Light Cream
        'success': '#10b981',
        'warning': '#f59e0b',
        'error': '#ef4444',
        'neutral': '#A39E93',
      },
      fontFamily: {
        'sans': ['"Open Sans"', 'Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        'serif': ['"Playfair Display"', 'serif'],
        'display': ['"Playfair Display"', 'serif'],
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        'xl': '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
        '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      transitionProperty: {
        'height': 'height',
        'spacing': 'margin, padding',
      },
      transitionDuration: {
        '300': '300ms',
        '500': '500ms',
        '700': '700ms',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'slide-in': {
          '0%': { transform: 'translateX(100%)' },
          '100%': { transform: 'translateX(0)' },
        },
        'pulse-slow': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        }
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-in': 'slide-in 0.3s ease-out',
        'pulse-slow': 'pulse-slow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
}