import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

const config: Config = {
    darkMode: "class",
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
        extend: {
                colors: {
                        background: 'hsl(var(--background))',
                        foreground: 'hsl(var(--foreground))',
                        card: {
                                DEFAULT: 'hsl(var(--card))',
                                foreground: 'hsl(var(--card-foreground))'
                        },
                        popover: {
                                DEFAULT: 'hsl(var(--popover))',
                                foreground: 'hsl(var(--popover-foreground))'
                        },
                        primary: {
                                DEFAULT: 'hsl(var(--primary))',
                                foreground: 'hsl(var(--primary-foreground))'
                        },
                        secondary: {
                                DEFAULT: 'hsl(var(--secondary))',
                                foreground: 'hsl(var(--secondary-foreground))'
                        },
                        muted: {
                                DEFAULT: 'hsl(var(--muted))',
                                foreground: 'hsl(var(--muted-foreground))'
                        },
                        accent: {
                                DEFAULT: 'hsl(var(--accent))',
                                foreground: 'hsl(var(--accent-foreground))'
                        },
                        destructive: {
                                DEFAULT: 'hsl(var(--destructive))',
                                foreground: 'hsl(var(--destructive-foreground))'
                        },
                        border: 'hsl(var(--border))',
                        input: 'hsl(var(--input))',
                        ring: 'hsl(var(--ring))',
                        chart: {
                                '1': 'hsl(var(--chart-1))',
                                '2': 'hsl(var(--chart-2))',
                                '3': 'hsl(var(--chart-3))',
                                '4': 'hsl(var(--chart-4))',
                                '5': 'hsl(var(--chart-5))'
                        },
                        // 蜡笔小新主题颜色
                        crayon: {
                                bg: 'hsl(var(--crayon-bg))',
                                fg: 'hsl(var(--crayon-fg))',
                                primary: 'hsl(var(--crayon-primary))',
                                secondary: 'hsl(var(--crayon-secondary))',
                                accent: 'hsl(var(--crayon-accent))',
                                muted: 'hsl(var(--crayon-muted))',
                                border: 'hsl(var(--crayon-border))',
                                card: 'hsl(var(--crayon-card))'
                        },
                        // 魔法小樱主题颜色
                        sakura: {
                                bg: 'hsl(var(--sakura-bg))',
                                fg: 'hsl(var(--sakura-fg))',
                                primary: 'hsl(var(--sakura-primary))',
                                secondary: 'hsl(var(--sakura-secondary))',
                                accent: 'hsl(var(--sakura-accent))',
                                muted: 'hsl(var(--sakura-muted))',
                                border: 'hsl(var(--sakura-border))',
                                card: 'hsl(var(--sakura-card))'
                        }
                },
                borderRadius: {
                        lg: 'var(--radius)',
                        md: 'calc(var(--radius) - 2px)',
                        sm: 'calc(var(--radius) - 4px)'
                },
                fontFamily: {
                        'crayon': ['Comic Sans MS', 'Marker Felt', 'Chalkboard', 'cursive'],
                        'sakura': ['Georgia', 'Times New Roman', 'serif']
                }
        }
  },
  plugins: [tailwindcssAnimate],
};
export default config;
