export default {
    root: true,
    env: {
      node: true,
      es6: true,
    },
    extends: ['airbnb-base', 'prettier'],
    parserOptions: {
      ecmaVersion: 2021,
      sourceType: 'module',
    },
    plugins: ['import', 'prettier'],
    rules: {
      'prettier/prettier': 'error',
      'no-console': 'off', // You may want to turn this on in production
      'import/extensions': [
        'error',
        'ignorePackages',
        {
          js: 'never',
        },
      ],
    },
    settings: {
      'import/resolver': {
        node: {
          extensions: ['.js'],
        },
      },
    },
  };