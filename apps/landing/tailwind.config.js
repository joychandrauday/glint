/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        glint: {
          base: '#0D101D',
          card: '#15192B',
          bubble: '#1C223A',
          border: '#2A3254',
          subtle: '#333D66',
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
    },
  },
  plugins: [],
};
