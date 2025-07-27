// Filter Option Definitions - Poshmark Style
export const FILTER_OPTIONS = {
  categories: {
    women: [
      { id: 'accessories', name: 'Accessories', count: 8542 },
      { id: 'bags', name: 'Bags', count: 6234 },
      { id: 'dresses', name: 'Dresses', count: 5234 },
      { id: 'intimates_sleepwear', name: 'Intimates & Sleepwear', count: 2134 },
      { id: 'jackets_coats', name: 'Jackets & Coats', count: 3245 },
      { id: 'jeans', name: 'Jeans', count: 4567 },
      { id: 'jewelry', name: 'Jewelry', count: 5678 },
      { id: 'makeup', name: 'Makeup', count: 3456 },
      { id: 'pants_jumpsuits', name: 'Pants & Jumpsuits', count: 2345 },
      { id: 'shoes', name: 'Shoes', count: 7890 },
      { id: 'shorts', name: 'Shorts', count: 1234 },
      { id: 'skirts', name: 'Skirts', count: 2456 },
      { id: 'sweaters', name: 'Sweaters', count: 3567 },
      { id: 'swim', name: 'Swim', count: 1567 },
      { id: 'tops', name: 'Tops', count: 8901 },
      { id: 'skincare', name: 'Skincare', count: 2345 },
      { id: 'hair', name: 'Hair', count: 1456 },
      { id: 'bath_body', name: 'Bath & Body', count: 1234 },
      { id: 'global_traditional', name: 'Global & Traditional Wear', count: 567 }
    ]
  },
  
  popularBrands: [
    { id: '7_for_all_mankind', name: '7 For All Mankind', count: 234 },
    { id: 'a_new_day', name: 'A New Day', count: 567 },
    { id: 'alo_yoga', name: 'ALO Yoga', count: 345 },
    { id: 'abercrombie_fitch', name: 'Abercrombie & Fitch', count: 678 },
    { id: 'adidas', name: 'Adidas', count: 890 },
    { id: 'adrianna_papell', name: 'Adrianna Papell', count: 123 },
    { id: 'aerie', name: 'Aerie', count: 456 },
    { id: 'aeropostale', name: 'Aeropostale', count: 234 },
    { id: 'ag_adriano_goldschmied', name: 'AG Adriano Goldschmied', count: 178 },
    { id: 'agolde', name: 'Agolde', count: 234 },
    { id: 'alex_and_ani', name: 'Alex and Ani', count: 345 },
    { id: 'alfani', name: 'Alfani', count: 234 },
    { id: 'alfred_dunner', name: 'Alfred Dunner', count: 156 },
    { id: 'alice_olivia', name: 'Alice + Olivia', count: 289 },
    { id: 'all_saints', name: 'All Saints', count: 178 },
    { id: 'american_eagle', name: 'American Eagle', count: 456 },
    { id: 'ann_taylor', name: 'Ann Taylor', count: 234 },
    { id: 'anthropologie', name: 'Anthropologie', count: 567 },
    { id: 'banana_republic', name: 'Banana Republic', count: 345 },
    { id: 'calvin_klein', name: 'Calvin Klein', count: 678 }
  ],
  
  sizes: {
    all: [
      { id: 'all_sizes', name: 'All Sizes', selected: true },
      { id: 'my_size', name: 'My Size', hint: 'Get better results and search faster' }
    ],
    standard: [
      { id: 'xs', name: 'XS' },
      { id: 's', name: 'S' },
      { id: 'm', name: 'M' },
      { id: 'l', name: 'L' },
      { id: 'xl', name: 'XL' },
      { id: 'xxl', name: 'XXL' },
      { id: '1x', name: '1X' },
      { id: '2x', name: '2X' },
      { id: '3x', name: '3X' }
    ],
    numeric: [
      { id: '0', name: '0' },
      { id: '2', name: '2' },
      { id: '4', name: '4' },
      { id: '6', name: '6' },
      { id: '8', name: '8' },
      { id: '10', name: '10' },
      { id: '12', name: '12' },
      { id: '14', name: '14' },
      { id: '16', name: '16' },
      { id: '18', name: '18' },
      { id: '20', name: '20' },
      { id: '22', name: '22' },
      { id: '24', name: '24' }
    ]
  },
  
  colors: [
    { id: 'all_colors', name: 'All Colors', selected: true },
    { id: 'black', name: 'Black', hex: '#000000' },
    { id: 'blue', name: 'Blue', hex: '#0066CC' },
    { id: 'brown', name: 'Brown', hex: '#8B4513' },
    { id: 'gray', name: 'Gray', hex: '#808080' },
    { id: 'green', name: 'Green', hex: '#008000' },
    { id: 'orange', name: 'Orange', hex: '#FFA500' },
    { id: 'pink', name: 'Pink', hex: '#FFC0CB' },
    { id: 'purple', name: 'Purple', hex: '#800080' },
    { id: 'red', name: 'Red', hex: '#FF0000' },
    { id: 'white', name: 'White', hex: '#FFFFFF' },
    { id: 'yellow', name: 'Yellow', hex: '#FFFF00' },
    { id: 'beige', name: 'Beige', hex: '#F5F5DC' },
    { id: 'gold', name: 'Gold', hex: '#FFD700' },
    { id: 'silver', name: 'Silver', hex: '#C0C0C0' },
    { id: 'cream', name: 'Cream', hex: '#FFFDD0' }
  ],
  
  priceRanges: [
    { id: 'all_prices', name: 'All Prices', selected: true },
    { id: 'under_25', name: 'Under $25', min: 0, max: 25 },
    { id: '25_50', name: '$25 - $50', min: 25, max: 50 },
    { id: '50_100', name: '$50 - $100', min: 50, max: 100 },
    { id: '100_250', name: '$100 - $250', min: 100, max: 250 },
    { id: '250_500', name: '$250 - $500', min: 250, max: 500 },
    { id: 'over_500', name: 'Over $500', min: 500 }
  ],
  
  conditions: [
    { id: 'all_conditions', name: 'All Conditions', selected: true },
    { id: 'new_with_tags', name: 'New with Tags' },
    { id: 'new_without_tags', name: 'New without Tags' },
    { id: 'excellent', name: 'Excellent' },
    { id: 'good', name: 'Good' },
    { id: 'fair', name: 'Fair' }
  ],
  
  availability: [
    { id: 'available_items', name: 'Available Items', selected: true },
    { id: 'available_dropping_soon', name: 'Available + Dropping Soon Items' },
    { id: 'dropping_soon', name: 'Dropping Soon Items' },
    { id: 'sold_items', name: 'Sold Items' }
  ],
  
  shipping: [
    { id: 'all_items', name: 'All Items', selected: true },
    { id: 'free', name: 'Free' },
    { id: 'discounted_free', name: 'Discounted + Free' }
  ],
  
  type: [
    { id: 'all_types', name: 'All Types', selected: true },
    { id: 'closet', name: 'Closet' },
    { id: 'boutique', name: 'Boutique' }
  ],
  
  sortOptions: [
    { id: 'just_shared', name: 'Just Shared' },
    { id: 'newest', name: 'Newest' },
    { id: 'price_low_to_high', name: 'Price: Low to High' },
    { id: 'price_high_to_low', name: 'Price: High to Low' },
    { id: 'size', name: 'Size' },
    { id: 'most_liked', name: 'Most Liked' }
  ]
};

