module.exports = {
  env: {
    browser: false,
    commonjs: true,
    es6: true,
    node: true
  },
  extends: ['eslint:recommended'],
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 8
  },
  rules: {
    'max-len': [2, 120, 4, { ignoreUrls: true }],
    'linebreak-style': ['error', 'unix'],
    'prettier/prettier': ['error'],
    quotes: ['error', 'single'],
    semi: ['error', 'never'],
    'object-curly-spacing': ['error', 'always'],
    indent: ['error', 2],
    'no-tabs': 0,
    'comma-dangle': ['error', 'never'],
    'no-console': 'off'
  },
  plugins: ['prettier']
}
