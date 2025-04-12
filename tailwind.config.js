/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,tsx}', './components/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        background: '#084c8b',
        blue: {
          primary: '#084c8b',
        },
        pink: {
          primary: '#ff66b6',
        },
      },
    },
  },
  plugins: [],
};
