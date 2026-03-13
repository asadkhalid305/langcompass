import type { Config } from "tailwindcss"

const config: Config = {
  content: ["./src/app/**/*.{js,ts,tsx,jsx}", "./src/components/**/*.{js,ts,tsx,jsx}", "./src/lib/**/*.{js,ts,tsx,jsx}"],
  theme: {
    extend: {
      borderRadius: {
        lg: "0px",
        md: "0px",
        sm: "0px",
      },
      colors: {
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        card: "hsl(var(--card))",
        "card-foreground": "hsl(var(--card-foreground))",
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        accent: "hsl(var(--accent))",
        "accent-foreground": "hsl(var(--accent-foreground))",
        grammar: {
          main: "#3B82F6",
          bg: "#EFF6FF",
        },
        vocab: {
          main: "#F59E0B",
          bg: "#FFFBEB",
        },
        comm: {
          main: "#F97316",
          bg: "#FFF7ED",
        },
        syntax: {
          main: "#8B5CF6",
          bg: "#FAF5FF",
        },
      },
      fontFamily: {
        sans: ["var(--font-text)", "Inter", "sans-serif"],
        display: ["var(--font-display)", "Space Grotesk", "sans-serif"],
      },
    },
  },
  plugins: [],
}

export default config
