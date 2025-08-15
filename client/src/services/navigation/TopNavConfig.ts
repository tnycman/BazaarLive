/**
 * Top Navigation Configuration – Single Source of Truth
 *
 * This module defines the complete structure for the top navigation dropdown
 * categories, their sections, and items. All consumers (UI rendering,
 * security allowlist, and any analytics) MUST import from here.
 *
 * Do not duplicate these values elsewhere. Changes to the top nav must
 * happen in this file only.
 */

export type VerticalSlug = 'fashion' | 'home' | 'electronics' | 'pets' | 'beauty' | 'sports' | 'brands';

export interface TopNavItem {
  readonly name: string;
}

export interface TopNavSection {
  readonly title: string;
  readonly items: readonly string[]; // display names, slugging handled by routing services
  readonly shopAll?: string; // display text for the shop-all link
}

export interface TopNavCategory {
  /** UI label shown in the top bar */
  readonly label: string;
  /** Primary vertical this category belongs to (routing context) */
  readonly vertical: VerticalSlug;
  /** True when this label corresponds to a fashion section that needs fashion routing */
  readonly isFashionSection?: boolean;
  /** Optional fashion section id used by FashionRouteService */
  readonly fashionSectionId?: 'women' | 'men' | 'kids';
  /** Dropdown sections for this category */
  readonly sections: readonly TopNavSection[];
}

