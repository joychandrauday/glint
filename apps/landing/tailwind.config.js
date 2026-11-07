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
        dark: {
          900: '#000000',
          800: '#181818',
          700: '#1F1F1F',
          600: '#272727',
          500: '#313131',
          accent: '#131209',
        },
      },
      transitionTimingFunction: {
        base: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
  plugins: [],
};
