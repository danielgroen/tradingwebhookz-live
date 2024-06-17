module.exports = {
  root: true,
  parserOptions: {
    project: './tsconfig.json',
  },
  env: { browser: true, es2020: true },
  plugins: ['react', 'import', '@typescript-eslint', 'prettier'],

  extends: [
    'airbnb-typescript/base',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:react/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  settings: {
    'import/resolver': {
      typescript: true,
      node: true,
    },
    react: {
      version: 'detect',
    },
  },
  rules: {
    'react/jsx-curly-brace-presence': ['error', { props: 'never', children: 'ignore' }],
    'react/react-in-jsx-scope': 'off',
    'import/order': [
      'error',
      {
        groups: ['builtin', 'external', 'internal'],
        pathGroups: [
          {
            pattern: 'react*',
            group: 'builtin',
            position: 'before',
          },
          {
            pattern: '@mui/*',
            group: 'builtin',
            position: 'after',
          },
          {
            pattern: '@payconiq/*',
            group: 'builtin',
            position: 'after',
          },
          {
            pattern: '@/**',
            group: 'internal',
            position: 'after',
          },
        ],
        pathGroupsExcludedImportTypes: ['react', '@mui/**', '@payconiq/**'],
        'newlines-between': 'never',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
      },
    ],
    '@typescript-eslint/consistent-type-imports': [
      'warn',
      {
        fixStyle: 'inline-type-imports',
      },
    ],
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: true,
        peerDependencies: true,
      },
    ],
    '@typescript-eslint/naming-convention': [
      'warn',
      {
        selector: 'default',
        format: ['camelCase', 'PascalCase'],
        filter: {
          regex: '^(&|.|#||aria-)',
          match: false,
        },
      },
      {
        selector: ['interface', 'typeAlias'],
        format: ['PascalCase'],
      },
      {
        selector: ['enum', 'enumMember'],
        format: ['UPPER_CASE'],
      },
    ],
    '@typescript-eslint/ban-ts-comment': 'warn',
  },
};
