/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        glint: {
          base: '#0B0726',
          card: '#110939',
          bubble: '#1A1245',
          border: '#352175',
          subtle: '#4A2F9B',
          lime: '#BDFB03',
          cyan: '#0DE4F3',
          violet: '#7D23D9',
          magenta: '#CB4BF7',
          yellow: '#FED02A',
          coral: '#F57265',
          ink: '#110939',
          space: '#0B0726',
        },
        candy: {
          mint: '#10B981',
          mintLight: '#34D399',
          violet: '#8B5CF6',
          violetLight: '#C084FC',
          pink: '#EC4899',
          pinkLight: '#F472B6',
          honey: '#F59E0B',
          honeyLight: '#FBBF24',
          coral: '#F43F5E',
          coralLight: '#FB7185',
          cyan: '#06B6D4',
          cyanLight: '#22D3EE',
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
