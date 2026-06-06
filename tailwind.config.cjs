/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin');

module.exports = {
  content: [
    './index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#7c3aed',
          600: '#6d28d9',
          700: '#5b21b6'
        },
        secondary: '#7867d2',
        tertiary: '#b75395',
        neutral: '#79729d',
        sidebar: '#5633E6',
        accent: {
          DEFAULT: '#60A5FA'
        },
        emerald: '#10B981',
        danger: '#FB7185',
        muted: '#79729d',
        bg: '#f5f3ff',
        mg: {
          'bg-dark': '#0f0a1e',
          'bg': '#f6f7fb',
          'surface': '#ffffff',
          'fg': '#0b0817',
          'fg-on-dark': '#e8e4f0',
          'muted': '#6b6b7b',
          'muted-on-dark': '#9690a8',
          'border': '#e2e0e8',
          'accent': '#7c3aed',
          'accent-hover': '#6d28d9',
          'accent-soft': 'rgba(124,58,237,0.10)',
          'accent-glow': '#a78bfa',
          'cyan': '#06b6d4',
          'cyan-glow': 'rgba(6,182,212,0.25)',
          'cyan-soft': 'rgba(6,182,212,0.08)',
          'success': '#10b981',
          'warn': '#f59e0b',
          'danger': '#ef4444',
        }
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem'
      },
      boxShadow: {
        soft: '0 4px 20px rgba(30,35,80,0.07)',
        card: '0 8px 32px rgba(30,35,80,0.10)'
      },
      backgroundImage: {
        'stats-grad': 'linear-gradient(90deg,#7c3aed 0%,#6d28d9 100%)',
        'sidebar-grad': 'linear-gradient(180deg,#3d2ab5,#6448f8)'
      },
      fontFamily: {
        sans: ['Inter','ui-sans-serif','system-ui']
      }
    }
  },
  plugins: [
    plugin(function({ addBase, theme }) {
      const colors = theme('colors');
      const fontFamily = theme('fontFamily.sans') || [];
      const fontSans = Array.isArray(fontFamily) ? fontFamily.map(f => (f.includes(' ') ? `"${f}"` : f)).join(', ') : fontFamily;

      addBase({
        ':root': {
          '--color-primary': (colors.primary && (colors.primary.DEFAULT || colors.primary)) || '#5860fe',
          '--color-primary-600': (colors.primary && colors.primary[600]) || '#4858e6',
          '--color-primary-700': (colors.primary && colors.primary[700]) || '#384ad6',
          '--color-secondary': colors.secondary || '#7867d2',
          '--color-tertiary': colors.tertiary || '#b75395',
          '--color-neutral': colors.neutral || '#79729d',
          '--color-accent': (colors.accent && (colors.accent.DEFAULT || colors.accent)) || '#60A5FA',
          '--color-danger': colors.danger || '#FB7185',
          '--color-muted': colors.muted || '#6b6375',
          '--page-bg': colors.bg || '#F7FBF9',
          '--radius-xl': theme('borderRadius.xl') || '1rem',
          '--radius-2xl': theme('borderRadius.2xl') || '1.5rem',
          '--radius-3xl': theme('borderRadius.3xl') || '2rem',
          '--shadow-soft': theme('boxShadow.soft') || '0 12px 40px rgba(16,37,31,0.08)',
          '--shadow-card': theme('boxShadow.card') || '0 24px 60px rgba(15,23,42,0.12)',
          '--background-image-stats-grad': (theme('backgroundImage.stats-grad') || 'linear-gradient(90deg,#60A5FA 0%,#7C3AED 100%)'),
          '--font-sans': fontSans || 'Inter, ui-sans-serif, system-ui'
        }
      });
    })
  ]
}
