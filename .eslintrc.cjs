module.exports = {
  'env': {
    'browser': true,
    'es2021': true,
  },
  'extends': 'google',
  "plugins": [
    "unicorn",
    "import",
    "eslint-comments",
    "sonarjs",
    "promise",
    "no-secrets"
  ],
  'overrides': [
    {
      'env': {
        'node': true,
      },
      'files': [
        '.eslintrc.{js,cjs,mjs}',
      ],
      'parserOptions': {
        'sourceType': 'script',
      },
    },
  ],
  'parserOptions': {
    'ecmaVersion': 'latest',
    'sourceType': 'module',
  },
  "rules": {
    "no-undef": "warn",
    "no-unused-vars": "warn",
    "unicorn/rule-name": "warn",
    "import/rule-name": "warn",
    "eslint-comments/rule-name": "warn",
    "sonarjs/rule-name": "warn",
    "promise/rule-name": "warn"
  },
};
