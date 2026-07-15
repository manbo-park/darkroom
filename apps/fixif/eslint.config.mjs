import tseslint from 'typescript-eslint'
import globals from 'globals'
import react from 'eslint-plugin-react'
import darkroom from '@darkroom/eslint-config'

export default tseslint.config(
    ...darkroom,

    // fixif 전용: 브라우저 전역 + eslint-plugin-react (classic runtime 규칙 off)
    {
        files: ['**/*.{ts,tsx}'],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
        },
        plugins: { react },
        rules: {
            'react/jsx-uses-react': 'off',
            'react/react-in-jsx-scope': 'off',
        },
    },
)
