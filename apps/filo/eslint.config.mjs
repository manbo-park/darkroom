import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import prettierConfig from 'eslint-config-prettier'

export default tseslint.config(
    // 검사 대상에서 제외
    { ignores: ['dist', 'node_modules', 'public'] },

    // JS 기본 권장 규칙
    js.configs.recommended,

    // TypeScript 권장 규칙
    ...tseslint.configs.recommended,

    {
        files: ['**/*.{ts,tsx}'],
        plugins: {
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
        },
        rules: {
            // React Hooks 규칙
            ...reactHooks.configs.recommended.rules,

            // React Refresh (Vite HMR)
            'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

            // TypeScript
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
            '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
            '@typescript-eslint/no-explicit-any': 'warn',

            // 일반
            'no-console': ['warn', { allow: ['warn', 'error'] }],
        },
    },

    // Prettier 충돌 규칙 비활성화 (항상 마지막에 위치)
    prettierConfig
)
