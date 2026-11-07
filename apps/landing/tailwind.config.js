/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Geist', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        mono: ['"Geist Mono"', 'monospace'],
      },
      colors: {
        glint: {
          space: '#0B0726',
          void: '#110939',
          card: '#160E45',
          border: '#261C63',
          borderHover: '#3A2A9F',
          lime: '#BDFB03',
          cyan: '#0DE4F3',
          violet: '#7D23D9',
          magenta: '#CB4BF7',
          yellow: '#FED02A',
          coral: '#F57265',
        },
        dark: {
          900: '#0B0726',
          800: '#110939',
          700: '#160E45',
          600: '#261C63',
          500: '#3A2A9F',
          accent: '#110939',
        },
      },
      transitionTimingFunction: {
        base: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
