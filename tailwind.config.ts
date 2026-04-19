import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#D12362',
          light: '#E5558A',
          dark: '#A81A4E',
          50: '#FCE7EE',
          100: '#F8C5D4',
          500: '#D12362',
          600: '#A81A4E',
          700: '#7F133B',
        },
        dark: {
          DEFAULT: '#1A1A1A',
          50: '#F5F5F5',
          100: '#E8E8E8',
          200: '#D1D1D1',
          300: '#999999',
          400: '#666666',
          500: '#333333',
          600: '#1A1A1A',
          700: '#111111',
          800: '#0A0A0A',
          900: '#050505',
        },
      },
      fontFamily: {
        display: ['Playfair Display', 'serif'],
        body: ['DM Sans', 'sans-serif'],
        bengali: ['Noto Sans Bengali', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
