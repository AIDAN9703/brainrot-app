/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,ts,tsx}', './components/**/*.{js,ts,tsx}'],

  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        'brainrot-bg': '#121212',
        'brainrot-card': '#1E1E1E',
        'brainrot-pink': '#fff',
        'brainrot-blue': '#4FCEFF',
        'brainrot-purple': '#8F5AFF',
        'brainrot-yellow': '#FFD166',
        'brainrot-orange': '#FF9B4F',
      },
      fontFamily: {
        serif: ['Times New Roman', 'serif'],
        display: ['Georgia', 'serif'],
        comic: ['Comic Neue', 'cursive'],
        mono: ['VT323', 'monospace'],
      },
    },
  },
  plugins: [],
};
