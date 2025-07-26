import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon } from "lucide-react";

const navigationData = {
  Women: {
    sections: [
      {
        title: "ACCESSORIES",
        items: [
          "Belts", "Face Masks", "Glasses", "Gloves & Mittens", "Hair Accessories", 
          "Hats", "Hosiery & Socks", "Key & Card Holders", "Phone Cases", 
          "Scarves & Wraps", "Sunglasses", "Watches"
        ],
        shopAll: "Shop All Women's Accessories"
      },
      {
        title: "BAGS",
        items: [
          "Baby Bags", "Backpacks", "Clutches & Wristlets", "Cosmetic Bags & Cases",
          "Crossbody Bags", "Hobos", "Laptop Bags", "Satchels", "Shoulder Bags",
          "Totes", "Wallets"
        ],
        shopAll: "Shop All Women's Bags"
      },
      {
        title: "CLOTHING",
        items: [
          "Dresses", "Intimates & Sleepwear", "Jackets & Coats", "Jeans",
          "Pants & Jumpsuits", "Shorts", "Skirts", "Sweaters", "Swim", "Tops"
        ],
        shopAll: "Shop All Women's Clothing"
      },
      {
        title: "JEWELRY",
        items: [
          "Bracelets", "Brooches", "Earrings", "Necklaces", "Rings"
        ],
        shopAll: "Shop All Jewelry"
      },
      {
        title: "MAKEUP",
        items: [
          "Blush", "Bronzer & Contour", "Brushes & Tools", "Concealer",
          "Eyeliner", "Eyeshadow", "Setting Powder & Spray", "Foundation",
          "Lip Balm & Gloss", "Lipstick", "Mascara"
        ],
        shopAll: "Shop All Makeup"
      },
      {
        title: "SHOES",
        items: [
          "Ankle Boots & Booties", "Athletic Shoes", "Espadrilles", "Flats & Loafers",
          "Heels", "Over the Knee Boots", "Platforms", "Sandals", "Sneakers",
          "Wedges", "Winter & Rain Boots"
        ],
        shopAll: "Shop All Women's Shoes"
      },
      {
        title: "TRENDING STYLES",
        items: [
          "New On Running Shoes", "Denim Vests", "Set Active Activewear",
          "Still Here Jeans", "New Gym Bags", "Greek Letter Shirts",
          "Strapless Tops", "Satin Tube Tops", "New White Maxi Dresses"
        ],
        shopAll: "Shop All Trends"
      }
    ]
  },
  Men: {
    sections: [
      {
        title: "ACCESSORIES",
        items: [
          "Belts", "Cuff Links", "Face Masks", "Hats", "Jewelry", "Key & Card Holders",
          "Money Clips", "Phone Cases", "Scarves", "Sunglasses", "Ties", "Watches"
        ],
        shopAll: "Shop All Men's Accessories"
      },
      {
        title: "BAGS",
        items: [
          "Backpacks", "Briefcases", "Duffel Bags", "Laptop Bags", "Luggage & Travel Bags",
          "Messenger Bags", "Wallets"
        ],
        shopAll: "Shop All Men's Bags"
      },
      {
        title: "CLOTHING",
        items: [
          "Jackets & Coats", "Jeans", "Pants", "Shirts", "Shorts", "Suits & Blazers",
          "Sweaters", "Swim", "Underwear & Socks"
        ],
        shopAll: "Shop All Men's Clothing"
      },
      {
        title: "SHOES",
        items: [
          "Athletic Shoes", "Boat Shoes", "Boots", "Chukka Boots", "Loafers & Slip-Ons",
          "Oxfords & Derbys", "Rain & Snow Boots", "Sandals & Flip-Flops", "Sneakers"
        ],
        shopAll: "Shop All Men's Shoes"
      },
      {
        title: "TRENDING STYLES",
        items: [
          "New On Running Shoes", "Vintage Graphic Crewneck Sweatshirts",
          "Work Performance & Tech Fabrics", "Wilson Tennis Shirts Under $50",
          "Footjoy Golf Shoes Under $50", "Designer Trucker Hats",
          "Loose Pleated Trousers", "Terry Cloth Shorts", "Og 107 Utility Fatigue Pants"
        ],
        shopAll: "Shop All Trends"
      }
    ]
  },
  Kids: {
    sections: [
      {
        title: "ACCESSORIES",
        items: [
          "Bags", "Belts", "Diaper Covers", "Face Masks", "Hair Accessories",
          "Hats", "Jewelry", "Mittens", "Socks & Tights", "Sunglasses", "Ties"
        ],
        shopAll: "Shop All Kids' Accessories"
      },
      {
        title: "CLOTHING",
        items: [
          "Accessories", "Bottoms", "Dresses", "Jackets & Coats", "Matching Sets",
          "One Pieces", "Pajamas", "Shirts & Tops", "Swim"
        ],
        shopAll: "Shop All Kids' Clothing"
      },
      {
        title: "SHOES",
        items: [
          "Baby & Walker", "Boots", "Dress Shoes", "Moccasins", "Rain & Snow Boots",
          "Sandals & Flip-Flops", "Slippers", "Sneakers", "Water Shoes"
        ],
        shopAll: "Shop All Kids' Shoes"
      },
      {
        title: "TOYS",
        items: [
          "Action Figures & Playsets", "Building Sets & Blocks", "Cars & Vehicles",
          "Dolls & Accessories", "Learning Toys", "Puzzles & Games", "Stuffed Animals",
          "Trading Cards"
        ],
        shopAll: "Shop All Kids' Toys"
      },
      {
        title: "TRENDING STYLES",
        items: [
          "New On Running Shoes", "Peel Lem Dresses", "Striped Sweater Vests",
          "New White Maxi Dresses", "New Alice Running Shoes", "Scarf Crop Tops",
          "Relaxed Dress Pants", "New Cropped Trench Coats", "Printed Maxi Skirts Under $50"
        ],
        shopAll: "Shop All Trends"
      }
    ]
  },
  Home: {
    sections: [
      {
        title: "ACCENTS",
        items: [
          "Accent Pillows", "Baskets & Bins", "Candles & Holders", "Coffee Table Books",
          "Curtains & Drapes", "Decor", "Door Mats", "Lamps & Lighting",
          "Furniture Covers", "Lanterns", "Picture Frames", "Vases"
        ],
        shopAll: "Shop All Home Accents"
      },
      {
        title: "BATH",
        items: [
          "Bath Accessories", "Bath Storage", "Bath Towels", "Beach Towels",
          "Hand Towels", "Mats", "Shower Curtains", "Vanity Trays", "Wash Cloths"
        ],
        shopAll: "Shop All Home Bath"
      },
      {
        title: "BEDDING",
        items: [
          "Blankets & Throws", "Comforters", "Duvet Covers", "Mattress Covers",
          "Pillows", "Quilts", "Sheets"
        ],
        shopAll: "Shop All Home Bedding"
      },
      {
        title: "DINING",
        items: [
          "Bar Accessories", "Dinnerware", "Drinkware", "Flatware", "Serveware",
          "Serving Utensils", "Table Linens", "Tablecloths & Placemats"
        ],
        shopAll: "Shop All Home Dining"
      },
      {
        title: "HOLIDAY",
        items: [
          "Garland", "Holiday Blankets & Throws", "Holiday Decor", "Holiday Pillows",
          "Ornaments", "String Lights", "Wreaths"
        ],
        shopAll: "Shop All Home Holiday"
      },
      {
        title: "KITCHEN",
        items: [
          "Bakeware", "Coffee & Tea Accessories", "Cookbooks", "Cooking Utensils",
          "Cookware", "Food Storage", "Kitchen Linens", "Kitchen Tools",
          "Knives & Cutlery"
        ],
        shopAll: "Shop All Home Kitchen"
      }
    ]
  },
  Electronics: {
    sections: [
      {
        title: "CAMERA, PHOTO & VIDEO",
        items: [
          "Digital Cameras", "Bags & Cases", "Binoculars & Scopes", "Camera Lenses",
          "Film Photography", "Flashes", "Lenses", "Memory Cards", "Specialized Cameras",
          "Tripods & Monopods", "Underwater Photography", "Video"
        ],
        shopAll: "Shop All Electronics Cameras"
      },
      {
        title: "CELL PHONES & ACCESSORIES",
        items: [
          "Cell Phones", "Headsets & Clips", "Screen Protectors", "Cases",
          "Cables & Adapters", "Power Adapters", "Wireless Chargers"
        ],
        shopAll: "Shop All Electronics Cell Phones"
      },
      {
        title: "COMPUTERS, LAPTOPS & PARTS",
        items: [
          "Cables & Interconnects", "Laptops", "Computer Headsets", "Computer Microphones",
          "Single Board Computers", "Graphics Cards", "Keyboards", "Memory Card Readers",
          "Mice"
        ],
        shopAll: "Shop All Electronics Computers"
      },
      {
        title: "TABLETS & ACCESSORIES",
        items: [
          "Tablets", "Power Cables", "Tablet Keyboards", "Screen Protectors", "Skins"
        ],
        shopAll: "Shop All Electronics Tablets"
      },
      {
        title: "VIDEO GAMES & CONSOLES",
        items: [
          "Consoles", "Handheld Consoles", "Nintendo Switch", "Controllers",
          "Headphones", "Gaming Guides", "Digital Games", "PC Games", "Video Games"
        ],
        shopAll: "Shop All Electronics Video Games"
      }
    ]
  },
  Pets: {
    sections: [
      {
        title: "BIRD",
        items: [
          "Cages & Covers", "Feeders & Waterers", "Perches & Swings", "Toys"
        ],
        shopAll: "Shop All Pets Bird"
      },
      {
        title: "CAT",
        items: [
          "Beds", "Bowls & Feeders", "Carriers & Travel", "Clothing & Accessories",
          "Collars, Leashes & Harnesses", "Grooming", "Scratchers", "Toys"
        ],
        shopAll: "Shop All Pets Cat"
      },
      {
        title: "DOG",
        items: [
          "Bedding & Blankets", "Bowls & Feeders", "Carriers & Travel",
          "Clothing & Accessories", "Collars, Leashes & Harnesses", "Grooming",
          "Housebreaking"
        ],
        shopAll: "Shop All Pets Dog"
      },
      {
        title: "FISH",
        items: [
          "Aquarium Kits", "Cleaning & Maintenance", "Decor & Accessories",
          "Heating & Lights"
        ],
        shopAll: "Shop All Pets Fish"
      },
      {
        title: "REPTILE",
        items: [
          "Cleaning & Maintenance", "Habitats", "Habitat Accessories", "Heating & Lights"
        ],
        shopAll: "Shop All Pets Reptile"
      },
      {
        title: "SMALL PETS",
        items: [
          "Bedding", "Bowls & Feeders", "Cages & Habitats", "Carriers", "Grooming",
          "Habitat Accessories", "Toys"
        ],
        shopAll: "Shop All Pets Small Pets"
      }
    ]
  },
  "Beauty & Wellness": {
    sections: [
      {
        title: "SKINCARE",
        items: [
          "Bath & Body", "Hair", "Skincare", "Makeup"
        ],
        shopAll: "Shop All Women's Beauty & Wellness"
      },
      {
        title: "MEN",
        items: [
          "Grooming"
        ],
        shopAll: "Shop All Men's Grooming"
      },
      {
        title: "KIDS",
        items: [
          "Bath, Skin & Hair"
        ],
        shopAll: "Shop All Kids' Bath, Skin & Hair"
      },
      {
        title: "TRENDING STYLES",
        items: [
          "Wrestling Action Makeup", "Glossier Makeup", "Boy Makeup", "Drunk Elephant Moisturizers",
          "Crystal Face & Body Stickers", "Fenty Beauty", "Rare Beauty Makeup",
          "Kosas Makeup", "Haus Beauty Makeup"
        ],
        shopAll: "Shop All Trends"
      }
    ]
  },
  Brands: {
    sections: [
      {
        title: "WOMEN'S BRANDS",
        items: [
          "lululemon athletica", "Coach", "Michael Kors", "Louis Vuitton", "Nike",
          "Tory Burch", "kate spade", "CHANEL", "Free People"
        ],
        shopAll: "Shop All Women's Brands"
      },
      {
        title: "MEN'S BRANDS",
        items: [
          "Nike", "Gucci", "The North Face", "Banana Republic", "Levi's", "adidas",
          "True Religion", "J. Crew", "Jordan", "Polo by Ralph Lauren"
        ],
        shopAll: "Shop All Men's Brands"
      },
      {
        title: "KID'S BRANDS",
        items: [
          "Gap", "Carter's", "Nike", "Children's Place", "Gymboree", "OshKosh B'gosh",
          "Converse", "Ralph Lauren", "Justice", "Old Navy"
        ],
        shopAll: "Shop All Kids' Brands"
      },
      {
        title: "HOME BRANDS",
        items: [
          "Crate&Barrel", "IKEA", "Jonathan Adler", "Paper Source", "Pier 1",
          "Pottery Barn", "Restoration Hardware", "Sur La Table", "Target",
          "The Pioneer Woman Store", "West Elm", "Williams Sonoma", "Z Gallerie"
        ],
        shopAll: "Shop All Home Brands"
      },
      {
        title: "ELECTRONICS BRANDS",
        items: [
          "Apple", "Sony", "Microsoft", "Fujifilm", "google", "Samsung", "GE",
          "HP", "LG", "Canon"
        ],
        shopAll: "Shop All Electronics Brands"
      }
    ]
  }
};

