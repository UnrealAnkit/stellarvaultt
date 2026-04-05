/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        mono: ['var(--font-mono)', 'monospace'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      colors: {
        vault: {
          black: '#050508',
          surface: '#0d0d14',
          card: '#111118',
          border: '#1e1e2e',
          gold: '#c9a84c',
          'gold-light': '#e8c96c',
          'gold-dim': '#8a6f2e',
          green: '#22c55e',
          'green-dim': '#166534',
          red: '#ef4444',
          'red-dim': '#7f1d1d',
          muted: '#4a4a6a',
          text: '#e2e2f0',
          'text-dim': '#8888aa',
        },
      },
      backgroundImage: {
        'vault-radial': 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(201,168,76,0.15), transparent)',
        'gold-glow': 'radial-gradient(circle, rgba(201,168,76,0.3) 0%, transparent 70%)',
      },
      keyframes: {
        'pulse-gold': {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(201,168,76,0)' },
          '50%': { boxShadow: '0 0 20px 4px rgba(201,168,76,0.3)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'fade-in-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        ticker: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
      animation: {
        'pulse-gold': 'pulse-gold 2s ease-in-out infinite',
        shimmer: 'shimmer 2s linear infinite',
        'fade-in-up': 'fade-in-up 0.4s ease-out forwards',
        'scale-in': 'scale-in 0.3s ease-out forwards',
        ticker: 'ticker 20s linear infinite',
      },
    },
  },
  plugins: [],
};
