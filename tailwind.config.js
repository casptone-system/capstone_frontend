/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './public/index.html',
    './src/**/*.{vue,js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        /* 60% Canvas — zero-saturation surfaces */
        canvas: {
          DEFAULT: '#FAF9F6',
          panel: '#EFEBE3',
          line: '#E0E0DC',
        },
        'canvas-panel': '#EFEBE3',
        'canvas-line': '#E0E0DC',

        /* 30% Structure — navigation, chrome, typography */
        structure: {
          primary: '#1B5E20',
          secondary: '#5D4037',
        },
        'structure-primary': '#1B5E20',
        'structure-secondary': '#5D4037',
        'text-primary': '#2B2B28',
        'text-muted': '#757570',

        /* 10% Accent — CTAs and status only */
        accent: {
          gold: '#F9A825',
          success: '#2E7D32',
          pending: '#FBC02D',
          urgent: '#C62828',
          info: '#1565C0',
        },
        'accent-gold': '#F9A825',
        'accent-success': '#2E7D32',
        'accent-pending': '#FBC02D',
        'accent-urgent': '#C62828',
        'accent-info': '#1565C0',
      },
    },
  },
  plugins: [],
}
