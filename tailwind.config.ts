import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        muted: "hsl(var(--muted))",
        "muted-foreground": "hsl(var(--muted-foreground))",
        primary: "hsl(var(--primary))",
        "primary-foreground": "hsl(var(--primary-foreground))",
        "brand-dark": "hsl(var(--brand-dark))",
        "brand-mid": "hsl(var(--brand-mid))",
        "brand-cyan": "hsl(var(--brand-cyan))",
        surface: "hsl(var(--surface))",
        warning: "hsl(var(--warning))",
        danger: "hsl(var(--danger))",
        success: "hsl(var(--success))"
      },
      boxShadow: {
        soft: "0 12px 30px rgba(17, 24, 39, 0.06)"
      }
    }
  },
  plugins: []
};

export default config;
