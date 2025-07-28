import { useState, useEffect, useCallback, useMemo } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon } from "lucide-react";
import { routeConfigService } from "@/services/routing/RouteConfigService";
import { navigationService } from "@/services/routing/NavigationService";
import { 
  navigationAOP, 
  NavigationContext 
} from "@/services/navigation/NavigationAspects";
import { 
  navigationStateManager, 
  NavigationState,
  ShowDropdownCommand,
  HideDropdownCommand 
} from "@/services/navigation/NavigationStateManager";
import { 
  dropdownLayoutEngine,
  DropdownDimensions 
} from "@/services/navigation/DropdownLayoutEngine";

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
  "Sports & Outdoors": {
    sections: [
      {
        title: "SPORTS",
        items: ["Football", "Basketball", "Baseball", "Soccer"],
        shopAll: "Shop All Sports"
      },
      {
        title: "OUTDOORS", 
        items: ["Camping", "Hiking", "Fishing", "Cycling"],
        shopAll: "Shop All Outdoors"
      },
      {
        title: "ACCESSORIES",
        items: ["Sports Bags", "Outdoor Gear", "Sports Equipment"],
        shopAll: "Shop All Accessories"
      },
      {
        title: "TRENDING STYLES",
        items: ["Active Wear", "Outdoor Gear", "Sports Equipment"],
        shopAll: "Shop All Trending Styles"
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

/**
 * Enterprise Navigation Component with AOP Implementation
 * Uses Command Pattern, Strategy Pattern, and Aspect-Oriented Programming
 */
export function Navigation() {
  // State management using enterprise state manager
  const [navigationState, setNavigationState] = useState<NavigationState>(() => 
    navigationStateManager.getState()
  );
  
  // Layout dimensions from layout engine
  const [layoutDimensions, setLayoutDimensions] = useState<DropdownDimensions | null>(null);

  // Subscribe to navigation state changes
  useEffect(() => {
    const unsubscribe = navigationStateManager.subscribe((newState) => {
      setNavigationState(newState);
    });
    
    return unsubscribe;
  }, []);

  // Memoized navigation handlers with AOP integration
  const handleMouseEnter = useCallback((category: string) => {
    const context: NavigationContext = {
      action: 'hover',
      category,
      timestamp: Date.now(),
      metadata: { viewport: { width: window.innerWidth, height: window.innerHeight } }
    };

    navigationAOP.executeWithAspects(context, () => {
      const command = new ShowDropdownCommand(navigationStateManager, category);
      const success = navigationStateManager.executeCommand(command);
      
      if (success) {
        // Calculate layout for the dropdown
        const layout = dropdownLayoutEngine.getResponsiveLayout(category);
        setLayoutDimensions(layout);
      }
      
      return success;
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    const context: NavigationContext = {
      action: 'leave',
      category: navigationState.activeDropdown || '',
      timestamp: Date.now(),
      metadata: { previousCategory: navigationState.previousDropdown }
    };

    navigationAOP.executeWithAspects(context, () => {
      const command = new HideDropdownCommand(navigationStateManager);
      const success = navigationStateManager.executeCommand(command);
      
      if (success) {
        setLayoutDimensions(null);
      }
      
      return success;
    });
  }, [navigationState.activeDropdown, navigationState.previousDropdown]);

  // Handle viewport resize for responsive layout
  useEffect(() => {
    const handleResize = () => {
      if (navigationState.activeDropdown) {
        const layout = dropdownLayoutEngine.getResponsiveLayout(navigationState.activeDropdown);
        setLayoutDimensions(layout);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [navigationState.activeDropdown]);

  // Memoized dropdown styles based on layout engine calculations
  const dropdownStyles = useMemo(() => {
    if (!layoutDimensions) return {};
    
    return {
      width: `${layoutDimensions.width}px`,
      maxWidth: '100vw', // Ensure it never exceeds viewport
      left: '0', // Always start from the left edge
      transform: 'none', // No centering transform needed
      gridTemplateColumns: `repeat(${layoutDimensions.columns}, 1fr)`,
      gap: `${layoutDimensions.gap}px`,
      padding: `${layoutDimensions.padding.top}px ${layoutDimensions.padding.right}px ${layoutDimensions.padding.bottom}px ${layoutDimensions.padding.left}px`
    };
  }, [layoutDimensions]);

  // Render navigation with enterprise architecture
  return (
    <div className="relative" data-testid="navigation-container">
      <nav 
        className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 sticky top-16 z-40"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center space-x-6 py-3">
            {/* Main Navigation Items */}
            <Link href="/feed">
              <Button 
                variant="ghost" 
                className="text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 font-medium"
                data-testid="nav-feed"
                aria-label="Go to feed"
              >
                Feed
              </Button>
            </Link>
            
            <Link href="/ai-assistant">
              <Button 
                variant="ghost" 
                className="text-sm text-gray-700 dark:text-gray-300 hover:text-purple-600 font-medium"
                data-testid="nav-ai-assistant"
                aria-label="Chat with AI Assistant"
              >
                AI Assistant
              </Button>
            </Link>

            {/* Enterprise-grade category navigation with AOP integration */}
            {Object.keys(navigationData).map((category) => (
              <div 
                key={category}
                className="relative"
                onMouseEnter={() => handleMouseEnter(category)}
                onMouseLeave={handleMouseLeave}
                data-testid={`nav-category-${category.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`}
              >
                {category === 'Women' ? (
                  <Link href="/fashion/women">
                    <Button 
                      variant="ghost" 
                      className={`text-sm font-medium flex items-center gap-1 transition-all duration-200 ${
                        navigationState.activeDropdown === category 
                          ? 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' 
                          : 'text-gray-700 dark:text-gray-300 hover:text-purple-600'
                      } ${navigationState.isTransitioning ? 'opacity-70' : ''}`}
                      data-testid="nav-women"
                      aria-label="Go to women's section"
                      aria-expanded={navigationState.activeDropdown === category}
                    >
                      {category}
                      <ChevronDownIcon 
                        className={`w-3 h-3 transition-transform duration-200 ${
                          navigationState.activeDropdown === category ? 'rotate-180' : ''
                        }`}
                      />
                    </Button>
                  </Link>
                ) : category === 'Men' ? (
                  <Link href="/fashion/men">
                    <Button 
                      variant="ghost" 
                      className={`text-sm font-medium flex items-center gap-1 transition-all duration-200 ${
                        navigationState.activeDropdown === category 
                          ? 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' 
                          : 'text-gray-700 dark:text-gray-300 hover:text-purple-600'
                      } ${navigationState.isTransitioning ? 'opacity-70' : ''}`}
                      data-testid="nav-men"
                      aria-label="Go to men's section"
                      aria-expanded={navigationState.activeDropdown === category}
                      onClick={(e) => {
                        e.stopPropagation();
                        window.location.href = '/fashion/men';
                      }}
                    >
                      {category}
                      <ChevronDownIcon 
                        className={`w-3 h-3 transition-transform duration-200 ${
                          navigationState.activeDropdown === category ? 'rotate-180' : ''
                        }`}
                      />
                    </Button>
                  </Link>
                ) : category === 'Kids' ? (
                  <Link href="/fashion/kids">
                    <Button 
                      variant="ghost" 
                      className={`text-sm font-medium flex items-center gap-1 transition-all duration-200 ${
                        navigationState.activeDropdown === category 
                          ? 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' 
                          : 'text-gray-700 dark:text-gray-300 hover:text-purple-600'
                      } ${navigationState.isTransitioning ? 'opacity-70' : ''}`}
                      data-testid="nav-kids"
                      aria-label="Go to kids' section"
                      aria-expanded={navigationState.activeDropdown === category}
                    >
                      {category}
                      <ChevronDownIcon 
                        className={`w-3 h-3 transition-transform duration-200 ${
                          navigationState.activeDropdown === category ? 'rotate-180' : ''
                        }`}
                      />
                    </Button>
                  </Link>
                ) : category === 'Home' ? (
                  <Link href="/home">
                    <Button 
                      variant="ghost" 
                      className={`text-sm font-medium flex items-center gap-1 transition-all duration-200 ${
                        navigationState.activeDropdown === category 
                          ? 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' 
                          : 'text-gray-700 dark:text-gray-300 hover:text-purple-600'
                      } ${navigationState.isTransitioning ? 'opacity-70' : ''}`}
                      data-testid="nav-home"
                      aria-label="Go to home section"
                      aria-expanded={navigationState.activeDropdown === category}
                    >
                      {category}
                      <ChevronDownIcon 
                        className={`w-3 h-3 transition-transform duration-200 ${
                          navigationState.activeDropdown === category ? 'rotate-180' : ''
                        }`}
                      />
                    </Button>
                  </Link>
                ) : category === 'Electronics' ? (
                  <Link href="/electronics">
                    <Button 
                      variant="ghost" 
                      className={`text-sm font-medium flex items-center gap-1 transition-all duration-200 ${
                        navigationState.activeDropdown === category 
                          ? 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' 
                          : 'text-gray-700 dark:text-gray-300 hover:text-purple-600'
                      } ${navigationState.isTransitioning ? 'opacity-70' : ''}`}
                      data-testid="nav-electronics"
                      aria-label="Go to electronics section"
                      aria-expanded={navigationState.activeDropdown === category}
                    >
                      {category}
                      <ChevronDownIcon 
                        className={`w-3 h-3 transition-transform duration-200 ${
                          navigationState.activeDropdown === category ? 'rotate-180' : ''
                        }`}
                      />
                    </Button>
                  </Link>
                ) : (
                  <Button 
                    variant="ghost" 
                    className={`text-sm font-medium flex items-center gap-1 transition-all duration-200 ${
                      navigationState.activeDropdown === category 
                        ? 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' 
                        : 'text-gray-700 dark:text-gray-300 hover:text-purple-600'
                    } ${navigationState.isTransitioning ? 'opacity-70' : ''}`}
                    data-testid={`nav-${category.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`}
                    aria-label={`Browse ${category.toLowerCase()} section`}
                    aria-expanded={navigationState.activeDropdown === category}
                  >
                    {category}
                    <ChevronDownIcon 
                      className={`w-3 h-3 transition-transform duration-200 ${
                        navigationState.activeDropdown === category ? 'rotate-180' : ''
                      }`}
                    />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </nav>
      
      {/* Enterprise full-width dropdown with layout engine integration */}
      {navigationState.activeDropdown && (
        <div 
          className={`absolute top-full left-0 w-screen bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-xl z-40 transition-all duration-300 ${
            navigationState.isTransitioning ? 'opacity-0 translate-y-[-10px]' : 'opacity-100 translate-y-0'
          }`}
          onMouseEnter={() => handleMouseEnter(navigationState.activeDropdown!)}
          onMouseLeave={handleMouseLeave}
          data-testid={`dropdown-${navigationState.activeDropdown.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`}
          role="menu"
          aria-label={`${navigationState.activeDropdown} navigation menu`}
        >
          <div className="w-full py-8 px-8">
            {navigationState.activeDropdown === 'Brands' ? (
              // Special layout for Brands dropdown
              <div className="grid grid-cols-5 gap-8">
                        <div>
                          <h4 className="text-xs font-bold text-purple-600 uppercase tracking-wide mb-3">WOMEN'S BRANDS</h4>
                          <ul className="space-y-2">
                            {["lululemon athletica", "Coach", "Michael Kors", "Louis Vuitton", "Nike", "Tory Burch", "kate spade", "CHANEL", "Free People", "J. Crew"].map((brand, idx) => (
                              <li key={idx}>
                                <Button variant="ghost" className="text-xs text-gray-600 dark:text-gray-400 hover:text-purple-600 h-auto p-0 font-normal justify-start">
                                  {brand}
                                </Button>
                              </li>
                            ))}
                          </ul>
                          <Button variant="ghost" className="text-xs text-purple-600 hover:text-purple-700 h-auto p-0 font-semibold mt-3">
                            Shop All WOMEN'S BRANDS
                          </Button>
                        </div>
                        
                        <div>
                          <h4 className="text-xs font-bold text-purple-600 uppercase tracking-wide mb-3">MEN'S BRANDS</h4>
                          <ul className="space-y-2">
                            {["Nike", "Gucci", "The North Face", "Banana Republic", "Levi's", "adidas", "True Religion", "J. Crew", "Jordan", "Polo by Ralph Lauren"].map((brand, idx) => (
                              <li key={idx}>
                                <Button variant="ghost" className="text-xs text-gray-600 dark:text-gray-400 hover:text-purple-600 h-auto p-0 font-normal justify-start">
                                  {brand}
                                </Button>
                              </li>
                            ))}
                          </ul>
                          <Button variant="ghost" className="text-xs text-purple-600 hover:text-purple-700 h-auto p-0 font-semibold mt-3">
                            Shop All MEN'S BRANDS
                          </Button>
                        </div>
                        
                        <div>
                          <h4 className="text-xs font-bold text-purple-600 uppercase tracking-wide mb-3">KID'S BRANDS</h4>
                          <ul className="space-y-2">
                            {["Gap", "Carter's", "Nike", "Children's Place", "Gymboree", "OshKosh B'gosh", "Converse", "Ralph Lauren", "Justice", "Old Navy"].map((brand, idx) => (
                              <li key={idx}>
                                <Button variant="ghost" className="text-xs text-gray-600 dark:text-gray-400 hover:text-purple-600 h-auto p-0 font-normal justify-start">
                                  {brand}
                                </Button>
                              </li>
                            ))}
                          </ul>
                          <Button variant="ghost" className="text-xs text-purple-600 hover:text-purple-700 h-auto p-0 font-semibold mt-3">
                            Shop All KID'S BRANDS
                          </Button>
                        </div>
                        
                        <div>
                          <h4 className="text-xs font-bold text-purple-600 uppercase tracking-wide mb-3">HOME BRANDS</h4>
                          <ul className="space-y-2">
                            {["Crate & Barrel", "IKEA", "Jonathan Adler", "Paper Source", "Pier 1", "Pottery Barn", "Restoration Hardware", "Sur La Table", "Target", "The Container Store", "West Elm", "Williams Sonoma", "Z Gallerie"].map((brand, idx) => (
                              <li key={idx}>
                                <Button variant="ghost" className="text-xs text-gray-600 dark:text-gray-400 hover:text-purple-600 h-auto p-0 font-normal justify-start">
                                  {brand}
                                </Button>
                              </li>
                            ))}
                          </ul>
                          <Button variant="ghost" className="text-xs text-purple-600 hover:text-purple-700 h-auto p-0 font-semibold mt-3">
                            Shop All HOME BRANDS
                          </Button>
                        </div>
                        
                        <div>
                          <h4 className="text-xs font-bold text-purple-600 uppercase tracking-wide mb-3">ELECTRONICS BRANDS</h4>
                          <ul className="space-y-2">
                            {["Apple", "Sony", "Microsoft", "Fujifilm", "Google", "Samsung", "Dell", "HP", "Nikon", "Canon"].map((brand, idx) => (
                              <li key={idx}>
                                <Button variant="ghost" className="text-xs text-gray-600 dark:text-gray-400 hover:text-purple-600 h-auto p-0 font-normal justify-start">
                                  {brand}
                                </Button>
                              </li>
                            ))}
                          </ul>
                          <Button variant="ghost" className="text-xs text-purple-600 hover:text-purple-700 h-auto p-0 font-semibold mt-3">
                            Shop All ELECTRONICS BRANDS
                          </Button>
                        </div>
                      </div>
            ) : navigationState.activeDropdown === 'Sports & Outdoors' ? (
              // Special layout for Sports & Outdoors dropdown
              <div className="grid grid-cols-4 gap-8">
                        <div>
                          <h4 className="text-xs font-bold text-purple-600 uppercase tracking-wide mb-3">SPORTS</h4>
                          <ul className="space-y-2">
                            {["Football", "Basketball", "Baseball", "Soccer"].map((sport, idx) => (
                              <li key={idx}>
                                <Button variant="ghost" className="text-xs text-gray-600 dark:text-gray-400 hover:text-purple-600 h-auto p-0 font-normal justify-start">
                                  {sport}
                                </Button>
                              </li>
                            ))}
                          </ul>
                          <Button variant="ghost" className="text-xs text-purple-600 hover:text-purple-700 h-auto p-0 font-semibold mt-3">
                            Shop All SPORTS
                          </Button>
                        </div>
                        
                        <div>
                          <h4 className="text-xs font-bold text-purple-600 uppercase tracking-wide mb-3">OUTDOORS</h4>
                          <ul className="space-y-2">
                            {["Camping", "Hiking", "Fishing", "Cycling"].map((outdoor, idx) => (
                              <li key={idx}>
                                <Button variant="ghost" className="text-xs text-gray-600 dark:text-gray-400 hover:text-purple-600 h-auto p-0 font-normal justify-start">
                                  {outdoor}
                                </Button>
                              </li>
                            ))}
                          </ul>
                          <Button variant="ghost" className="text-xs text-purple-600 hover:text-purple-700 h-auto p-0 font-semibold mt-3">
                            Shop All OUTDOORS
                          </Button>
                        </div>
                        
                        <div>
                          <h4 className="text-xs font-bold text-purple-600 uppercase tracking-wide mb-3">ACCESSORIES</h4>
                          <ul className="space-y-2">
                            {["Sports Bags", "Outdoor Gear", "Sports Equipment"].map((accessory, idx) => (
                              <li key={idx}>
                                <Button variant="ghost" className="text-xs text-gray-600 dark:text-gray-400 hover:text-purple-600 h-auto p-0 font-normal justify-start">
                                  {accessory}
                                </Button>
                              </li>
                            ))}
                          </ul>
                          <Button variant="ghost" className="text-xs text-purple-600 hover:text-purple-700 h-auto p-0 font-semibold mt-3">
                            Shop All ACCESSORIES
                          </Button>
                        </div>
                        
                        <div>
                          <h4 className="text-xs font-bold text-purple-600 uppercase tracking-wide mb-3">TRENDING STYLES</h4>
                          <ul className="space-y-2">
                            {["Active Wear", "Outdoor Gear", "Sports Equipment"].map((trend, idx) => (
                              <li key={idx}>
                                <Button variant="ghost" className="text-xs text-gray-600 dark:text-gray-400 hover:text-purple-600 h-auto p-0 font-normal justify-start">
                                  {trend}
                                </Button>
                              </li>
                            ))}
                          </ul>
                          <Button variant="ghost" className="text-xs text-purple-600 hover:text-purple-700 h-auto p-0 font-semibold mt-3">
                            Shop All TRENDING STYLES
                          </Button>
                        </div>
                      </div>
            ) : (
              // Regular layout for other dropdowns
              <div className="grid grid-cols-4 gap-8">
                        {navigationData[navigationState.activeDropdown as keyof typeof navigationData].sections.map((section, index) => (
                          <div key={index} className="space-y-3">
                            <h3 className="text-xs font-bold text-purple-600 uppercase tracking-wide">
                              {section.title}
                            </h3>
                            <ul className="space-y-2">
                              {section.items.map((item, itemIndex) => (
                                <li key={itemIndex}>
                                  <Link href={navigationService.generateCategoryRoute(navigationState.activeDropdown!, item)}>
                                    <Button 
                                      variant="ghost" 
                                      className="text-xs text-gray-600 dark:text-gray-400 hover:text-purple-600 h-auto p-0 font-normal justify-start transition-colors duration-150"
                                      data-testid={`nav-item-${item.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                                      role="menuitem"
                                    >
                                      {item}
                                    </Button>
                                  </Link>
                                </li>
                              ))}
                            </ul>
                            {section.shopAll && (
                              <Link href={navigationService.generateSectionRoute(section.title, navigationState.activeDropdown!.toLowerCase())}>
                                <Button 
                                  variant="ghost" 
                                  className="text-xs text-purple-600 hover:text-purple-700 h-auto p-0 font-semibold mt-3 transition-colors duration-150"
                                  data-testid={`nav-shop-all-${section.title.toLowerCase().replace(/ /g, '-')}`}
                                  role="menuitem"
                                >
                                  {section.shopAll} →
                                </Button>
                              </Link>
                            )}
                          </div>
            ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}