/* eslint-env node */
require('@rushstack/eslint-patch/modern-module-resolution')

module.exports = {
  env: {
    "node": true
  },
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  'extends': [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/eslint-config-prettier/skip-formatting',
    'plugin:@typescript-eslint/recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest'
  },
  globals: {
    'BigInt': 'readonly'
  },
  rules: {
    // Allow 'any' type
    '@typescript-eslint/no-explicit-any': 'off',
    // Or if you want to allow 'any' but warn about it
    // '@typescript-eslint/no-explicit-any': 'warn',

    // Allow unused variables that start with underscore
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
      }
    ]
  }
}