/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{html,js,ts,svelte}'],
  theme: {
    extend: {
      fontFamily: {
        serif: ['Source Serif Pro', 'serif'],
        sans: ['Source Sans Pro', 'sans-serif'],
      },
      fontSize: {
        'normal': '2rem',
      }
    },
  },
  plugins: [],
}

