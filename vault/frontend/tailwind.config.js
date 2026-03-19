/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        vault: {
          bg: '#FAFAF8',
          surface: '#F5F4F0',
          border: '#E8E6E1',
          text: '#2D2C2A',
          muted: '#9CA3AF',
          accent: '#6B7280',
          urgent: '#DC2626',
          success: '#16A34A',
        },
      },
    },
  },
  plugins: [],
}
