/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      spacing: {
        '70': '280px', // Custom width for sidebar
      },
      colors: {
        // Brand colors
        primary: {
          DEFAULT: '#0f172a',
          light: '#334155',
          dark: '#020617',
        },
        accent: {
          DEFAULT: '#0ea5e9',
          light: '#38bdf8',
          dark: '#0284c7',
        },
        // Text colors
        text: {
          main: '#1e293b',
          muted: '#64748b',
          soft: '#94a3b8',
        },
        // Background colors
        bg: {
          top: '#f8fafc',
          bottom: '#e2e8f0',
        },
        // Status colors
        warning: '#f59e0b',
        danger: '#ef4444',
        success: '#22c55e',
        // Glass card
        card: 'rgba(255, 255, 255, 0.85)',
        'card-border': 'rgba(255, 255, 255, 0.2)',
      },
      fontFamily: {
        sans: ['Inter', 'Poppins', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'sans-serif'],
      },
      boxShadow: {
        'glass': '0 25px 50px -12px rgba(0, 0, 0, 0.08)',
        'glass-sm': '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        'glass-md': '0 10px 15px -3px rgba(0, 0, 0, 0.08)',
      },
      backdropBlur: {
        'xs': '2px',
      },
      animation: {
        'fade-in-card': 'fadeInCard 0.6s ease-out',
      },
      keyframes: {
        fadeInCard: {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)',
          },
        },
      },
    },
  },
  plugins: [],
}