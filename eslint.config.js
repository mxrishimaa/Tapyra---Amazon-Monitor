import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

// Configura as regras de análise estática aplicadas aos arquivos JavaScript/JSX.
export default defineConfig([
  // Arquivos gerados pelo build não precisam ser analisados como código-fonte.
  globalIgnores(['dist']),
  {
    files: ['**/*.{js,jsx}'],
    // Combina regras recomendadas do JavaScript, hooks do React e Vite.
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    // Informa ao ESLint quais variáveis existem no navegador e permite JSX.
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
])
