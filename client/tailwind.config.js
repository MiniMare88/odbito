/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        black:   '#080A0E',
        dark:    '#0D1117',
        dark2:   '#141820',
        dark3:   '#1C2230',
        accent:  '#fab120',
        accent2: '#FF3D00',
        accent3: '#00E5FF',
        white:   '#F5F5F0',
        gray:    '#7A8499',
        green:   '#22c55e',
      },
      fontFamily: {
        display:    ['"Bebas Neue"', 'sans-serif'],
        condensed:  ['"Barlow Condensed"', 'sans-serif'],
        body:       ['"Barlow"', 'sans-serif'],
      },
      borderColor: {
        DEFAULT: 'rgba(255,255,255,0.07)',
      },
      backgroundColor: {
        card: 'rgba(255,255,255,0.04)',
      },
    },
  },
  plugins: [],
}
