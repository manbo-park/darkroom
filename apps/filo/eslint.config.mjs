import tseslint from 'typescript-eslint'
import darkroom from '@darkroom/eslint-config'

export default tseslint.config(
    ...darkroom,

    // filo 전용 TypeScript·일반 규칙
    {
        files: ['**/*.{ts,tsx}'],
        rules: {
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }],
            '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],
            '@typescript-eslint/no-explicit-any': 'warn',
            'no-console': ['warn', { allow: ['warn', 'error'] }],
        },
    },
)
