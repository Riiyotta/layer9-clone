/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  corePlugins: { preflight: false },
  theme: {
    extend: {
      colors: {
        bg: '#090909',
        graphite: '#191919',
        tile: '#1E1E1E',
        neon: '#2EEB85',
        blink: '#FF602E',
        boost: '#BE6CF3',
        'stop-orange': '#FF5722',
        fuchsia: '#AB0052',
        green: '#1DE97B',
        purple: '#B14EF1',
        dim: 'rgba(255,255,255,0.55)',
        lede: 'rgba(255,255,255,0.75)',
        hairline: 'rgba(255,255,255,0.1)',
      },
      fontFamily: {
        head: ['var(--font-head)'],
        body: ['var(--font-body)'],
        mono: ['var(--font-mono)'],
      },
      transitionTimingFunction: { l9: 'cubic-bezier(0.4,0,0.2,1)' },
    },
  },
  plugins: [],
}
