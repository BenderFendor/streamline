import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
        display: ['var(--font-display)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      fontSize: {
        'xs': ['var(--text-xs)', { lineHeight: '1.5' }],
        'sm': ['var(--text-sm)', { lineHeight: '1.5' }],
        'base': ['var(--text-base)', { lineHeight: '1.6' }],
        'lg': ['var(--text-lg)', { lineHeight: '1.5' }],
        'xl': ['var(--text-xl)', { lineHeight: '1.4' }],
        '2xl': ['var(--text-2xl)', { lineHeight: '1.3' }],
        '3xl': ['var(--text-3xl)', { lineHeight: '1.2' }],
        '4xl': ['var(--text-4xl)', { lineHeight: '1.1' }],
        '5xl': ['var(--text-5xl)', { lineHeight: '1.05' }],
        '6xl': ['var(--text-6xl)', { lineHeight: '1' }],
      },
      colors: {
        background: {
          primary: '#000000',
          secondary: '#0A0A0A',
          tertiary: '#141414',
          elevated: '#1A1A1A',
        },
        accent: {
          primary: '#FF3D71',
          secondary: '#0095FF',
          tertiary: '#7B68EE',
          warning: '#FFB800',
          success: '#00D68F',
        },
        text: {
          primary: '#FFFFFF',
          secondary: '#B3B3B3',
          tertiary: '#6C6C6C',
          muted: '#4A4A4A',
        },
        border: {
          subtle: 'rgba(255, 255, 255, 0.05)',
          default: 'rgba(255, 255, 255, 0.1)',
          strong: 'rgba(255, 255, 255, 0.2)',
        },
      },
      boxShadow: {
        'glow': '0 0 40px -10px rgba(255, 61, 113, 0.3)',
        'glow-lg': '0 0 60px -15px rgba(255, 61, 113, 0.4)',
        'card': '0 4px 24px -4px rgba(0, 0, 0, 0.5)',
        'elevated': '0 8px 32px -8px rgba(0, 0, 0, 0.6)',
        'inner-glow': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.05)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'shimmer': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)',
      },
      keyframes: {
        fadeOut: {
          '0%': { opacity: '1' },
          '70%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        pulse: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
      animation: {
        'fadeOut': 'fadeOut 2s ease-in-out forwards',
        'fadeUp': 'fadeUp 0.6s cubic-bezier(0.19, 1, 0.22, 1) forwards',
        'fadeIn': 'fadeIn 0.4s ease-out forwards',
        'slideUp': 'slideUp 0.5s cubic-bezier(0.19, 1, 0.22, 1) forwards',
        'slideDown': 'slideDown 0.5s cubic-bezier(0.19, 1, 0.22, 1) forwards',
        'scaleIn': 'scaleIn 0.4s cubic-bezier(0.19, 1, 0.22, 1) forwards',
        'shimmer': 'shimmer 2s infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      transitionTimingFunction: {
        'out-expo': 'cubic-bezier(0.19, 1, 0.22, 1)',
        'out-quart': 'cubic-bezier(0.25, 1, 0.5, 1)',
        'in-out-circ': 'cubic-bezier(0.85, 0, 0.15, 1)',
      },
      transitionDuration: {
        '400': '400ms',
        '600': '600ms',
        '800': '800ms',
      },
    },
  },
  plugins: [],
} satisfies Config;