export function Navigation() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const handleMouseEnter = (category: string) => {
    setActiveDropdown(category);
  };

  const handleMouseLeave = () => {
    setActiveDropdown(null);
  };

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-16 z-40">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center space-x-8 py-3">
          {/* POSH MARKETS - All */}
          <div className="relative">
            <Button 
              variant="ghost" 
              className="text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 font-medium flex items-center gap-1"
              data-testid="nav-all-markets"
            >
              <div className="text-xs text-purple-600 font-bold">POSH MARKETS</div>
              <div className="ml-1">All</div>
              <ChevronDownIcon className="w-3 h-3" />
            </Button>
          </div>

          {/* Main Navigation Items */}
          <Link href="/feed">
            <Button 
              variant="ghost" 
              className="text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 font-medium"
              data-testid="nav-feed"
            >
              Feed
            </Button>
          </Link>

          {Object.keys(navigationData).map((category) => (
            <div 
              key={category}
              className="relative"
              onMouseEnter={() => handleMouseEnter(category)}
              onMouseLeave={handleMouseLeave}
            >
              <Button 
                variant="ghost" 
                className="text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 font-medium flex items-center gap-1"
                data-testid={`nav-${category.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`}
              >
                {category}
                <ChevronDownIcon className="w-3 h-3" />
              </Button>

              {/* Dropdown Menu */}
              {activeDropdown === category && (
                <div className="absolute top-full left-0 w-screen max-w-5xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl z-50 -ml-32">
                  <div className="p-8">
                    <div className="grid grid-cols-4 gap-8">
                      {navigationData[category as keyof typeof navigationData].sections.map((section, index) => (
                        <div key={index} className="space-y-3">
                          <h3 className="text-xs font-bold text-purple-600 uppercase tracking-wide">
                            {section.title}
                          </h3>
                          <ul className="space-y-2">
                            {section.items.map((item, itemIndex) => (
                              <li key={itemIndex}>
                                <Link href={`/marketplace?category=${encodeURIComponent(item)}`}>
                                  <Button 
                                    variant="ghost" 
                                    className="text-xs text-gray-600 dark:text-gray-400 hover:text-purple-600 h-auto p-0 font-normal justify-start"
                                    data-testid={`nav-item-${item.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                                  >
                                    {item}
                                  </Button>
                                </Link>
                              </li>
                            ))}
                          </ul>
                          {section.shopAll && (
                            <Link href={`/marketplace?section=${encodeURIComponent(section.title)}`}>
                              <Button 
                                variant="ghost" 
                                className="text-xs text-purple-600 hover:text-purple-700 h-auto p-0 font-semibold mt-3"
                                data-testid={`nav-shop-all-${section.title.toLowerCase().replace(/ /g, '-')}`}
                              >
                                {section.shopAll} →
                              </Button>
                            </Link>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Additional Navigation Items */}
          <Link href="/parties">
            <Button 
              variant="ghost" 
              className="text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 font-medium"
              data-testid="nav-parties"
            >
              Parties
            </Button>
          </Link>

          <Link href="/posh-shows">
            <Button 
              variant="ghost" 
              className="text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 font-medium"
              data-testid="nav-posh-shows"
            >
              Posh Shows
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}