/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      // DESIGN-SYSTEM.md §4 -- exact type scale, none of which match Tailwind's
      // default sizes (text-3xl is 30px, not 32px). Defined once here so every
      // page reaches for `text-h1` etc. instead of a one-off arbitrary value.
      fontSize: {
        h1: ['32px', { lineHeight: '40px', fontWeight: '600' }],
        h2: ['24px', { lineHeight: '32px', fontWeight: '600' }],
        h3: ['18px', { lineHeight: '28px', fontWeight: '600' }],
      },
    },
  },
  plugins: [],
}
