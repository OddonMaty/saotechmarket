import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2B8C87',
          dark: '#22706C',
        },
        dark: '#1E1E22',
        light: '#F5F5F5',
        border: '#E5E5E5',
        surface: '#FFFFFF',
        text: {
          DEFAULT: '#1E1E22',
          muted: '#666666',
        },
        success: '#10B981',
        danger: '#EF4444',
      },
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        condensed: ['var(--font-barlow-condensed)', 'sans-serif'],
        mono: ['var(--font-dm-mono)', 'monospace'],
      },
      maxWidth: {
        container: '1280px',
      },
      screens: {
        mobile: '390px',
        tablet: '768px',
        desktop: '1024px',
        wide: '1440px',
      },
    },
  },
  plugins: [],
};

export default config;

