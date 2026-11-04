/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        glint: {
          dark: '#0B0F19',
          card: '#131C2E',
          border: '#1E293B',
          cyan: '#06B6D4',
          accent: '#38BDF8',
        },
      },
    },
  },
  plugins: [],
};
