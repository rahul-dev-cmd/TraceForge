/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: '#0a0a0a',
          subtle: '#111111',
          surface: '#0a0a0a',
          panel: '#0a0a0a',
          card: '#0a0a0a',
          elevated: '#0a0a0a',
        },
        border: {
          subtle: '#1f521f',
          DEFAULT: '#33ff00',
          bright: '#33ff00',
        },
        terminal: {
          primary: '#33ff00',
          secondary: '#ffb000',
          muted: '#1f521f',
          error: '#ff3333',
        },
        risk: {
          critical: '#ff3333',
          'critical-bg': 'rgba(255, 51, 51, 0.1)',
          'critical-border': '#ff3333',
          high: '#ffb000',
          'high-bg': 'rgba(255, 176, 0, 0.1)',
          'high-border': '#ffb000',
          medium: '#ffff00',
          'medium-bg': 'rgba(255, 255, 0, 0.1)',
          'medium-border': '#ffff00',
          low: '#33ff00',
          'low-bg': 'rgba(51, 255, 0, 0.1)',
          'low-border': '#33ff00',
          info: '#33ff00',
          'info-bg': 'rgba(51, 255, 0, 0.1)',
          'info-border': '#33ff00',
        }
      },
      fontFamily: {
        sans: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
      boxShadow: {
        'glow-cyan': '0 0 5px rgba(51, 255, 0, 0.5)',
        'glow-red': '0 0 5px rgba(255, 51, 51, 0.5)',
        'glow-orange': '0 0 5px rgba(255, 176, 0, 0.5)',
        'glow-amber': '0 0 5px rgba(255, 176, 0, 0.5)',
        'glow-green': '0 0 5px rgba(51, 255, 0, 0.5)',
        'panel': 'none',
      },
      animation: {
        'blink': 'blink 1s step-end infinite',
        'pulse-subtle': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'radar-sweep': 'spin 8s linear infinite',
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0 },
        }
      }
    },
  },
  plugins: [],
}
