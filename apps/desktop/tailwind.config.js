/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      colors: {
        glint: {
          base: '#09090B',
          card: '#18181B',
          bubble: '#27272A',
          border: '#27272A',
          subtle: '#3F3F46',
          lime: '#34D399',
          cyan: '#38BDF8',
          violet: '#6366F1',
          magenta: '#818CF8',
          yellow: '#FBBF24',
          coral: '#F87171',
          ink: '#09090B',
          space: '#09090B',
        },
        candy: {
          mint: '#10B981',
          mintLight: '#34D399',
          violet: '#6366F1',
          violetLight: '#818CF8',
          pink: '#71717A',
          pinkLight: '#A1A1AA',
          honey: '#F59E0B',
          honeyLight: '#FBBF24',
          coral: '#F43F5E',
          coralLight: '#FB7185',
          cyan: '#38BDF8',
          cyanLight: '#7DD3FC',
        },
      },
      borderRadius: {
        '2.5xl': '1.25rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      keyframes: {
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        pop: {
          '0%': { transform: 'scale(0.92)' },
          '50%': { transform: 'scale(1.06)' },
          '100%': { transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-4px)' },
        },
      },
      animation: {
        wiggle: 'wiggle 1s ease-in-out infinite',
        pop: 'pop 0.25s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
        float: 'float 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