// UI Configuration Constants
export const FILTER_UI_CONFIG = {
  collapsibleSections: [
    'categories',
    'brands', 
    'size',
    'color',
    'price',
    'shipping',
    'condition',
    'availability',
    'type'
  ],
  
  defaultCollapsed: [
    'shipping',
    'condition', 
    'availability',
    'type'
  ],
  
  searchableFields: [
    'brands'
  ],
  
  colorPickerSections: [
    'color'
  ],
  
  priceRangeSections: [
    'price'
  ],
  
  checkboxSections: [
    'categories',
    'brands',
    'size', 
    'condition',
    'availability',
    'shipping',
    'type'
  ]
};

// Filter Display Messages
export const FILTER_MESSAGES = {
  noResults: {
    title: 'No items found',
    message: 'Try adjusting your filters or search terms',
    suggestions: [
      'Check your spelling',
      'Try broader search terms',
      'Remove some filters',
      'Browse different categories'
    ]
  },
  
  loading: {
    title: 'Loading...',
    message: 'Finding the perfect items for you'
  },
  
  error: {
    title: 'Something went wrong',
    message: 'Please try again or contact support'
  },
  
  filterHints: {
    mySize: 'Select a category for specific sizes',
    customPrice: 'Enter custom price range',
    brandSearch: 'Type to search brands...'
  }
};