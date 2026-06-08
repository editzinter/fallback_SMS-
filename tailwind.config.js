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
        notion: {
          bg: '#ffffff',
          bgDark: '#191919',
          text: '#37352f',
          textDark: '#ffffff',
          gray: 'rgba(55, 53, 47, 0.65)',
          grayDark: 'rgba(255, 255, 255, 0.5)',
          hover: 'rgba(55, 53, 47, 0.08)',
          hoverDark: 'rgba(255, 255, 255, 0.055)',
          border: 'rgba(55, 53, 47, 0.09)',
          borderDark: 'rgba(255, 255, 255, 0.09)',
          sidebar: '#f7f7f5',
          sidebarDark: '#202020',
        }
      },
      fontFamily: {
        sans: [
          'ui-sans-serif',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          'Helvetica',
          '"Apple Color Emoji"',
          'Arial',
          'sans-serif',
          '"Segoe UI Emoji"',
          '"Segoe UI Symbol"',
        ],
      },
      boxShadow: {
        'notion-dropdown': 'rgba(15, 15, 15, 0.05) 0px 0px 0px 1px, rgba(15, 15, 15, 0.1) 0px 3px 6px, rgba(15, 15, 15, 0.2) 0px 9px 24px',
        'notion-dropdown-dark': 'rgba(255, 255, 255, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.4) 0px 3px 6px, rgba(0, 0, 0, 0.6) 0px 9px 24px',
      }
    },
  },
  plugins: [],
}