export const TOP_NAV_CONFIG: readonly TopNavCategory[] = [
  {
    label: 'Women',
    vertical: 'fashion',
    isFashionSection: true,
    fashionSectionId: 'women',
    sections: [
      {
        title: 'ACCESSORIES',
        items: [
          'Belts', 'Face Masks', 'Glasses', 'Gloves & Mittens', 'Hair Accessories',
          'Hats', 'Hosiery & Socks', 'Key & Card Holders', 'Phone Cases',
          'Scarves & Wraps', 'Sunglasses', 'Watches'
        ],
        shopAll: "Shop All Women's Accessories"
      },
      {
        title: 'BAGS',
        items: [
          'Baby Bags', 'Backpacks', 'Clutches & Wristlets', 'Cosmetic Bags & Cases',
          'Crossbody Bags', 'Hobos', 'Laptop Bags', 'Satchels', 'Shoulder Bags',
          'Totes', 'Wallets'
        ],
        shopAll: "Shop All Women's Bags"
      },
      {
        title: 'CLOTHING',
        items: [
          'Dresses', 'Intimates & Sleepwear', 'Jackets & Coats', 'Jeans',
          'Pants & Jumpsuits', 'Shorts', 'Skirts', 'Sweaters', 'Swim', 'Tops'
        ],
        shopAll: "Shop All Women's Clothing"
      },
      {
        title: 'JEWELRY',
        items: [ 'Bracelets', 'Brooches', 'Earrings', 'Necklaces', 'Rings' ],
        shopAll: 'Shop All Jewelry'
      },
      {
        title: 'MAKEUP',
        items: [
          'Blush', 'Bronzer & Contour', 'Brushes & Tools', 'Concealer',
          'Eyeliner', 'Eyeshadow', 'Setting Powder & Spray', 'Foundation',
          'Lip Balm & Gloss', 'Lipstick', 'Mascara'
        ],
        shopAll: 'Shop All Makeup'
      },
      {
        title: 'SHOES',
        items: [
          'Ankle Boots & Booties', 'Athletic Shoes', 'Espadrilles', 'Flats & Loafers',
          'Heels', 'Over the Knee Boots', 'Platforms', 'Sandals', 'Sneakers',
          'Wedges', 'Winter & Rain Boots'
        ],
        shopAll: "Shop All Women's Shoes"
      },
      {
        title: 'TRENDING STYLES',
        items: [
          'New On Running Shoes', 'Denim Vests', 'Set Active Activewear',
          'Still Here Jeans', 'New Gym Bags', 'Greek Letter Shirts',
          'Strapless Tops', 'Satin Tube Tops', 'New White Maxi Dresses'
        ],
        shopAll: 'Shop All Trends'
      }
    ]
  },
  {
    label: 'Men',
    vertical: 'fashion',
    isFashionSection: true,
    fashionSectionId: 'men',
    sections: [
      {
        title: 'ACCESSORIES',
        items: [
          'Belts', 'Cuff Links', 'Face Masks', 'Hats', 'Jewelry', 'Key & Card Holders',
          'Money Clips', 'Phone Cases', 'Scarves', 'Sunglasses', 'Ties', 'Watches'
        ],
        shopAll: "Shop All Men's Accessories"
      },
      {
        title: 'BAGS',
        items: [
          'Backpacks', 'Briefcases', 'Duffel Bags', 'Laptop Bags', 'Luggage & Travel Bags',
          'Messenger Bags', 'Wallets'
        ],
        shopAll: "Shop All Men's Bags"
      },
      {
        title: 'CLOTHING',
        items: [
          'Jackets & Coats', 'Jeans', 'Pants', 'Shirts', 'Shorts', 'Suits & Blazers',
          'Sweaters', 'Swim', 'Underwear & Socks'
        ],
        shopAll: "Shop All Men's Clothing"
      },
      {
        title: 'SHOES',
        items: [
          'Athletic Shoes', 'Boat Shoes', 'Boots', 'Chukka Boots', 'Loafers & Slip-Ons',
          'Oxfords & Derbys', 'Rain & Snow Boots', 'Sandals & Flip-Flops', 'Sneakers'
        ],
        shopAll: "Shop All Men's Shoes"
      },
      {
        title: 'TRENDING STYLES',
        items: [
          'New On Running Shoes', 'Vintage Graphic Crewneck Sweatshirts',
          'Work Performance & Tech Fabrics', 'Wilson Tennis Shirts Under $50',
          'Footjoy Golf Shoes Under $50', 'Designer Trucker Hats',
          'Loose Pleated Trousers', 'Terry Cloth Shorts', 'Og 107 Utility Fatigue Pants'
        ],
        shopAll: 'Shop All Trends'
      }
    ]
  },
  {
    label: 'Kids',
    vertical: 'fashion',
    isFashionSection: true,
    fashionSectionId: 'kids',
    sections: [
      {
        title: 'ACCESSORIES',
        items: [
          'Bags', 'Belts', 'Diaper Covers', 'Face Masks', 'Hair Accessories',
          'Hats', 'Jewelry', 'Mittens', 'Socks & Tights', 'Sunglasses', 'Ties'
        ],
        shopAll: "Shop All Kids' Accessories"
      },
      {
        title: 'CLOTHING',
        items: [
          'Accessories', 'Bottoms', 'Dresses', 'Jackets & Coats', 'Matching Sets',
          'One Pieces', 'Pajamas', 'Shirts & Tops', 'Swim'
        ],
        shopAll: "Shop All Kids' Clothing"
      },
      {
        title: 'SHOES',
        items: [
          'Baby & Walker', 'Boots', 'Dress Shoes', 'Moccasins', 'Rain & Snow Boots',
          'Sandals & Flip-Flops', 'Slippers', 'Sneakers', 'Water Shoes'
        ],
        shopAll: "Shop All Kids' Shoes"
      },
      {
        title: 'TOYS',
        items: [
          'Action Figures & Playsets', 'Building Sets & Blocks', 'Cars & Vehicles',
          'Dolls & Accessories', 'Learning Toys', 'Puzzles & Games', 'Stuffed Animals',
          'Trading Cards'
        ],
        shopAll: "Shop All Kids' Toys"
      },
      {
        title: 'TRENDING STYLES',
        items: [
          'New On Running Shoes', 'Peel Lem Dresses', 'Striped Sweater Vests',
          'New White Maxi Dresses', 'New Alice Running Shoes', 'Scarf Crop Tops',
          'Relaxed Dress Pants', 'New Cropped Trench Coats', 'Printed Maxi Skirts Under $50'
        ],
        shopAll: 'Shop All Trends'
      }
    ]
  },
  {
    label: 'Home',
    vertical: 'home',
    sections: [
      {
        title: 'ACCENTS',
        items: [
          'Accent Pillows', 'Baskets & Bins', 'Candles & Holders', 'Coffee Table Books',
          'Curtains & Drapes', 'Decor', 'Door Mats', 'Lamps & Lighting',
          'Furniture Covers', 'Lanterns', 'Picture Frames', 'Vases'
        ],
        shopAll: 'Shop All Home Accents'
      },
      {
        title: 'BATH',
        items: [
          'Bath Accessories', 'Bath Storage', 'Bath Towels', 'Beach Towels',
          'Hand Towels', 'Mats', 'Shower Curtains', 'Vanity Trays', 'Wash Cloths'
        ],
        shopAll: 'Shop All Home Bath'
      },
      {
        title: 'BEDDING',
        items: [
          'Blankets & Throws', 'Comforters', 'Duvet Covers', 'Mattress Covers',
          'Pillows', 'Quilts', 'Sheets'
        ],
        shopAll: 'Shop All Home Bedding'
      },
      {
        title: 'DINING',
        items: [
          'Bar Accessories', 'Dinnerware', 'Drinkware', 'Flatware', 'Serveware',
          'Serving Utensils', 'Table Linens', 'Tablecloths & Placemats'
        ],
        shopAll: 'Shop All Home Dining'
      },
      {
        title: 'HOLIDAY',
        items: [
          'Garland', 'Holiday Blankets & Throws', 'Holiday Decor', 'Holiday Pillows',
          'Ornaments', 'String Lights', 'Wreaths'
        ],
        shopAll: 'Shop All Home Holiday'
      },
      {
        title: 'KITCHEN',
        items: [
          'Bakeware', 'Coffee & Tea Accessories', 'Cookbooks', 'Cooking Utensils',
          'Cookware', 'Food Storage', 'Kitchen Linens', 'Kitchen Tools',
          'Knives & Cutlery'
        ],
        shopAll: 'Shop All Home Kitchen'
      }
    ]
  },
  {
    label: 'Electronics',
    vertical: 'electronics',
    sections: [
      {
        title: 'CAMERA, PHOTO & VIDEO',
        items: [
          'Digital Cameras', 'Bags & Cases', 'Binoculars & Scopes', 'Camera Lenses',
          'Film Photography', 'Flashes', 'Lenses', 'Memory Cards', 'Specialized Cameras',
          'Tripods & Monopods', 'Underwater Photography', 'Video'
        ],
        shopAll: 'Shop All Electronics Cameras'
      },
      {
        title: 'CELL PHONES & ACCESSORIES',
        items: [
          'Cell Phones', 'Headsets & Clips', 'Screen Protectors', 'Cases',
          'Cables & Adapters', 'Power Adapters', 'Wireless Chargers'
        ],
        shopAll: 'Shop All Electronics Cell Phones'
      },
      {
        title: 'COMPUTERS, LAPTOPS & PARTS',
        items: [
          'Cables & Interconnects', 'Laptops', 'Computer Headsets', 'Computer Microphones',
          'Single Board Computers', 'Graphics Cards', 'Keyboards', 'Memory Card Readers',
          'Mice'
        ],
        shopAll: 'Shop All Electronics Computers'
      },
      {
        title: 'TABLETS & ACCESSORIES',
        items: [ 'Tablets', 'Power Cables', 'Tablet Keyboards', 'Screen Protectors', 'Skins' ],
        shopAll: 'Shop All Electronics Tablets'
      },
      {
        title: 'VIDEO GAMES & CONSOLES',
        items: [
          'Consoles', 'Handheld Consoles', 'Nintendo Switch', 'Controllers',
          'Headphones', 'Gaming Guides', 'Digital Games', 'PC Games', 'Video Games'
        ],
        shopAll: 'Shop All Electronics Video Games'
      }
    ]
  },
  {
    label: 'Pets',
    vertical: 'pets',
    sections: [
      {
        title: 'BIRD',
        items: [ 'Cages & Covers', 'Feeders & Waterers', 'Perches & Swings', 'Toys' ],
        shopAll: 'Shop All Pets Bird'
      },
      {
        title: 'CAT',
        items: [
          'Beds', 'Bowls & Feeders', 'Carriers & Travel', 'Clothing & Accessories',
          'Collars, Leashes & Harnesses', 'Grooming', 'Scratchers', 'Toys'
        ],
        shopAll: 'Shop All Pets Cat'
      },
      {
        title: 'DOG',
        items: [
          'Bedding & Blankets', 'Bowls & Feeders', 'Carriers & Travel',
          'Clothing & Accessories', 'Collars, Leashes & Harnesses', 'Grooming',
          'Housebreaking'
        ],
        shopAll: 'Shop All Pets Dog'
      },
      {
        title: 'FISH',
        items: [ 'Aquarium Kits', 'Cleaning & Maintenance', 'Decor & Accessories', 'Heating & Lights' ],
        shopAll: 'Shop All Pets Fish'
      },
      {
        title: 'REPTILE',
        items: [ 'Cleaning & Maintenance', 'Habitats', 'Habitat Accessories', 'Heating & Lights' ],
        shopAll: 'Shop All Pets Reptile'
      },
      {
        title: 'SMALL PETS',
        items: [
          'Bedding', 'Bowls & Feeders', 'Cages & Habitats', 'Carriers', 'Grooming',
          'Habitat Accessories', 'Toys'
        ],
        shopAll: 'Shop All Pets Small Pets'
      }
    ]
  },
  {
    label: 'Beauty & Wellness',
    vertical: 'beauty',
    sections: [
      {
        title: 'SKINCARE',
        items: [ 'Bath & Body', 'Hair', 'Skincare', 'Makeup' ],
        shopAll: "Shop All Women's Beauty & Wellness"
      },
      {
        title: 'MEN',
        items: [ 'Grooming' ],
        shopAll: "Shop All Men's Grooming"
      },
      {
        title: 'KIDS',
        items: [ 'Bath, Skin & Hair' ],
        shopAll: "Shop All Kids' Bath, Skin & Hair"
      },
      {
        title: 'TRENDING STYLES',
        items: [
          'Wrestling Action Makeup', 'Glossier Makeup', 'Boy Makeup', 'Drunk Elephant Moisturizers',
          'Crystal Face & Body Stickers', 'Fenty Beauty', 'Rare Beauty Makeup',
          'Kosas Makeup', 'Haus Beauty Makeup'
        ],
        shopAll: 'Shop All Trends'
      }
    ]
  },
  {
    label: 'Sports & Outdoors',
    vertical: 'sports',
    sections: [
      {
        title: 'SPORTS',
        items: [ 'Football', 'Basketball', 'Baseball', 'Soccer' ],
        shopAll: 'Shop All Sports'
      },
      {
        title: 'OUTDOORS',
        items: [ 'Camping', 'Hiking', 'Fishing', 'Cycling' ],
        shopAll: 'Shop All Outdoors'
      },
      {
        title: 'ACCESSORIES',
        items: [ 'Sports Bags', 'Outdoor Gear', 'Sports Equipment' ],
        shopAll: 'Shop All Accessories'
      },
      {
        title: 'TRENDING STYLES',
        items: [ 'Active Wear', 'Outdoor Gear', 'Sports Equipment' ],
        shopAll: 'Shop All Trending Styles'
      }
    ]
  },
  {
    label: 'Brands',
    vertical: 'brands',
    sections: [
      {
        title: "WOMEN'S BRANDS",
        items: [
          'lululemon athletica', 'Coach', 'Michael Kors', 'Louis Vuitton', 'Nike',
          'Tory Burch', 'kate spade', 'CHANEL', 'Free People', 'J. Crew'
        ]
      },
      {
        title: "MEN'S BRANDS",
        items: [
          'Nike', 'Gucci', 'The North Face', 'Banana Republic', 'Levi\'s', 'adidas',
          'True Religion', 'J. Crew', 'Jordan', 'Polo by Ralph Lauren'
        ]
      },
      {
        title: "KID'S BRANDS",
        items: [
          'Gap', 'Carter\'s', 'Nike', 'Children\'s Place', 'Gymboree', "OshKosh B'gosh",
          'Converse', 'Ralph Lauren', 'Justice', 'Old Navy'
        ]
      },
      {
        title: 'HOME BRANDS',
        items: [
          'Crate & Barrel', 'IKEA', 'Jonathan Adler', 'Paper Source', 'Pier 1',
          'Pottery Barn', 'Restoration Hardware', 'Sur La Table', 'Target',
          'The Container Store', 'West Elm', 'Williams Sonoma', 'Z Gallerie'
        ]
      },
      {
        title: 'ELECTRONICS BRANDS',
        items: [
          'Apple', 'Sony', 'Microsoft', 'Fujifilm', 'Google', 'Samsung', 'Dell', 'HP', 'Nikon', 'Canon'
        ]
      }
    ]
  }
];

export const ALLOWED_CATEGORY_LABELS: ReadonlySet<string> = new Set(
  TOP_NAV_CONFIG.map(c => c.label)
);




