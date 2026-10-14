import type { Config } from 'tailwindcss'
import darkroom from '@darkroom/ui/tailwind'

export default {
    presets: [darkroom],
    content: ['./index.html', './src/**/*.{ts,tsx}'],
} satisfies Config
