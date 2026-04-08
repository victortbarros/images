/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        pitch: {
          DEFAULT: '#1a472a',
          light: '#2d6a4f',
          dark: '#0f2a19',
        },
      },
    },
  },
  plugins: [],
}
