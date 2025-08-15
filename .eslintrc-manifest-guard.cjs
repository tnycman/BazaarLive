module.exports = {
  overrides: [
    {
      files: [
        'client/src/services/category/configs/ConfigurationRegistry.ts',
      ],
      rules: {
        'no-restricted-imports': [
          'error',
          {
            name: '@/services/category/configs/fashion/women',
            message: 'Do not import static fashion configs; use generated manifest.'
          },
          {
            name: '@/services/category/configs/fashion/women-optimized',
            message: 'Do not import static fashion configs; use generated manifest.'
          },
          {
            name: '@/services/category/configs/fashion/men',
            message: 'Do not import static fashion configs; use generated manifest.'
          },
          {
            name: '@/services/category/configs/fashion/kids',
            message: 'Do not import static fashion configs; use generated manifest.'
          },
          {
            name: '@/services/category/configs/fashion/home',
            message: 'Do not import static fashion configs; use generated manifest.'
          },
          {
            name: '@/services/category/configs/fashion/electronics',
            message: 'Do not import static fashion configs; use generated manifest.'
          },
          {
            name: '@/services/category/configs/fashion/pets',
            message: 'Do not import static fashion configs; use generated manifest.'
          },
          {
            name: '@/services/category/configs/fashion/beauty',
            message: 'Do not import static fashion configs; use generated manifest.'
          },
          {
            name: '@/services/category/configs/fashion/sports',
            message: 'Do not import static fashion configs; use generated manifest.'
          },
          {
            name: '@/services/category/configs/fashion/women-accessories',
            message: 'Do not import static fashion configs; use generated manifest.'
          }
        ]
      }
    }
  ]
};



