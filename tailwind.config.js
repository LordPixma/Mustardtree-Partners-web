/* eslint-env node */

// Refined brand palette — muted mustard-gold on deep navy with warm ivory.
// `gold` is the single accent; `yellow` is remapped to the same scale so
// pages not yet refactored to the named tokens harmonise automatically.
const gold = {
  50: "#FBF8EF",
  100: "#F4ECD3",
  200: "#E9D8A6",
  300: "#DCC071",
  400: "#CFAA4A",
  500: "#C39A37", // primary accent (muted mustard-gold)
  600: "#A47E2A", // accent for text on light surfaces
  700: "#836222",
  800: "#674D20",
  900: "#564020",
};

const navy = {
  50: "#F2F5F8",
  100: "#E2E8F0",
  200: "#C2CEDC",
  300: "#94A8BE",
  400: "#5E789A",
  500: "#3C597C",
  600: "#23425F",
  700: "#1C3650",
  800: "#142A40",
  900: "#0E1F30", // primary dark surface
  950: "#081523", // deepest
};

module.exports = {content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  darkMode: "selector",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        gold,
        yellow: gold,
        navy,
        ivory: {
          DEFAULT: "#F8F6F1",
          50: "#FCFBF8",
          100: "#F8F6F1",
          200: "#EFEBE1",
        },
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
      keyframes: {
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
      },
    },
  },
}