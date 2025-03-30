/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Add your custom colors here
      },
      fontFamily: {
        // Add your custom fonts here
      },
      animation: {
        // Add the progress animation for loading
        'progress': 'progress 2s ease-in-out infinite',
      },
      keyframes: {
        // Define the keyframes for the progress animation
        'progress': {
          '0%': { width: '0%' },
          '50%': { width: '80%' },
          '100%': { width: '0%' },
        },
      },
    },
  },
  plugins: [],
} 