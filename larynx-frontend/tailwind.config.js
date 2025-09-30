/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Custom color palette
        light_cyan: {
          DEFAULT: '#cbeef3',
          100: '#114148',
          200: '#228390',
          300: '#3abfd1',
          400: '#81d6e2',
          500: '#cbeef3',
          600: '#d4f1f5',
          700: '#dff5f7',
          800: '#eaf8fa',
          900: '#f4fcfc'
        },
        amethyst: {
          DEFAULT: '#A855F7',
          100: '#22033f',
          200: '#44067f',
          300: '#6609be',
          400: '#8815f4',
          500: '#a855f7',
          600: '#ba77f9',
          700: '#cb99fa',
          800: '#dcbbfc',
          900: '#eeddfd'
        },
        amaranth_pink: {
          DEFAULT: '#f49cbb',
          100: '#48081e',
          200: '#8f103c',
          300: '#d7185b',
          400: '#ec5288',
          500: '#f49cbb',
          600: '#f6aec7',
          700: '#f8c2d5',
          800: '#fbd7e3',
          900: '#fdebf1'
        },
        seasalt: {
          DEFAULT: '#FAFAFA',
          100: '#323232',
          200: '#646464',
          300: '#969696',
          400: '#c8c8c8',
          500: '#fafafa',
          600: '#fbfbfb',
          700: '#fcfcfc',
          800: '#fdfdfd',
          900: '#fefefe'
        },
        blue_violet: {
          DEFAULT: '#7C3AED',
          100: '#170536',
          200: '#2e0a6c',
          300: '#450fa2',
          400: '#5c14d9',
          500: '#7c3aed',
          600: '#9662f0',
          700: '#b189f4',
          800: '#cbb1f8',
          900: '#e5d8fb'
        },
        // shadcn/ui colors
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [],
}
