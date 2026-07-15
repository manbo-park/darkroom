import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import prettierConfig from 'eslint-config-prettier'

// 두 앱 공통 flat config 베이스. 각 앱은 이 배열을 펼친 뒤 자기 규칙을 덧붙인다.
// (prettierConfig는 포맷 관련 규칙만 끄므로, 앱이 뒤에 얹는 비포맷 규칙과 순서 충돌 없음)
export default [
    { ignores: ['dist', 'node_modules'] },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ['**/*.{ts,tsx}'],
        plugins: {
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
        },
        rules: {
            ...reactHooks.configs.recommended.rules,
            'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
        },
    },
    prettierConfig,
]
