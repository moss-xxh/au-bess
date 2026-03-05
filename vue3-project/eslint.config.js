import js from '@eslint/js'
import pluginVue from 'eslint-plugin-vue'
import tseslint from 'typescript-eslint'
import skipFormatting from '@vue/eslint-config-prettier/skip-formatting'

export default [
  { name: 'app/files-to-lint', files: ['**/*.{ts,mts,tsx,vue}'] },
  { name: 'app/files-to-ignore', ignores: ['**/dist/**', '**/node_modules/**', '**/e2e/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs['flat/essential'],
  {
    files: ['**/*.vue'],
    languageOptions: { parserOptions: { parser: tseslint.parser } }
  },
  skipFormatting,
  {
    languageOptions: {
      globals: {
        setTimeout: 'readonly',
        clearTimeout: 'readonly',
        setInterval: 'readonly',
        clearInterval: 'readonly',
        console: 'readonly',
        document: 'readonly',
        window: 'readonly',
        localStorage: 'readonly',
        alert: 'readonly',
        fetch: 'readonly'
      }
    }
  },
  {
    rules: {
      'no-console': 'warn',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'vue/multi-word-component-names': 'off'
    }
  }
]
