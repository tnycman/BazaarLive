module.exports = {
  overrides: [
    {
      files: ['**/*.{ts,tsx,js,jsx}'],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            paths: [],
            patterns: [
              {
                group: ['@/legacy/*', '../../legacy/*', '../legacy/*', 'client/src/legacy/*'],
                message: 'Imports from legacy/ are banned. Use universal modules instead.'
              }
            ]
          }
        ]
      }
    }
  ]
};



