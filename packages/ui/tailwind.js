// darkroom 공유 Tailwind preset — 디자인 토큰과 base 스타일의 단일 출처.
// tailwindcss/plugin을 import하지 않고 plain 함수 plugin을 쓴다 (pnpm 격리에서 의존성 불필요).

const colors = {
    bg: '#0a0a0a',
    surface: '#1a1a1a',
    border: '#2a2a2a',
    muted: '#666666',
    text: '#e5e5e5',
    accent: '#d4a853',
    danger: '#e05a4e',
    warn: '#d4b84a',
};

const fontFamily = ['JoseonGulim', 'ui-monospace', 'monospace'];

/** @type {import('tailwindcss').Config} */
export default {
    content: [],
    theme: {
        extend: {
            colors: { film: colors },
            fontFamily: { mono: fontFamily },
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
    plugins: [
        ({ addBase, addUtilities }) => {
            addBase({
                '@font-face': {
                    fontFamily: 'JoseonGulim',
                    src: "url('https://cdn.jsdelivr.net/gh/projectnoonnu/noonfonts_20-04@1.0/ChosunGu.woff') format('woff')",
                    fontWeight: 'normal',
                    fontDisplay: 'swap',
                },
                '*': {
                    '-webkit-tap-highlight-color': 'transparent',
                    boxSizing: 'border-box',
                },
                html: { backgroundColor: colors.bg },
                body: {
                    backgroundColor: colors.bg,
                    color: colors.text,
                    fontFamily: "'JoseonGulim', ui-monospace, monospace",
                    overscrollBehavior: 'none',
                    '-webkit-font-smoothing': 'antialiased',
                },
                // number input 스피너 제거
                "input[type='number']::-webkit-outer-spin-button, input[type='number']::-webkit-inner-spin-button":
                    { '-webkit-appearance': 'none', margin: '0' },
                '::-webkit-scrollbar': { width: '4px' },
                '::-webkit-scrollbar-track': { background: 'transparent' },
                '::-webkit-scrollbar-thumb': { background: colors.border, borderRadius: '2px' },
            });

            const gradient = `linear-gradient(135deg, #407c01, ${colors.accent})`;
            addUtilities({
                // 액센트 그라데이션 배경
                '.accent-gradient-bg': { background: gradient },
                '.accent-gradient-bg:hover': {
                    background: 'linear-gradient(135deg, #4d9401, #e0b85e)',
                },
                // 그라데이션 테두리 (어두운 배경 + 그라데이션 border)
                '.accent-gradient-border': {
                    border: '2px solid transparent',
                    background: `linear-gradient(${colors.bg}, ${colors.bg}) padding-box, ${gradient} border-box`,
                },
                '.muted-border': {
                    border: `2px solid ${colors.muted}`,
                    background: colors.bg,
                },
            });
        },
    ],
};
