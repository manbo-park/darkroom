import type { Config } from 'tailwindcss';
import darkroom from '@darkroom/ui/tailwind';

export default {
    presets: [darkroom],
    content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
} satisfies Config;
