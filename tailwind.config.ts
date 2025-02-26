import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          primary: '#000000',    // Pure black for AMOLED screens
          secondary: '#0A0A0A',  // Slightly lighter black for cards
          tertiary: '#141414',   // For hover states
        },
        accent: {
          primary: '#FF3D71',    // Pink/red accent
          secondary: '#0095FF',  // Blue accent for highlights
        },
        text: {
          primary: '#FFFFFF',    // White text
          secondary: '#B3B3B3',  // Gray text
          tertiary: '#6C6C6C',   // Darker gray for less emphasis
        },
      },
      keyframes: {
        fadeOut: {
          '0%': { opacity: '1' },
          '70%': { opacity: '1' },
          '100%': { opacity: '0' },
        }
      },
      animation: {
        fadeOut: 'fadeOut 2s ease-in-out forwards',
      }
    },
  },
  plugins: [],
} satisfies Config;
