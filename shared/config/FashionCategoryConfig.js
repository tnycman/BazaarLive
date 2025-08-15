// Women's Fashion Configuration
const WOMENS_CONFIG = {
    subcategories: [
        {
            value: 'dresses',
            label: 'Dresses',
            description: 'Casual, formal, and cocktail dresses',
            icon: 'dress',
            isPopular: true,
            searchTerms: ['dress', 'gown', 'frock']
        },
        {
            value: 'tops',
            label: 'Tops & Blouses',
            description: 'Shirts, blouses, tank tops, and sweaters',
            icon: 'shirt',
            isPopular: true,
            searchTerms: ['top', 'blouse', 'shirt', 'sweater', 'tank']
        },
        {
            value: 'pants',
            label: 'Pants & Jeans',
            description: 'Jeans, trousers, leggings, and shorts',
            icon: 'pants',
            isPopular: true,
            searchTerms: ['pants', 'jeans', 'trousers', 'leggings', 'shorts']
        },
        {
            value: 'skirts',
            label: 'Skirts',
            description: 'Mini, midi, and maxi skirts',
            icon: 'skirt',
            isPopular: false,
            searchTerms: ['skirt', 'mini', 'midi', 'maxi']
        },
        {
            value: 'shoes',
            label: 'Shoes',
            description: 'Heels, flats, sneakers, and boots',
            icon: 'shoe',
            isPopular: true,
            searchTerms: ['shoes', 'heels', 'flats', 'sneakers', 'boots', 'sandals']
        },
        {
            value: 'bags',
            label: 'Bags & Purses',
            description: 'Handbags, purses, totes, and clutches',
            icon: 'bag',
            isPopular: true,
            searchTerms: ['bag', 'purse', 'handbag', 'tote', 'clutch', 'backpack']
        },
        {
            value: 'jewelry',
            label: 'Jewelry',
            description: 'Necklaces, earrings, bracelets, and rings',
            icon: 'jewelry',
            isPopular: false,
            searchTerms: ['jewelry', 'necklace', 'earrings', 'bracelet', 'ring']
        },
        {
            value: 'accessories',
            label: 'Accessories',
            description: 'Scarves, belts, hats, and sunglasses',
            icon: 'accessories',
            isPopular: false,
            searchTerms: ['accessories', 'scarf', 'belt', 'hat', 'sunglasses']
        },
        {
            value: 'activewear',
            label: 'Activewear',
            description: 'Workout clothes and athletic wear',
            icon: 'activewear',
            isPopular: false,
            searchTerms: ['activewear', 'workout', 'athletic', 'gym', 'yoga']
        },
        {
            value: 'outerwear',
            label: 'Outerwear',
            description: 'Coats, jackets, and blazers',
            icon: 'jacket',
            isPopular: false,
            searchTerms: ['outerwear', 'coat', 'jacket', 'blazer']
        }
    ],
    sizes: [
        { value: 'XXS', label: 'XXS', system: 'us', category: 'clothing', order: 1 },
        { value: 'XS', label: 'XS', system: 'us', category: 'clothing', order: 2 },
        { value: 'S', label: 'S', system: 'us', category: 'clothing', order: 3 },
        { value: 'M', label: 'M', system: 'us', category: 'clothing', order: 4 },
        { value: 'L', label: 'L', system: 'us', category: 'clothing', order: 5 },
        { value: 'XL', label: 'XL', system: 'us', category: 'clothing', order: 6 },
        { value: 'XXL', label: 'XXL', system: 'us', category: 'clothing', order: 7 },
        { value: '0', label: '0', system: 'us', category: 'clothing', order: 8 },
        { value: '2', label: '2', system: 'us', category: 'clothing', order: 9 },
        { value: '4', label: '4', system: 'us', category: 'clothing', order: 10 },
        { value: '6', label: '6', system: 'us', category: 'clothing', order: 11 },
        { value: '8', label: '8', system: 'us', category: 'clothing', order: 12 },
        { value: '10', label: '10', system: 'us', category: 'clothing', order: 13 },
        { value: '12', label: '12', system: 'us', category: 'clothing', order: 14 },
        { value: '14', label: '14', system: 'us', category: 'clothing', order: 15 },
        { value: '16', label: '16', system: 'us', category: 'clothing', order: 16 },
        // Shoe sizes
        { value: '5', label: '5', system: 'us', category: 'shoes', order: 20 },
        { value: '5.5', label: '5.5', system: 'us', category: 'shoes', order: 21 },
        { value: '6', label: '6', system: 'us', category: 'shoes', order: 22 },
        { value: '6.5', label: '6.5', system: 'us', category: 'shoes', order: 23 },
        { value: '7', label: '7', system: 'us', category: 'shoes', order: 24 },
        { value: '7.5', label: '7.5', system: 'us', category: 'shoes', order: 25 },
        { value: '8', label: '8', system: 'us', category: 'shoes', order: 26 },
        { value: '8.5', label: '8.5', system: 'us', category: 'shoes', order: 27 },
        { value: '9', label: '9', system: 'us', category: 'shoes', order: 28 },
        { value: '9.5', label: '9.5', system: 'us', category: 'shoes', order: 29 },
        { value: '10', label: '10', system: 'us', category: 'shoes', order: 30 },
        { value: '11', label: '11', system: 'us', category: 'shoes', order: 31 }
    ],
    popularBrands: [
        { name: 'Zara', isPopular: true, category: ['women'] },
        { name: 'H&M', isPopular: true, category: ['women'] },
        { name: 'Forever 21', isPopular: true, category: ['women'] },
        { name: 'Anthropologie', isPopular: true, category: ['women'] },
        { name: 'Free People', isPopular: true, category: ['women'] },
        { name: 'Lululemon', isPopular: true, category: ['women'] },
        { name: 'Coach', isPopular: true, category: ['women'] },
        { name: 'Kate Spade', isPopular: true, category: ['women'] },
        { name: 'Michael Kors', isPopular: true, category: ['women'] },
        { name: 'Tory Burch', isPopular: true, category: ['women'] }
    ],
    commonMaterials: ['cotton', 'polyester', 'silk', 'wool', 'linen', 'denim', 'leather', 'cashmere', 'modal', 'spandex'],
    commonColors: ['black', 'white', 'navy', 'gray', 'brown', 'red', 'pink', 'blue', 'green', 'beige'],
    attributes: [
        { name: 'neckline', type: 'select', options: ['crew', 'v-neck', 'scoop', 'halter', 'off-shoulder'] },
        { name: 'sleeve_length', type: 'select', options: ['sleeveless', 'short', 'three-quarter', 'long'] },
        { name: 'fit', type: 'select', options: ['regular', 'slim', 'relaxed', 'oversized'] },
        { name: 'pattern', type: 'select', options: ['solid', 'striped', 'floral', 'geometric', 'animal-print'] }
    ],
    searchBoosts: [
        { field: 'brand', boost: 1.5 },
        { field: 'subcategory', boost: 1.3 },
        { field: 'size', boost: 1.2 }
    ]
};
// Men's Fashion Configuration
const MENS_CONFIG = {
    subcategories: [
        {
            value: 'shirts',
            label: 'Shirts',
            description: 'Dress shirts, casual shirts, and polo shirts',
            icon: 'shirt',
            isPopular: true,
            searchTerms: ['shirt', 'polo', 'button-down', 'dress-shirt']
        },
        {
            value: 'pants',
            label: 'Pants & Jeans',
            description: 'Jeans, chinos, dress pants, and shorts',
            icon: 'pants',
            isPopular: true,
            searchTerms: ['pants', 'jeans', 'chinos', 'trousers', 'shorts']
        },
        {
            value: 'shoes',
            label: 'Shoes',
            description: 'Dress shoes, sneakers, boots, and loafers',
            icon: 'shoe',
            isPopular: true,
            searchTerms: ['shoes', 'sneakers', 'boots', 'loafers', 'oxfords']
        },
        {
            value: 'outerwear',
            label: 'Outerwear',
            description: 'Jackets, coats, and blazers',
            icon: 'jacket',
            isPopular: false,
            searchTerms: ['jacket', 'coat', 'blazer', 'hoodie', 'sweater']
        },
        {
            value: 'accessories',
            label: 'Accessories',
            description: 'Watches, belts, ties, and wallets',
            icon: 'accessories',
            isPopular: false,
            searchTerms: ['watch', 'belt', 'tie', 'wallet', 'cufflinks']
        },
        {
            value: 'activewear',
            label: 'Activewear',
            description: 'Athletic wear and workout clothes',
            icon: 'activewear',
            isPopular: false,
            searchTerms: ['activewear', 'athletic', 'workout', 'gym', 'running']
        }
    ],
    sizes: [
        { value: 'XS', label: 'XS', system: 'us', category: 'clothing', order: 1 },
        { value: 'S', label: 'S', system: 'us', category: 'clothing', order: 2 },
        { value: 'M', label: 'M', system: 'us', category: 'clothing', order: 3 },
        { value: 'L', label: 'L', system: 'us', category: 'clothing', order: 4 },
        { value: 'XL', label: 'XL', system: 'us', category: 'clothing', order: 5 },
        { value: 'XXL', label: 'XXL', system: 'us', category: 'clothing', order: 6 },
        // Shoe sizes
        { value: '7', label: '7', system: 'us', category: 'shoes', order: 20 },
        { value: '7.5', label: '7.5', system: 'us', category: 'shoes', order: 21 },
        { value: '8', label: '8', system: 'us', category: 'shoes', order: 22 },
        { value: '8.5', label: '8.5', system: 'us', category: 'shoes', order: 23 },
        { value: '9', label: '9', system: 'us', category: 'shoes', order: 24 },
        { value: '9.5', label: '9.5', system: 'us', category: 'shoes', order: 25 },
        { value: '10', label: '10', system: 'us', category: 'shoes', order: 26 },
        { value: '10.5', label: '10.5', system: 'us', category: 'shoes', order: 27 },
        { value: '11', label: '11', system: 'us', category: 'shoes', order: 28 },
        { value: '11.5', label: '11.5', system: 'us', category: 'shoes', order: 29 },
        { value: '12', label: '12', system: 'us', category: 'shoes', order: 30 },
        { value: '13', label: '13', system: 'us', category: 'shoes', order: 31 }
    ],
    popularBrands: [
        { name: 'Ralph Lauren', isPopular: true, category: ['men'] },
        { name: 'Nike', isPopular: true, category: ['men'] },
        { name: 'Adidas', isPopular: true, category: ['men'] },
        { name: 'Hugo Boss', isPopular: true, category: ['men'] },
        { name: 'Calvin Klein', isPopular: true, category: ['men'] },
        { name: 'Tommy Hilfiger', isPopular: true, category: ['men'] },
        { name: 'Levis', isPopular: true, category: ['men'] },
        { name: 'Gucci', isPopular: true, category: ['men'] },
        { name: 'Armani', isPopular: true, category: ['men'] },
        { name: 'Burberry', isPopular: true, category: ['men'] }
    ],
    commonMaterials: ['cotton', 'wool', 'polyester', 'linen', 'denim', 'leather', 'cashmere', 'silk'],
    commonColors: ['black', 'white', 'navy', 'gray', 'brown', 'khaki', 'red', 'blue'],
    attributes: [
        { name: 'collar', type: 'select', options: ['spread', 'point', 'button-down', 'mandarin'] },
        { name: 'fit', type: 'select', options: ['slim', 'regular', 'relaxed', 'tailored'] },
        { name: 'sleeve_length', type: 'select', options: ['short', 'long'] }
    ],
    searchBoosts: [
        { field: 'brand', boost: 1.5 },
        { field: 'subcategory', boost: 1.3 }
    ]
};
// Kids Fashion Configuration
const KIDS_CONFIG = {
    subcategories: [
        {
            value: 'clothing',
            label: 'Clothing',
            description: 'Tops, bottoms, dresses, and sets',
            icon: 'shirt',
            isPopular: true,
            searchTerms: ['clothing', 'tops', 'bottoms', 'dresses', 'onesies']
        },
        {
            value: 'shoes',
            label: 'Shoes',
            description: 'Sneakers, sandals, and boots',
            icon: 'shoe',
            isPopular: true,
            searchTerms: ['shoes', 'sneakers', 'sandals', 'boots']
        },
        {
            value: 'accessories',
            label: 'Accessories',
            description: 'Hats, bags, and jewelry',
            icon: 'accessories',
            isPopular: false,
            searchTerms: ['accessories', 'hat', 'bag', 'jewelry']
        },
        {
            value: 'baby',
            label: 'Baby Items',
            description: 'Onesies, bibs, and baby accessories',
            icon: 'baby',
            isPopular: true,
            searchTerms: ['baby', 'onesie', 'bib', 'infant']
        }
    ],
    sizes: [
        // Baby sizes
        { value: 'Newborn', label: 'Newborn', system: 'us', category: 'clothing', order: 1 },
        { value: '0-3M', label: '0-3 Months', system: 'us', category: 'clothing', order: 2 },
        { value: '3-6M', label: '3-6 Months', system: 'us', category: 'clothing', order: 3 },
        { value: '6-9M', label: '6-9 Months', system: 'us', category: 'clothing', order: 4 },
        { value: '9-12M', label: '9-12 Months', system: 'us', category: 'clothing', order: 5 },
        // Toddler sizes
        { value: '12-18M', label: '12-18 Months', system: 'us', category: 'clothing', order: 6 },
        { value: '18-24M', label: '18-24 Months', system: 'us', category: 'clothing', order: 7 },
        { value: '2T', label: '2T', system: 'us', category: 'clothing', order: 8 },
        { value: '3T', label: '3T', system: 'us', category: 'clothing', order: 9 },
        { value: '4T', label: '4T', system: 'us', category: 'clothing', order: 10 },
        // Kids sizes
        { value: '4', label: '4', system: 'us', category: 'clothing', order: 11 },
        { value: '5', label: '5', system: 'us', category: 'clothing', order: 12 },
        { value: '6', label: '6', system: 'us', category: 'clothing', order: 13 },
        { value: '7', label: '7', system: 'us', category: 'clothing', order: 14 },
        { value: '8', label: '8', system: 'us', category: 'clothing', order: 15 },
        { value: '10', label: '10', system: 'us', category: 'clothing', order: 16 },
        { value: '12', label: '12', system: 'us', category: 'clothing', order: 17 },
        { value: '14', label: '14', system: 'us', category: 'clothing', order: 18 }
    ],
    popularBrands: [
        { name: 'Carter\'s', isPopular: true, category: ['kids'] },
        { name: 'Gap Kids', isPopular: true, category: ['kids'] },
        { name: 'Old Navy', isPopular: true, category: ['kids'] },
        { name: 'H&M Kids', isPopular: true, category: ['kids'] },
        { name: 'Zara Kids', isPopular: true, category: ['kids'] },
        { name: 'Nike Kids', isPopular: true, category: ['kids'] },
        { name: 'Adidas Kids', isPopular: true, category: ['kids'] }
    ],
    commonMaterials: ['cotton', 'polyester', 'organic cotton', 'bamboo', 'modal'],
    commonColors: ['pink', 'blue', 'white', 'yellow', 'green', 'red', 'purple', 'multicolor'],
    attributes: [
        { name: 'age_group', type: 'select', options: ['baby', 'toddler', 'kids', 'teen'] },
        { name: 'gender', type: 'select', options: ['boys', 'girls', 'unisex'] }
    ],
    searchBoosts: [
        { field: 'age_group', boost: 1.4 },
        { field: 'brand', boost: 1.3 }
    ]
};
// Main category configuration mapping
export const FASHION_CATEGORY_CONFIG = {
    women: WOMENS_CONFIG,
    men: MENS_CONFIG,
    kids: KIDS_CONFIG,
    home: {
        subcategories: [
            { value: 'furniture', label: 'Furniture', isPopular: true, searchTerms: ['furniture', 'chair', 'table', 'sofa'] },
            { value: 'decor', label: 'Home Decor', isPopular: true, searchTerms: ['decor', 'decoration', 'art', 'frame'] },
            { value: 'kitchen', label: 'Kitchen & Dining', isPopular: false, searchTerms: ['kitchen', 'dining', 'cookware'] },
            { value: 'bedding', label: 'Bedding & Bath', isPopular: false, searchTerms: ['bedding', 'bath', 'towel', 'sheet'] }
        ],
        sizes: [
            { value: 'Small', label: 'Small', system: 'international', category: 'other', order: 1 },
            { value: 'Medium', label: 'Medium', system: 'international', category: 'other', order: 2 },
            { value: 'Large', label: 'Large', system: 'international', category: 'other', order: 3 }
        ],
        popularBrands: [
            { name: 'IKEA', isPopular: true, category: ['home'] },
            { name: 'West Elm', isPopular: true, category: ['home'] },
            { name: 'CB2', isPopular: true, category: ['home'] },
            { name: 'Pottery Barn', isPopular: true, category: ['home'] }
        ],
        commonMaterials: ['wood', 'metal', 'glass', 'ceramic', 'fabric', 'plastic'],
        commonColors: ['white', 'black', 'brown', 'gray', 'beige', 'blue', 'green'],
        attributes: [],
        searchBoosts: [{ field: 'brand', boost: 1.4 }]
    },
    electronics: {
        subcategories: [
            { value: 'phones', label: 'Phones & Tablets', isPopular: true, searchTerms: ['phone', 'tablet', 'iphone', 'ipad'] },
            { value: 'computers', label: 'Computers', isPopular: true, searchTerms: ['computer', 'laptop', 'desktop', 'macbook'] },
            { value: 'gaming', label: 'Gaming', isPopular: false, searchTerms: ['gaming', 'console', 'xbox', 'playstation'] },
            { value: 'accessories', label: 'Tech Accessories', isPopular: false, searchTerms: ['charger', 'case', 'headphones'] }
        ],
        sizes: [],
        popularBrands: [
            { name: 'Apple', isPopular: true, category: ['electronics'] },
            { name: 'Samsung', isPopular: true, category: ['electronics'] },
            { name: 'Sony', isPopular: true, category: ['electronics'] },
            { name: 'Microsoft', isPopular: true, category: ['electronics'] }
        ],
        commonMaterials: ['plastic', 'metal', 'glass', 'silicon'],
        commonColors: ['black', 'white', 'silver', 'gold', 'rose-gold'],
        attributes: [
            { name: 'storage', type: 'select', options: ['16GB', '32GB', '64GB', '128GB', '256GB', '512GB', '1TB'] },
            { name: 'condition', type: 'select', options: ['new', 'like-new', 'good', 'fair'] }
        ],
        searchBoosts: [{ field: 'brand', boost: 2.0 }]
    },
    pets: {
        subcategories: [
            { value: 'clothing', label: 'Pet Clothing', isPopular: false, searchTerms: ['pet-clothing', 'dog-clothes', 'cat-clothes'] },
            { value: 'accessories', label: 'Pet Accessories', isPopular: true, searchTerms: ['collar', 'leash', 'harness'] },
            { value: 'toys', label: 'Pet Toys', isPopular: true, searchTerms: ['toy', 'ball', 'chew'] },
            { value: 'supplies', label: 'Pet Supplies', isPopular: false, searchTerms: ['bowl', 'bed', 'carrier'] }
        ],
        sizes: [
            { value: 'XS', label: 'Extra Small', system: 'international', category: 'other', order: 1 },
            { value: 'S', label: 'Small', system: 'international', category: 'other', order: 2 },
            { value: 'M', label: 'Medium', system: 'international', category: 'other', order: 3 },
            { value: 'L', label: 'Large', system: 'international', category: 'other', order: 4 },
            { value: 'XL', label: 'Extra Large', system: 'international', category: 'other', order: 5 }
        ],
        popularBrands: [
            { name: 'PetSafe', isPopular: true, category: ['pets'] },
            { name: 'Kong', isPopular: true, category: ['pets'] },
            { name: 'Nylabone', isPopular: true, category: ['pets'] }
        ],
        commonMaterials: ['nylon', 'leather', 'cotton', 'plastic', 'rubber'],
        commonColors: ['black', 'brown', 'red', 'blue', 'pink', 'multicolor'],
        attributes: [
            { name: 'pet_type', type: 'select', options: ['dog', 'cat', 'bird', 'small-pet', 'other'] },
            { name: 'pet_size', type: 'select', options: ['small', 'medium', 'large'] }
        ],
        searchBoosts: [{ field: 'pet_type', boost: 1.5 }]
    },
    beauty: {
        subcategories: [
            { value: 'makeup', label: 'Makeup', isPopular: true, searchTerms: ['makeup', 'cosmetics', 'lipstick', 'foundation'] },
            { value: 'skincare', label: 'Skincare', isPopular: true, searchTerms: ['skincare', 'moisturizer', 'cleanser', 'serum'] },
            { value: 'fragrance', label: 'Fragrance', isPopular: false, searchTerms: ['perfume', 'cologne', 'fragrance'] },
            { value: 'tools', label: 'Beauty Tools', isPopular: false, searchTerms: ['brush', 'tool', 'sponge', 'applicator'] }
        ],
        sizes: [],
        popularBrands: [
            { name: 'Sephora', isPopular: true, category: ['beauty'] },
            { name: 'Urban Decay', isPopular: true, category: ['beauty'] },
            { name: 'Too Faced', isPopular: true, category: ['beauty'] },
            { name: 'MAC', isPopular: true, category: ['beauty'] }
        ],
        commonMaterials: [],
        commonColors: ['nude', 'pink', 'red', 'brown', 'black', 'clear'],
        attributes: [
            { name: 'skin_type', type: 'select', options: ['all', 'dry', 'oily', 'combination', 'sensitive'] },
            { name: 'shade', type: 'text' }
        ],
        searchBoosts: [{ field: 'brand', boost: 1.6 }]
    },
    sports: {
        subcategories: [
            { value: 'activewear', label: 'Activewear', isPopular: true, searchTerms: ['activewear', 'workout', 'athletic'] },
            { value: 'equipment', label: 'Sports Equipment', isPopular: false, searchTerms: ['equipment', 'gear', 'sports'] },
            { value: 'shoes', label: 'Athletic Shoes', isPopular: true, searchTerms: ['sneakers', 'athletic-shoes', 'running'] },
            { value: 'accessories', label: 'Sports Accessories', isPopular: false, searchTerms: ['water-bottle', 'gym-bag', 'gloves'] }
        ],
        sizes: [
            { value: 'XS', label: 'XS', system: 'us', category: 'clothing', order: 1 },
            { value: 'S', label: 'S', system: 'us', category: 'clothing', order: 2 },
            { value: 'M', label: 'M', system: 'us', category: 'clothing', order: 3 },
            { value: 'L', label: 'L', system: 'us', category: 'clothing', order: 4 },
            { value: 'XL', label: 'XL', system: 'us', category: 'clothing', order: 5 },
            { value: 'XXL', label: 'XXL', system: 'us', category: 'clothing', order: 6 }
        ],
        popularBrands: [
            { name: 'Nike', isPopular: true, category: ['sports'] },
            { name: 'Adidas', isPopular: true, category: ['sports'] },
            { name: 'Under Armour', isPopular: true, category: ['sports'] },
            { name: 'Lululemon', isPopular: true, category: ['sports'] }
        ],
        commonMaterials: ['polyester', 'spandex', 'nylon', 'cotton', 'mesh'],
        commonColors: ['black', 'white', 'gray', 'navy', 'red', 'blue'],
        attributes: [
            { name: 'sport', type: 'select', options: ['running', 'yoga', 'gym', 'tennis', 'basketball', 'soccer'] },
            { name: 'performance', type: 'select', options: ['moisture-wicking', 'breathable', 'compression'] }
        ],
        searchBoosts: [{ field: 'brand', boost: 1.5 }]
    }
};
// Utility functions for category configuration
export function getCategoryConfig(category) {
    return FASHION_CATEGORY_CONFIG[category];
}
export function getSubcategories(category) {
    return getCategoryConfig(category).subcategories;
}
export function getSizesForCategory(category, subcategory) {
    const config = getCategoryConfig(category);
    let sizes = config.sizes;
    // Filter sizes based on subcategory if applicable
    if (subcategory === 'shoes') {
        sizes = sizes.filter(size => size.category === 'shoes');
    }
    else if (subcategory && ['clothing', 'tops', 'pants', 'dresses'].includes(subcategory)) {
        sizes = sizes.filter(size => size.category === 'clothing');
    }
    return sizes.sort((a, b) => a.order - b.order);
}
export function getPopularBrandsForCategory(category) {
    return getCategoryConfig(category).popularBrands.filter(brand => brand.isPopular);
}
export function getAttributesForCategory(category) {
    return getCategoryConfig(category).attributes;
}
export function validateCategorySubcategory(category, subcategory) {
    const config = getCategoryConfig(category);
    return config.subcategories.some(sub => sub.value === subcategory);
}
export function getSearchTermsForSubcategory(category, subcategory) {
    const config = getCategoryConfig(category);
    const subCat = config.subcategories.find(sub => sub.value === subcategory);
    return subCat?.searchTerms || [];
}
export function getCategorySearchBoosts(category) {
    return getCategoryConfig(category).searchBoosts;
}
// Export main configuration
export { FASHION_CATEGORY_CONFIG as default };
