import type { Config } from 'tailwindcss'

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        yellow: {
          50: '#fdffe5',
          100: '#fbffc7',
          200: '#f7ff95',
          300: '#f2ff5b',
          400: '#edff2b',
          500: '#EBFF00', // User requested base
          600: '#cddd00', // Slightly darker for text/hover
          700: '#a3af00',
          800: '#7a8200',
          900: '#646a00',
          950: '#383c00',
        },
        // Dark theme base (approved: slate-950)
        'brand': {
          'dark-bg': '#0f172a',      // slate-950
          'dark-card': '#1e293b',    // slate-900
          'dark-border': '#334155',  // slate-700
          'dark-hover': '#0f172a',   // slate-950
          'accent': '#FBBF24',       // yellow-400 (approved vibrant)
          'accent-hover': '#F59E0B', // amber-400
        },
      },
      backgroundColor: {
        'dark': '#0f172a',
        'dark-card': '#1e293b',
        'dark-hover': '#0f172a',
      },
      textColor: {
        'brand-accent': '#FBBF24',
        'brand-accent-hover': '#F59E0B',
      },
      borderColor: {
        'brand-accent': '#FBBF24',
        'brand-accent-hover': '#F59E0B',
      },
      boxShadow: {
        'glass': '0 25px 60px -15px rgba(0,0,0,0.8)',
        'brand': '0 0 20px rgba(251, 191, 36, 0.25)',
        'brand-lg': '0 0 40px rgba(251, 191, 36, 0.3)',
      },
      keyframes: {
        slideDown: {
          from: { transform: 'translateY(-100%)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        slideUp: {
          from: { transform: 'translateY(30px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
      },
      animation: {
        'slide-down': 'slideDown 0.3s ease-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.3s ease-out',
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      fontFamily: {
        'poppins': ['Poppins', 'var(--font-poppins)', 'system-ui', 'sans-serif'],
        'noto-serif': ['Noto Serif', 'serif'],
        'noto-math': ['Noto Sans Math', 'serif'],
      },
    },
  },
  plugins: [],
} satisfies Config
