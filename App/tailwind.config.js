/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E6F0F5',
          100: '#CCE0EB',
          200: '#99C2D7',
          300: '#66A3C3',
          400: '#3385AF',
          500: '#0A5688', // Main primary color
          600: '#084A76',
          700: '#063E63',
          800: '#053251',
          900: '#03253E',
        },
        secondary: {
          50: '#E6F9FA',
          100: '#CCF3F5',
          200: '#99E7EB',
          300: '#66DBE0',
          400: '#33CFD6',
          500: '#00A9B5', // Main secondary color
          600: '#00909A',
          700: '#00767F',
          800: '#005D65',
          900: '#00444A',
        },
        accent: {
          50: '#FDF2DD',
          100: '#FBEABB',
          200: '#F8D599',
          300: '#F5C077',
          400: '#F2AB55',
          500: '#EF9633', // Main accent color
          600: '#C87E2B',
          700: '#A16624',
          800: '#7A4D1C',
          900: '#533314',
        },
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        dark: '#1E293B',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'flow': 'flow 10s linear infinite',
      },
      keyframes: {
        flow: {
          '0%, 100%': { transform: 'translateX(0%)' },
          '50%': { transform: 'translateX(33%)' },
        }
      }
    },
  },
  plugins: [],
};