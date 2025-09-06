// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/app/**/*.{ts,tsx,js,jsx}',
    './src/components/**/*.{ts,tsx,js,jsx}',
  ],
  experimental: {},
  future: {
    unstable_disableLightningCss: true,
  },
  theme: {
    extend: {},
  },
  plugins: [],
}
