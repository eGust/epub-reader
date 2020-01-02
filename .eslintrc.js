module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  env: {
    browser: true,
    node: true,
  },
  plugins: [
    '@typescript-eslint',
  ],
  extends: [
    'airbnb-typescript',
  ],
  ignorePatterns: ['!.*.js'],
  // add your custom rules here
  rules: {
    'max-len': ['warn', 100],
    'no-console': 'off',
    'max-classes-per-file': 'off',
    'no-unused-vars': [
      'error', {
        vars: 'all',
        args: 'after-used',
        ignoreRestSiblings: true,
        argsIgnorePattern: '^_',
      },
    ],
    'spaced-comment': [
      'error',
      'always',
      {
        line: {
          exceptions: [
            '-',
            '+',
            '/',
          ],
          markers: [
            '=',
            '!',
            '/',
          ],
        },
        block: {
          exceptions: [
            '-',
            '+',
          ],
          markers: [
            '=',
            '!',
            ':',
            '::',
          ],
          balanced: true,
        },
      },
    ],
  },
  globals: {
  },
};
