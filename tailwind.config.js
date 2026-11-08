/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        canvas: '#f4f3ee',
        surface: '#fffefb',
        ink: '#14201d',
        'ink-2': '#3f4b47',
        muted: '#74807c',
        line: '#e5e3da',
        accent: '#14695f',
        accentsoft: '#e4f2ed',
        ok: '#16734f',
        oksoft: '#e8f4ed',
        warn: '#a75a16',
        warnsoft: '#faefe3',
        danger: '#ad3b32',
        dangersoft: '#f9e9e6',
        violet: '#605b8d',
      },
      boxShadow: {
        card: '0 1px 2px rgba(20,32,29,.03), 0 14px 40px rgba(20,32,29,.045)',
      },
    },
  },
  plugins: [],
}
