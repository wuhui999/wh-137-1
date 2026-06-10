/** @type {import('tailwindcss').Config} */

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    container: {
      center: true,
    },
    extend: {
      colors: {
        navy: {
          50: "#eef3f9",
          100: "#d6e2ef",
          200: "#adc5df",
          300: "#7aa2c9",
          400: "#4f7fb0",
          500: "#326396",
          600: "#264e7a",
          700: "#1e3a5f",
          800: "#1a3150",
          900: "#172a44",
          950: "#0e1a2c",
        },
        gold: {
          50: "#fbf6ea",
          100: "#f5e9c9",
          200: "#ebd193",
          300: "#e0b35a",
          400: "#d4a857",
          500: "#c8902f",
          600: "#b07324",
          700: "#925720",
          800: "#774621",
          900: "#623b1f",
          950: "#391e0d",
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'glow': '0 0 20px rgba(212, 168, 87, 0.3)',
        'glow-lg': '0 0 40px rgba(212, 168, 87, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
    },
  },
  plugins: [],
};
