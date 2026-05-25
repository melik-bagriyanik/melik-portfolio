/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#fafaf6", // warm off-white
        foreground: "#1c1917", // stone-900
        cream: {
          50: "#fdfcf8",
          100: "#faf6ec",
          200: "#f3ead4",
          300: "#e9dbb4",
          400: "#dcc78c",
          500: "#cbb069",
          600: "#b89549",
          700: "#917339",
          800: "#65522b",
          900: "#3f3319",
        },
        gold: {
          DEFAULT: "#c9a44b",
          50: "#fdfaf1",
          100: "#fbf3da",
          200: "#f4e3ad",
          300: "#ebcf7d",
          400: "#dbb74f",
          500: "#c9a44b",
          600: "#a98438",
          700: "#84682d",
          800: "#5b4820",
          900: "#3a2e15",
        },
        primary: {
          DEFAULT: "#c9a44b", // soft champagne gold
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#dcc78c", // pale gold
          foreground: "#3a2e15",
        },
        muted: {
          DEFAULT: "#f5f1e8",
          foreground: "#78716c", // stone-500
        },
        accent: {
          DEFAULT: "#dbb74f",
          foreground: "#3a2e15",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        display: ["Outfit", "sans-serif"],
      },
      animation: {
        'shimmer': 'shimmer 2s linear infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
      keyframes: {
        shimmer: {
          from: { backgroundPosition: '0 0' },
          to: { backgroundPosition: '-200% 0' },
        },
      },
    },
  },
  plugins: [],
}
