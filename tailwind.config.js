/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: '#0C1421',
        'ink-2': '#354255',
        muted: '#66738A',
        line: '#E4E8EE',
        surface: '#FFFFFF',
        'surface-2': '#FAFBFC',
        canvas: '#F5F6F8',
        accent: '#0B6E75',
        accentsoft: '#E7F3F3',
        danger: '#C0392B',
        'danger-soft': '#FDECEA',
        warn: '#B45309',
        'warn-soft': '#FDF3E3',
        ok: '#15803D',
        'ok-soft': '#EAF6EE',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Consolas', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(12,20,33,.04), 0 10px 28px rgba(12,20,33,.045)',
      },
      borderRadius: {
        card: '16px',
      },
    },
  },
  plugins: [],
}
