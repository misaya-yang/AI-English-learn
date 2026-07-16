/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
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
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        danger: {
          DEFAULT: "hsl(var(--danger))",
          foreground: "hsl(var(--danger-foreground))",
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
        success: {
          DEFAULT: "hsl(var(--success))",
          foreground: "hsl(var(--success-foreground))",
        },
        warning: {
          DEFAULT: "hsl(var(--warning))",
          foreground: "hsl(var(--warning-foreground))",
        },
        info: {
          DEFAULT: "hsl(var(--info))",
          foreground: "hsl(var(--info-foreground))",
        },
        "surface-elevated": "hsl(var(--surface-elevated))",
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      borderRadius: {
        "3xl": "1.5rem",
        "2xl": "1.25rem",
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
      },
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        card: "0 8px 30px rgb(2 6 23 / 0.04)",
        "glass": "0 1px 1px hsl(var(--shadow-studio) / 0.04), 0 12px 24px -24px hsl(var(--shadow-studio) / 0.22)",
        "glass-hover": "0 1px 1px hsl(var(--shadow-studio) / 0.05), 0 14px 28px -24px hsl(var(--shadow-studio) / 0.26)",
        "glass-edge": "inset 0 1px 0 hsl(var(--foreground) / 0.05)",
        "glow-emerald": "0 1px 1px hsl(var(--shadow-studio) / 0.04), 0 10px 20px -22px hsl(var(--shadow-studio) / 0.22)",
        "glow-emerald-lg": "0 1px 1px hsl(var(--shadow-studio) / 0.05), 0 14px 28px -24px hsl(var(--shadow-studio) / 0.26)",
        "glow-emerald-inner": "inset 0 1px 0 hsl(var(--foreground) / 0.05)",
      },
      fontSize: {
        "token-12": ["var(--text-12)", { lineHeight: "1.5" }],
        "token-14": ["var(--text-14)", { lineHeight: "1.55" }],
        "token-16": ["var(--text-16)", { lineHeight: "1.55" }],
        "token-20": ["var(--text-20)", { lineHeight: "1.4" }],
        "token-24": ["var(--text-24)", { lineHeight: "1.35" }],
        "token-32": ["var(--text-32)", { lineHeight: "1.25" }],
      },
      fontFamily: {
        sans: ['ui-sans-serif', 'system-ui', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', '"PingFang SC"', '"Hiragino Sans GB"', '"Microsoft YaHei"', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"SFMono-Regular"', 'ui-monospace', 'monospace'],
      },
      keyframes: {
        spotlight: {
          "0%": {
            opacity: 0,
            transform: "translate(-72%, -62%) scale(0.5)",
          },
          "100%": {
            opacity: 1,
            transform: "translate(-50%,-40%) scale(1)",
          },
        },
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        "scale-press": {
          "0%, 100%": { transform: "scale(1)" },
          "50%": { transform: "scale(0.97)" },
        },
        "shake": {
          "0%, 100%": { transform: "translateX(0)" },
          "10%, 30%, 50%, 70%, 90%": { transform: "translateX(-2px)" },
          "20%, 40%, 60%, 80%": { transform: "translateX(2px)" },
        },
        "slide-up": {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "slide-down": {
          from: { opacity: "0", transform: "translateY(-8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "glow-pulse": {
          "0%, 100%": { boxShadow: "0 0 0 0 hsl(var(--primary) / 0)" },
          "50%": { boxShadow: "0 0 0 3px hsl(var(--foreground) / 0.06)" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        "scale-press": "scale-press 180ms cubic-bezier(0.2, 0, 0, 1)",
        "shake": "shake 400ms ease-in-out",
        "slide-up": "slide-up 280ms cubic-bezier(0, 0, 0, 1)",
        "slide-down": "slide-down 280ms cubic-bezier(0, 0, 0, 1)",
        "fade-in": "fade-in 200ms ease-out",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
      },
      transitionDuration: {
        120: "120ms",
        180: "180ms",
        280: "280ms",
      },
      transitionTimingFunction: {
        standard: "cubic-bezier(0.2, 0, 0, 1)",
        decelerate: "cubic-bezier(0, 0, 0, 1)",
      },
      opacity: {
        8: "0.08",
        15: "0.15",
        18: "0.18",
        22: "0.22",
        24: "0.24",
        28: "0.28",
        35: "0.35",
        42: "0.42",
        44: "0.44",
        45: "0.45",
        52: "0.52",
        55: "0.55",
        58: "0.58",
        64: "0.64",
        65: "0.65",
        66: "0.66",
        72: "0.72",
        78: "0.78",
        82: "0.82",
        85: "0.85",
        92: "0.92",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
