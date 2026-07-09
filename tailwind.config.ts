import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          base: '#F4F6F8',
          surface: '#FFFFFF',
        },
        steel: {
          DEFAULT: '#3E5C76',
          light: '#6C8EAE',
          dark: '#26374A',
        },
        amber: {
          DEFAULT: '#D98E04',
          light: '#F5C563',
          bg: '#FEF3DA',
        },
        red: {
          DEFAULT: '#D6402F',
          light: '#F2897B',
          bg: '#FBE2DE',
        },
        green: {
          DEFAULT: '#2F9E5B',
          bg: '#DFF3E7',
        },
        content: {
          DEFAULT: '#1C2430',
          muted: '#64748B',
        },
        border: '#E2E5EA',
      },
      fontFamily: {
        display: ['var(--font-barlow)', 'sans-serif'],
        sans: ['var(--font-inter)', 'sans-serif'],
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
      },
      boxShadow: {
        sm: '0 1px 3px 0 rgba(28,36,48,0.06)',
        md: '0 4px 16px 0 rgba(28,36,48,0.08)',
      },
    },
  },
  plugins: [],
}

export default config
