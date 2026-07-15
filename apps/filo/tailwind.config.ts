import type { Config } from 'tailwindcss'

export default {
    content: ['./index.html', './src/**/*.{ts,tsx}'],
    theme: {
        extend: {
            colors: {
                film: {
                    bg: '#0a0a0a',
                    surface: '#1a1a1a',
                    border: '#2a2a2a',
                    muted: '#666666',
                    text: '#e5e5e5',
                    accent: '#d4a853',
                    danger: '#e05a4e',
                    warn: '#d4b84a',
                },
            },
            fontFamily: {
                mono: ['JoseonGulim', 'ui-monospace', 'monospace'],
            },
            animation: {
                'fade-in': 'fadeIn 0.4s ease-in-out',
                'slide-up': 'slideUp 0.3s ease-out',
                pulse_slow: 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(20px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
            },
        },
    },
    plugins: [],
} satisfies Config
