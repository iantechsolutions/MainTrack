import type { Config } from 'tailwindcss'
import tailwindcssAnimate from 'tailwindcss-animate'

const config = {
    darkMode: ['class'],
    content: [
        './src/**/*.{ts,tsx}',
        './app/**/*.{ts,tsx}',
        './pages/**/*.{ts,tsx}',
        './components/**/*.{ts,tsx}',
        '../../packages/ui/src/**/*.{ts,tsx}',
    ],
    prefix: '',
    theme: {
        container: {
            center: true,
            padding: '2rem',
            screens: {
                '2xl': '1400px',
            },
        },
        extend: {
            colors: {
                border: 'hsl(var(--border))',
                input: 'hsl(var(--input))',
                ring: 'hsl(var(--ring))',
                background: 'hsl(var(--background))',
                foreground: 'hsl(var(--foreground))',
                primary: {
                    DEFAULT: 'hsl(var(--primary))',
                    foreground: 'hsl(var(--primary-foreground))',
                },
                secondary: {
                    DEFAULT: 'hsl(var(--secondary))',
                    foreground: 'hsl(var(--secondary-foreground))',
                },
                destructive: {
                    DEFAULT: 'hsl(var(--destructive))',
                    foreground: 'hsl(var(--destructive-foreground))',
                },
                muted: {
                    DEFAULT: 'hsl(var(--muted))',
                    foreground: 'hsl(var(--muted-foreground))',
                },
                accent: {
                    DEFAULT: 'hsl(var(--accent))',
                    foreground: 'hsl(var(--accent-foreground))',
                },
                popover: {
                    DEFAULT: 'hsl(var(--popover))',
                    foreground: 'hsl(var(--popover-foreground))',
                },
                card: {
                    DEFAULT: 'hsl(var(--card))',
                    foreground: 'hsl(var(--card-foreground))',
                },
            },
            borderRadius: {
                lg: 'var(--radius)',
                md: 'calc(var(--radius) - 2px)',
                sm: 'calc(var(--radius) - 4px)',
            },
            keyframes: {
                'accordion-down': {
                    from: { height: '0' },
                    to: { height: 'var(--radix-accordion-content-height)' },
                },
                'accordion-up': {
                    from: { height: 'var(--radix-accordion-content-height)' },
                    to: { height: '0' },
                },
                blink: {
                    '0%': { opacity: '0' },
                    '40%': { opacity: '0' },
                    '60%': { opacity: '1' },
                    '100%': { opacity: '1' },
                },
                'teleop-override': {
                    '0%': { backgroundColor: '#f59e0b', color: 'hsl(var(--card))' },
                    '45%': { backgroundColor: '#f59e0b', color: 'hsl(var(--card))' },
                    '55%': { backgroundColor: 'hsl(var(--card))', color: '#f59e0b' },
                    '100%': { backgroundColor: 'hsl(var(--card))', color: '#f59e0b' },
                },
            },
            animation: {
                'accordion-down': 'accordion-down 0.2s ease-out',
                'accordion-up': 'accordion-up 0.2s ease-out',
                blink: 'blink 0.5s infinite alternate',
                'blink-inverted': 'blink 0.5s infinite alternate',
                'teleop-override': 'teleop-override 1s infinite alternate',
            },

            aspectRatio: {
                '4/3': '4 / 3',
            },
        },
    },
    plugins: [tailwindcssAnimate],
} satisfies Config

export default config
