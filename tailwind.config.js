/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#020617", // slate-950 (Midnight)
        foreground: "#f8fafc", // slate-50
        night: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#60a5fa",
          500: "#3b82f6",
          600: "#2563eb",
          700: "#1d4ed8",
          800: "#1e40af",
          900: "#1e3a8a",
          950: "#172554",
        },
        primary: {
          DEFAULT: "#2563eb", // blue-600 (Royal Night Blue)
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#1e40af", // blue-800
          foreground: "#ffffff",
        },
        muted: {
          DEFAULT: "#0f172a", // slate-900
          foreground: "#94a3b8", // slate-400
        },
        accent: {
          DEFAULT: "#3b82f6", // blue-500
          foreground: "#ffffff",
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
