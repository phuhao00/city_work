import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#4E6BFF',
          dark: '#5E7BFF',
        },
        secondary: {
          DEFAULT: '#FF6B6B',
          dark: '#FF7B7B',
        },
        background: {
          DEFAULT: '#FFFFFF',
          dark: '#121212',
        },
        card: {
          DEFAULT: '#F9F9F9',
          dark: '#1E1E1E',
        },
        text: {
          DEFAULT: '#333333',
          dark: '#FFFFFF',
        },
        border: {
          DEFAULT: '#E0E0E0',
          dark: '#2C2C2C',
        },
        error: '#FF3B30',
        success: '#34C759',
        warning: '#FF9500',
        info: '#007AFF',
        gray: '#8E8E93',
        'light-gray': {
          DEFAULT: '#F2F2F7',
          dark: '#2C2C2C',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      spacing: {
        'xs': '4px',
        's': '8px',
        'm': '16px',
        'l': '24px',
        'xl': '32px',
        'xxl': '48px',
      },
      borderRadius: {
        'small': '4px',
        'medium': '8px',
        'large': '16px',
      },
    },
  },
  darkMode: 'class',
  plugins: [],
};
export default config;