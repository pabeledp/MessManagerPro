/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Creato Display', 'Hind Siliguri', 'sans-serif'],
        bangla: ['Hind Siliguri', 'sans-serif'],
        english: ['Creato Display', 'sans-serif'],
      },
      colors: {
        background: '#F8FAFC',
        mint: '#10B981',
        coral: '#F43F5E',
        navy: '#1E293B',
      },
      boxShadow: {
        'glass-3d': '0 10px 25px -5px rgba(0, 0, 0, 0.05), inset 0 1px 0 rgba(255, 255, 255, 1)',
        'glass-hover': '0 20px 35px -10px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 1)',
      },
    },
  },
  plugins: [],
};
