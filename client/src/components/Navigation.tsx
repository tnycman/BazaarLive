import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronDownIcon } from "lucide-react";
import { navigationService } from "@/services/routing/NavigationService";
import { fashionRouteService } from "@/services/routing/FashionRouteService";
import { slugify } from "@/services/routing/RouteUtils";
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
import { TOP_NAV_CONFIG } from "@/services/navigation/TopNavConfig";
import { unifiedCategoryRoutingService, type CategoryLabel } from "@/services/routing/UnifiedCategoryRoutingService";



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
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const feedRef = useRef<HTMLButtonElement | null>(null);

  // Subscribe to navigation state changes
  useEffect(() => {
    const unsubscribe = navigationStateManager.subscribe((newState) => {
      setNavigationState(newState);
    });
    
    return unsubscribe;
  }, []);

  // Memoized navigation handlers with AOP integration
  const handleMouseEnter = useCallback((category: string) => {
    // Hover-intent: small delay before opening to prevent accidental flicker
    const open = () => {
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
          const feedLeft = feedRef.current?.getBoundingClientRect()?.left;
          const layout = typeof feedLeft === 'number'
            ? dropdownLayoutEngine.getAnchoredLayout(category, feedLeft)
            : dropdownLayoutEngine.getResponsiveLayout(category);
          setLayoutDimensions(layout);
        }
        
        return success;
      });
    };

    window.clearTimeout((handleMouseEnter as any)._timer);
    (handleMouseEnter as any)._timer = window.setTimeout(open, 75);
  }, []);

  const handleMouseLeave = useCallback(() => {
    // Hover-intent: slight delay on close to allow cursor travel
    const close = () => {
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
    };
    window.clearTimeout((handleMouseEnter as any)._timer);
    window.clearTimeout((handleMouseLeave as any)._timer);
    (handleMouseLeave as any)._timer = window.setTimeout(close, 120);
  }, [navigationState.activeDropdown, navigationState.previousDropdown]);

  // Close only when pointer leaves the combined trigger + dropdown region
  const handleMouseLeaveRegion = useCallback((event: React.MouseEvent) => {
    const nextTarget = event.relatedTarget as Node | null;
    if (containerRef.current && nextTarget && containerRef.current.contains(nextTarget)) {
      return;
    }

    const close = () => {
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
    };

    window.clearTimeout((handleMouseEnter as any)._timer);
    window.clearTimeout((handleMouseLeaveRegion as any)._timer);
    (handleMouseLeaveRegion as any)._timer = window.setTimeout(close, 120);
  }, [navigationState.activeDropdown, navigationState.previousDropdown]);

  

  // Focus management: when dropdown opens, move focus to first item
  useEffect(() => {
    if (navigationState.activeDropdown && dropdownRef.current) {
      const items = dropdownRef.current.querySelectorAll<HTMLButtonElement>('button[role="menuitem"]');
      if (items.length > 0) {
        items[0].focus();
      }
    }
  }, [navigationState.activeDropdown]);

  const handleDropdownKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!dropdownRef.current) return;

    const currentEl = document.activeElement as HTMLElement | null;
    const currentSection = currentEl?.closest('[data-nav-section]') as HTMLElement | null;
    const sectionItems = currentSection
      ? Array.from(currentSection.querySelectorAll<HTMLButtonElement>('button[role="menuitem"]'))
      : [];

    const allSections = Array.from(dropdownRef.current.querySelectorAll<HTMLElement>('[data-nav-section]'));
    const sectionIndex = currentSection ? allSections.indexOf(currentSection) : -1;
    const itemIndex = sectionItems.findIndex((el) => el === currentEl);

    const focusItem = (container: HTMLElement, index: number) => {
      const items = Array.from(container.querySelectorAll<HTMLButtonElement>('button[role="menuitem"]'));
      if (items.length === 0) return;
      const clamped = Math.max(0, Math.min(index, items.length - 1));
      items[clamped]?.focus();
    };

    switch (event.key) {
      case 'ArrowDown': {
        if (sectionItems.length === 0) return;
        event.preventDefault();
        const next = itemIndex >= 0 ? itemIndex + 1 : 0;
        const targetIndex = next >= sectionItems.length ? sectionItems.length - 1 : next;
        sectionItems[targetIndex]?.focus();
        break;
      }
      case 'ArrowUp': {
        if (sectionItems.length === 0) return;
        event.preventDefault();
        const prev = itemIndex >= 0 ? itemIndex - 1 : sectionItems.length - 1;
        const targetIndex = prev < 0 ? 0 : prev;
        sectionItems[targetIndex]?.focus();
        break;
      }
      case 'ArrowRight': {
        if (sectionIndex < 0) return;
        event.preventDefault();
        const nextSection = allSections[sectionIndex + 1];
        if (nextSection) {
          focusItem(nextSection, Math.max(0, itemIndex));
        }
        break;
      }
      case 'ArrowLeft': {
        if (sectionIndex < 0) return;
        event.preventDefault();
        const prevSection = allSections[sectionIndex - 1];
        if (prevSection) {
          focusItem(prevSection, Math.max(0, itemIndex));
        }
        break;
      }
      case 'Home': {
        if (!currentSection) return;
        event.preventDefault();
        focusItem(currentSection, 0);
        break;
      }
      case 'End': {
        if (!currentSection) return;
        event.preventDefault();
        const items = Array.from(currentSection.querySelectorAll<HTMLButtonElement>('button[role="menuitem"]'));
        focusItem(currentSection, items.length - 1);
        break;
      }
      case 'Escape': {
        event.preventDefault();
        const current = navigationState.activeDropdown;
        handleMouseLeave();
        if (current) {
          triggerRefs.current[current]?.focus();
        }
        break;
      }
      default:
        break;
    }
  }, [handleMouseLeave, navigationState.activeDropdown]);

  // Handle viewport resize for responsive layout
  useEffect(() => {
    const handleResize = () => {
      if (navigationState.activeDropdown) {
        const feedLeft = feedRef.current?.getBoundingClientRect()?.left;
        const layout = typeof feedLeft === 'number'
          ? dropdownLayoutEngine.getAnchoredLayout(navigationState.activeDropdown, feedLeft)
          : dropdownLayoutEngine.getResponsiveLayout(navigationState.activeDropdown);
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
      maxWidth: '100vw',
      marginLeft: `${layoutDimensions.offsetLeft}px`,
      gridTemplateColumns: `repeat(${layoutDimensions.columns}, 1fr)`,
      gap: `${layoutDimensions.gap}px`,
      padding: `${layoutDimensions.padding.top}px ${layoutDimensions.padding.right}px ${layoutDimensions.padding.bottom}px ${layoutDimensions.padding.left}px`
    };
  }, [layoutDimensions]);

  // Resolve active category config safely to avoid undefined access
  const activeCategoryConfig = useMemo(() => {
    if (!navigationState.activeDropdown) return undefined;
    return TOP_NAV_CONFIG.find((config) => config.label === navigationState.activeDropdown);
  }, [navigationState.activeDropdown]);

  const handleKeyDownTrigger = useCallback((event: React.KeyboardEvent, category: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleMouseEnter(category);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      handleMouseLeave();
    }
  }, [handleMouseEnter, handleMouseLeave]);

  // Render navigation with enterprise architecture
  return (
    <div className="relative" data-testid="navigation-container" ref={containerRef} onMouseLeave={handleMouseLeaveRegion}>
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
                ref={feedRef}
              >
                Feed
              </Button>
            </Link>

            {/* Enterprise-grade category navigation with unified routing */}
            {TOP_NAV_CONFIG.map((categoryConfig) => {
              const category = categoryConfig.label;
              // Skip Brands as it has special handling
              if (category === 'Brands') {
                return (
                  <div 
                    key={category}
                    className="relative"
                    onMouseEnter={() => handleMouseEnter(category)}
                    data-testid={`nav-category-${category.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`}
                  >
                    <Link href={navigationService.generateBrandIndexRoute()}>
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
                        aria-haspopup="menu"
                        aria-controls={`dropdown-${slugify(category)}`}
                        onKeyDown={(e) => handleKeyDownTrigger(e, category)}
                        ref={(el) => { triggerRefs.current[category] = el; }}
                      >
                        {category}
                        <ChevronDownIcon 
                          className={`w-3 h-3 transition-transform duration-200 ${
                            navigationState.activeDropdown === category ? 'rotate-180' : ''
                          }`}
                        />
                      </Button>
                    </Link>
                  </div>
                );
              }
              
              // Unified routing for all other categories
              const categoryRoute = unifiedCategoryRoutingService.generateCategoryRoute({
                categoryLabel: category as CategoryLabel
              });
              
              return (
                <div 
                  key={category}
                  className="relative"
                  onMouseEnter={() => handleMouseEnter(category)}
                  data-testid={`nav-category-${category.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`}
                >
                  <Link href={categoryRoute.url}>
                    <Button 
                      variant="ghost" 
                      className={`text-sm font-medium flex items-center gap-1 transition-all duration-200 ${
                        navigationState.activeDropdown === category 
                          ? 'text-purple-600 bg-purple-50 dark:bg-purple-900/20' 
                          : 'text-gray-700 dark:text-gray-300 hover:text-purple-600'
                      } ${navigationState.isTransitioning ? 'opacity-70' : ''}`}
                      data-testid={`nav-${category.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`}
                      aria-label={`Go to ${category.toLowerCase()} section`}
                      aria-expanded={navigationState.activeDropdown === category}
                      aria-haspopup="menu"
                      aria-controls={`dropdown-${slugify(category)}`}
                      onKeyDown={(e) => handleKeyDownTrigger(e, category)}
                      ref={(el) => { triggerRefs.current[category] = el; }}
                    >
                      {category}
                      <ChevronDownIcon 
                        className={`w-3 h-3 transition-transform duration-200 ${
                          navigationState.activeDropdown === category ? 'rotate-180' : ''
                        }`}
                      />
                    </Button>
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </nav>
      
      {/* Enterprise full-width dropdown with layout engine integration */}
      {navigationState.activeDropdown && (
        <div 
          className={`absolute top-full left-0 w-screen bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 shadow-xl z-40 transition-all duration-300 ${
            navigationState.isTransitioning ? 'opacity-0 translate-y-[-10px]' : 'opacity-100 translate-y-0'
          }`}
          onMouseEnter={() => navigationState.activeDropdown && handleMouseEnter(navigationState.activeDropdown)}
          data-testid={`dropdown-${navigationState.activeDropdown.toLowerCase().replace(/ & /g, '-').replace(/ /g, '-')}`}
          role="menu"
          aria-label={`${navigationState.activeDropdown} navigation menu`}
          id={`dropdown-${slugify(navigationState.activeDropdown || '')}`}
          ref={dropdownRef}
          onKeyDown={handleDropdownKeyDown}
        >
          <div className="w-full py-8 px-8">
            {navigationState.activeDropdown === 'Brands' ? (
              // Special layout for Brands dropdown
              <div className="grid" style={dropdownStyles}>
                        <div>
                          <h4 className="text-xs font-bold text-purple-600 uppercase tracking-wide mb-3">WOMEN'S BRANDS</h4>
                           <ul className="space-y-2">
                             {["lululemon athletica", "Coach", "Michael Kors", "Louis Vuitton", "Nike", "Tory Burch", "kate spade", "CHANEL", "Free People", "J. Crew"].map((brand, idx) => (
                               <li key={idx}>
                                 <Link href={navigationService.generateBrandRoute(brand)}>
                                   <Button variant="ghost" className="text-xs text-gray-600 dark:text-gray-400 hover:text-purple-600 h-auto p-0 font-normal justify-start">
                                     {brand}
                                   </Button>
                                 </Link>
                               </li>
                             ))}
                           </ul>
                           <Link href={navigationService.generateBrandSegmentRoute('women')}>
                            <Button variant="ghost" className="text-xs text-purple-600 hover:text-purple-700 h-auto p-0 font-semibold mt-3">
                              Shop All WOMEN'S BRANDS
                            </Button>
                          </Link>
                        </div>
                        
                        <div>
                          <h4 className="text-xs font-bold text-purple-600 uppercase tracking-wide mb-3">MEN'S BRANDS</h4>
                           <ul className="space-y-2">
                             {["Nike", "Gucci", "The North Face", "Banana Republic", "Levi's", "adidas", "True Religion", "J. Crew", "Jordan", "Polo by Ralph Lauren"].map((brand, idx) => (
                               <li key={idx}>
                                 <Link href={navigationService.generateBrandRoute(brand)}>
                                   <Button variant="ghost" className="text-xs text-gray-600 dark:text-gray-400 hover:text-purple-600 h-auto p-0 font-normal justify-start">
                                     {brand}
                                   </Button>
                                 </Link>
                               </li>
                             ))}
                           </ul>
                           <Link href={navigationService.generateBrandSegmentRoute('men')}>
                            <Button variant="ghost" className="text-xs text-purple-600 hover:text-purple-700 h-auto p-0 font-semibold mt-3">
                              Shop All MEN'S BRANDS
                            </Button>
                          </Link>
                        </div>
                        
                        <div>
                          <h4 className="text-xs font-bold text-purple-600 uppercase tracking-wide mb-3">KID'S BRANDS</h4>
                           <ul className="space-y-2">
                             {["Gap", "Carter's", "Nike", "Children's Place", "Gymboree", "OshKosh B'gosh", "Converse", "Ralph Lauren", "Justice", "Old Navy"].map((brand, idx) => (
                               <li key={idx}>
                                 <Link href={navigationService.generateBrandRoute(brand)}>
                                   <Button variant="ghost" className="text-xs text-gray-600 dark:text-gray-400 hover:text-purple-600 h-auto p-0 font-normal justify-start">
                                     {brand}
                                   </Button>
                                 </Link>
                               </li>
                             ))}
                           </ul>
                           <Link href={navigationService.generateBrandSegmentRoute('kids')}>
                            <Button variant="ghost" className="text-xs text-purple-600 hover:text-purple-700 h-auto p-0 font-semibold mt-3">
                              Shop All KID'S BRANDS
                            </Button>
                          </Link>
                        </div>
                        
                        <div>
                          <h4 className="text-xs font-bold text-purple-600 uppercase tracking-wide mb-3">HOME BRANDS</h4>
                           <ul className="space-y-2">
                             {["Crate & Barrel", "IKEA", "Jonathan Adler", "Paper Source", "Pier 1", "Pottery Barn", "Restoration Hardware", "Sur La Table", "Target", "The Container Store", "West Elm", "Williams Sonoma", "Z Gallerie"].map((brand, idx) => (
                               <li key={idx}>
                                 <Link href={navigationService.generateBrandRoute(brand)}>
                                   <Button variant="ghost" className="text-xs text-gray-600 dark:text-gray-400 hover:text-purple-600 h-auto p-0 font-normal justify-start">
                                     {brand}
                                   </Button>
                                 </Link>
                               </li>
                             ))}
                           </ul>
                           <Link href={navigationService.generateBrandSegmentRoute('home')}>
                            <Button variant="ghost" className="text-xs text-purple-600 hover:text-purple-700 h-auto p-0 font-semibold mt-3">
                              Shop All HOME BRANDS
                            </Button>
                          </Link>
                        </div>
                        
                        <div>
                          <h4 className="text-xs font-bold text-purple-600 uppercase tracking-wide mb-3">ELECTRONICS BRANDS</h4>
                           <ul className="space-y-2">
                             {["Apple", "Sony", "Microsoft", "Fujifilm", "Google", "Samsung", "Dell", "HP", "Nikon", "Canon"].map((brand, idx) => (
                               <li key={idx}>
                                 <Link href={navigationService.generateBrandRoute(brand)}>
                                   <Button variant="ghost" className="text-xs text-gray-600 dark:text-gray-400 hover:text-purple-600 h-auto p-0 font-normal justify-start">
                                     {brand}
                                   </Button>
                                 </Link>
                               </li>
                             ))}
                           </ul>
                           <Link href={navigationService.generateBrandSegmentRoute('electronics')}>
                            <Button variant="ghost" className="text-xs text-purple-600 hover:text-purple-700 h-auto p-0 font-semibold mt-3">
                              Shop All ELECTRONICS BRANDS
                            </Button>
                          </Link>
                        </div>
                      </div>
            ) : (
              // Unified layout for all dropdowns (excluding Brands)
              <div className="grid" style={dropdownStyles}>
                        {activeCategoryConfig && activeCategoryConfig.sections.map((section, index) => {
                          // Generate section header route using unified service
                          const sectionRoute = unifiedCategoryRoutingService.generateCategoryRoute({
                            categoryLabel: navigationState.activeDropdown as CategoryLabel,
                            section: section.title
                          });

                          return (
                            <div key={index} className="space-y-3" data-nav-section>
                              <h3 className="text-xs font-bold text-purple-600 uppercase tracking-wide">
                                <Link href={sectionRoute.url} className="hover:underline">
                                  {section.title}
                                </Link>
                              </h3>
                              <ul className="space-y-2">
                                {section.items.map((item, itemIndex) => {
                                  // Generate item route using unified service
                                  const itemRoute = unifiedCategoryRoutingService.generateCategoryRoute({
                                    categoryLabel: navigationState.activeDropdown as CategoryLabel,
                                    section: section.title,
                                    item: item
                                  });

                                  return (
                                    <li key={itemIndex}>
                                      <Link href={itemRoute.url}>
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
                                  );
                                })}
                              </ul>
                              {section.shopAll && (
                                <Link href={sectionRoute.url}>
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
                          );
                        })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}