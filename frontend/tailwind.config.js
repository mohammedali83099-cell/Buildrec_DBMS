/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        sage: {
          50: '#f4f7f5',
          100: '#e5ece7',
          200: '#cbd9cf',
          300: '#a7bfae',
          400: '#88a692',
          500: '#7A9687', // Primary brand sage
          600: '#5c7869',
          700: '#485e52',
          800: '#3c4d43',
          900: '#344039',
        },
        charcoal: {
          50: '#f6f7f8',
          100: '#ebedef',
          200: '#d3d7dc',
          300: '#adb6bf',
          400: '#828e9c',
          500: '#626f7e',
          600: '#4c5765',
          700: '#3e4652',
          800: '#2B353A', // Logo primary dark text
          900: '#1F292E',
          950: '#141c20',
        }
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 41, 46, 0.05)',
        'glass-hover': '0 12px 40px 0 rgba(31, 41, 46, 0.08)',
      }
    },
  },
  plugins: [],
}
