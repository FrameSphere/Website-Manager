/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d7fe',
          300: '#a4bbfd',
          400: '#7e93fb',
          500: '#5b6af6',
          600: '#4346eb',
          700: '#3835d0',
          800: '#2f2da8',
          900: '#2c2c85',
          950: '#1b1a50',
        },
        dark: {
          bg:       '#0c0e14',
          surface:  '#111420',
          surface2: '#171b29',
          border:   '#1f2438',
          text1:    '#e8eaf0',
          text2:    '#9098b8',
          text3:    '#5a6280',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-hero': 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(91,106,246,0.3) 0%, transparent 60%)',
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease forwards',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          from: { opacity: '0', transform: 'translateY(20px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        }
      }
    },
  },
  plugins: [],
}
