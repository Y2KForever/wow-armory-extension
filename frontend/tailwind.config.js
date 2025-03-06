/** @type {import('tailwindcss').Config} */
const plugin = require('tailwindcss/plugin');
const { fontFamily } = require('tailwindcss/defaultTheme');
export default {
  darkMode: ['class'],
  safelist: [
    { pattern: /text-class-/ },
    { pattern: /border-rarity-/ },
    { pattern: /bg-/ },
    { pattern: /text-rarity-/ },
    { pattern: /row-start-/ },
    { pattern: /col-start-/ },
    { pattern: /grayscale/ },
    { pattern: /fill-/ },
  ],
  content: ['./index.html', './src/**/*.{ts,tsx,js,jsx}'],
  theme: {
    extend: {
      textShadow: {
        sm: '0 1px 2px var(--tw-shadow-color)',
        DEFAULT: '0 2px 4px var(--tw-shadow-color)',
        lg: '0 8px 16px var(--tw-shadow-color)',
      },
      fontFamily: {
        sans: ['Poppins', 'sans-serif', ...fontFamily.sans],
        friz: ['Friz Quadrata', 'sans-serif'],
        semplicita: ['semplicita pro', ...fontFamily.sans],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        blizzard: {
          DEFAULT: '#0074e0',
          yellow: '#ddac00',
          brown: '#100d05',
          gray: '#72716f',
          emblem: '#4a4d54',
          lightGray: '#8c8c8c',
          lightBrown: '#221c13',
          transmog: '#ff80ff',
          unselectedGray: '#808080',
          green: '#00ff00',
        },
        rarity: {
          poor: '#9d9d9d',
          common: '#ffffff',
          uncommon: '#1eff00',
          rare: '#0081ff',
          epic: '#c600ff',
          legendary: '#ff8000',
          artifact: '#e5cc80',
          heirloom: '#00ccff',
          azerite: '#e5cc80',
        },
        class: {
          DEFAULT: '#ffffff',
          deathknight: '#c41e3b',
          demonhunter: '#a330c9',
          druid: '#ff7c0a',
          evoker: '#33937f',
          hunter: '#aad372',
          mage: '#68ccef',
          monk: '#00ffba',
          paladin: '#f48cba',
          priest: '#f0ebe0',
          rouge: '#fff468',
          shaman: '#2359ff',
          warlock: '#9382c9',
          warrior: '#c69b6d',
        },
        backgroundBlizzard: {
          DEFAULT: '#15171e',
          light: '#222530',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          1: 'hsl(var(--chart-1))',
          2: 'hsl(var(--chart-2))',
          3: 'hsl(var(--chart-3))',
          4: 'hsl(var(--chart-4))',
          5: 'hsl(var(--chart-5))',
        },
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    plugin(function ({ matchUtilities, theme }) {
      matchUtilities(
        {
          'text-shadow': (value) => ({
            textShadow: value,
          }),
        },
        { values: theme('textShadow') },
      );
    }),
  ],
};
