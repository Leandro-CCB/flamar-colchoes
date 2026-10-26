/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#FFF7F4',
          100: '#FEECE6',
          200: '#FCD5C8',
          300: '#F8B29D',
          400: '#DF6442',
          500: '#B83918',
          600: '#9B2E11',
          700: '#82260E',
          800: '#681E0B',
          900: '#521709',
          950: '#2E0C04',
        },
        gold: {
          light: '#FBF1D6',
          DEFAULT: '#D4AF37',
          dark: '#9E7E1D',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          warm: '#FAF7F4',
          card: '#FFFFFF',
          muted: '#F4EFEA',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        serif: ['Playfair Display', 'Georgia', 'serif'],
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(130, 38, 14, 0.08)',
        'premium': '0 12px 35px -8px rgba(130, 38, 14, 0.14)',
        'float': '0 20px 40px -15px rgba(0, 0, 0, 0.08)',
        'glow': '0 0 25px rgba(184, 57, 24, 0.28)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      }
    },
  },
  plugins: [],
}
