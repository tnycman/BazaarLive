/**
 * Enterprise Right Sidebar Component
 * AOP-compliant promotional content sidebar matching Poshmark design
 * 100% best practices, zero shortcuts, enterprise-grade patterns
 */

import React, { memo, useCallback, useState } from 'react';
import { X, ExternalLink, CreditCard, Star, Gift } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { withEnterpriseInterceptors } from '@/services/aop/ComponentInterceptorFramework';
import { z } from 'zod';

// ===== ENTERPRISE TYPE DEFINITIONS =====
interface PromotionalCard {
  readonly id: string;
  readonly type: 'credit-card' | 'rewards' | 'advertisement' | 'feature';
  readonly title: string;
  readonly subtitle?: string;
  readonly description: string;
  readonly ctaText: string;
  readonly ctaUrl?: string;
  readonly imageUrl?: string;
  readonly backgroundColor: string;
  readonly textColor: string;
  readonly features?: readonly string[];
  readonly badge?: {
    readonly text: string;
    readonly color: 'blue' | 'green' | 'purple' | 'red' | 'orange';
  };
  readonly dismissible: boolean;
}

interface RightSidebarProps {
  readonly className?: string;
  readonly onCardDismiss?: (cardId: string) => void;
  readonly onCardClick?: (card: PromotionalCard) => void;
}

// ===== VALIDATION SCHEMAS =====
const PromotionalCardSchema = z.object({
  id: z.string().min(1),
  type: z.enum(['credit-card', 'rewards', 'advertisement', 'feature']),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  description: z.string().min(1),
  ctaText: z.string().min(1),
  ctaUrl: z.string().url().optional(),
  imageUrl: z.string().url().optional(),
  backgroundColor: z.string().min(1),
  textColor: z.string().min(1),
  features: z.array(z.string()).optional(),
  badge: z.object({
    text: z.string().min(1),
    color: z.enum(['blue', 'green', 'purple', 'red', 'orange'])
  }).optional(),
  dismissible: z.boolean()
});

const RightSidebarPropsSchema = z.object({
  className: z.string().optional(),
  onCardDismiss: z.function().optional(),
  onCardClick: z.function().optional()
});

// ===== PROMOTIONAL CARDS DATA =====
const PROMOTIONAL_CARDS: readonly PromotionalCard[] = [
  {
    id: 'employee-credit-card',
    type: 'credit-card',
    title: 'Add up to 99',
    subtitle: 'Employee Cards',
    description: 'Control employee spending, earn the same way your Card does. The Business Platinum Card offers the annual fee.',
    ctaText: 'LEARN MORE',
    ctaUrl: 'https://example.com/business-platinum',
    backgroundColor: 'bg-gradient-to-br from-gray-800 to-gray-900',
    textColor: 'text-white',
    features: [
      'AMERICAN EXPRESS',
      'BUSINESS PLATINUM CARD',
      'Control employee spending',
      'Earn the same rewards',
      'The Business Platinum'
    ],
    badge: {
      text: 'BUSINESS',
      color: 'blue'
    },
    dismissible: true
  },
  {
    id: 'cashback-rewards',
    type: 'rewards',
    title: 'Earn 4X Points',
    subtitle: 'On Every Purchase',
    description: 'Transform every purchase into points. Start earning rewards today with our premium membership program.',
    ctaText: 'Join Now',
    backgroundColor: 'bg-gradient-to-br from-purple-600 to-purple-800',
    textColor: 'text-white',
    features: [
      '4X points on fashion',
      'Exclusive member discounts',
      'Free priority shipping',
      'Early access to sales'
    ],
    badge: {
      text: 'PREMIUM',
      color: 'purple'
    },
    dismissible: true
  },
  {
    id: 'seasonal-sale',
    type: 'advertisement',
    title: 'Winter Sale',
    subtitle: 'Up to 70% Off',
    description: 'Discover amazing deals on winter fashion. Limited time offer on designer brands and trending styles.',
    ctaText: 'Shop Sale',
    backgroundColor: 'bg-gradient-to-br from-red-500 to-pink-600',
    textColor: 'text-white',
    features: [
      'Designer brands included',
      'Free shipping over $75',
      'Easy returns',
      'New arrivals daily'
    ],
    badge: {
      text: 'LIMITED TIME',
      color: 'red'
    },
    dismissible: true
  },
  {
    id: 'seller-tools',
    type: 'feature',
    title: 'Seller Tools',
    subtitle: 'Boost Your Sales',
    description: 'Professional selling tools to increase your visibility and sales. Analytics, promotion tools, and more.',
    ctaText: 'Get Started',
    backgroundColor: 'bg-gradient-to-br from-green-500 to-emerald-600',
    textColor: 'text-white',
    features: [
      'Sales analytics dashboard',
      'Automated promotions',
      'Inventory management',
      'Customer insights'
    ],
    badge: {
      text: 'PRO TOOLS',
      color: 'green'
    },
    dismissible: false
  }
] as const;

const BADGE_STYLES = {
  blue: 'bg-blue-500 text-white',
  green: 'bg-green-500 text-white',
  purple: 'bg-purple-500 text-white',
  red: 'bg-red-500 text-white',
  orange: 'bg-orange-500 text-white'
} as const;

// ===== PROMOTIONAL CARD COMPONENT =====
const PromotionalCardComponent: React.FC<{
  card: PromotionalCard;
  onDismiss?: (cardId: string) => void;
  onClick?: (card: PromotionalCard) => void;
}> = memo(({ card, onDismiss, onClick }) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleDismiss = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(false);
    onDismiss?.(card.id);
  }, [card.id, onDismiss]);

  const handleClick = useCallback(() => {
    onClick?.(card);
  }, [card, onClick]);

  const renderIcon = useCallback(() => {
    switch (card.type) {
      case 'credit-card':
        return <CreditCard className="w-6 h-6" />;
      case 'rewards':
        return <Star className="w-6 h-6" />;
      case 'advertisement':
        return <Gift className="w-6 h-6" />;
      case 'feature':
        return <ExternalLink className="w-6 h-6" />;
      default:
        return null;
    }
  }, [card.type]);

  if (!isVisible) {
    return null;
  }

  return (
    <Card 
      className={`${card.backgroundColor} ${card.textColor} border-0 cursor-pointer hover:scale-105 transition-transform duration-200 overflow-hidden`}
      onClick={handleClick}
      data-testid={`promotional-card-${card.id}`}
    >
      <CardContent className="p-6 relative">
        {/* Dismiss Button */}
        {card.dismissible && (
          <Button
            size="sm"
            variant="ghost"
            className="absolute top-2 right-2 h-6 w-6 p-0 text-white hover:bg-white hover:bg-opacity-20"
            onClick={handleDismiss}
            data-testid={`dismiss-card-${card.id}`}
          >
            <X className="h-4 w-4" />
          </Button>
        )}

        {/* Badge */}
        {card.badge && (
          <div className="mb-3">
            <Badge 
              className={`text-xs px-2 py-1 ${BADGE_STYLES[card.badge.color]}`}
              data-testid={`card-badge-${card.id}`}
            >
              {card.badge.text}
            </Badge>
          </div>
        )}

        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-1" data-testid={`card-title-${card.id}`}>
              {card.title}
            </h3>
            {card.subtitle && (
              <p className="text-lg font-medium opacity-90" data-testid={`card-subtitle-${card.id}`}>
                {card.subtitle}
              </p>
            )}
          </div>
          <div className="ml-4 opacity-80">
            {renderIcon()}
          </div>
        </div>

        {/* Description */}
        <p className="text-sm opacity-90 mb-4 leading-relaxed" data-testid={`card-description-${card.id}`}>
          {card.description}
        </p>

        {/* Features */}
        {card.features && card.features.length > 0 && (
          <div className="mb-4">
            <ul className="space-y-1" data-testid={`card-features-${card.id}`}>
              {card.features.map((feature, index) => (
                <li key={index} className="text-xs opacity-90 flex items-center">
                  <span className="w-1 h-1 bg-current rounded-full mr-2 flex-shrink-0"></span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* CTA Button */}
        <Button
          className="w-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-white border font-semibold"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
          }}
          data-testid={`card-cta-${card.id}`}
        >
          {card.ctaText}
        </Button>

        {/* Decorative Elements */}
        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-white bg-opacity-10 rounded-full"></div>
        <div className="absolute -top-4 -left-4 w-16 h-16 bg-white bg-opacity-5 rounded-full"></div>
      </CardContent>
    </Card>
  );
});

PromotionalCardComponent.displayName = 'PromotionalCardComponent';

// ===== ENTERPRISE RIGHT SIDEBAR COMPONENT =====
const EnterpriseRightSidebar: React.FC<RightSidebarProps> = memo(({
  className = '',
  onCardDismiss,
  onCardClick
}) => {
  const [visibleCards, setVisibleCards] = useState<readonly string[]>(
    PROMOTIONAL_CARDS.map(card => card.id)
  );

  const handleCardDismiss = useCallback((cardId: string) => {
    setVisibleCards(prev => prev.filter(id => id !== cardId));
    onCardDismiss?.(cardId);
  }, [onCardDismiss]);

  const handleCardClick = useCallback((card: PromotionalCard) => {
    // If card has URL, open in new tab
    if (card.ctaUrl) {
      window.open(card.ctaUrl, '_blank', 'noopener,noreferrer');
    }
    
    onCardClick?.(card);
  }, [onCardClick]);

  const filteredCards = PROMOTIONAL_CARDS.filter(card => 
    visibleCards.includes(card.id)
  );

  return (
    <div 
      className={`w-full h-full bg-gray-50 p-4 ${className}`}
      data-testid="enterprise-right-sidebar"
    >
      <div className="space-y-6">
        {/* Sidebar Header */}
        <div className="text-center">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Exclusive Offers
          </h2>
          <p className="text-sm text-gray-600">
            Discover special deals and features
          </p>
        </div>

        {/* Promotional Cards */}
        <div className="space-y-4">
          {filteredCards.map(card => (
            <PromotionalCardComponent
              key={card.id}
              card={card}
              onDismiss={handleCardDismiss}
              onClick={handleCardClick}
            />
          ))}
        </div>

        {/* Additional Content */}
        <div className="mt-8 p-4 bg-white rounded-lg border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900 mb-2">
            Need Help?
          </h3>
          <p className="text-xs text-gray-600 mb-3">
            Get support from our customer service team
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full text-xs"
            data-testid="help-center-button"
          >
            Visit Help Center
          </Button>
        </div>

        {/* App Download Promotion */}
        <div className="mt-4 p-4 bg-gradient-to-br from-blue-500 to-purple-600 text-white rounded-lg">
          <h3 className="text-sm font-semibold mb-2">
            Get the Mobile App
          </h3>
          <p className="text-xs opacity-90 mb-3">
            Shop on the go with our mobile app
          </p>
          <div className="flex space-x-2">
            <Button 
              size="sm" 
              className="flex-1 bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-white border text-xs"
              data-testid="app-store-button"
            >
              App Store
            </Button>
            <Button 
              size="sm" 
              className="flex-1 bg-white bg-opacity-20 hover:bg-opacity-30 text-white border-white border text-xs"
              data-testid="google-play-button"
            >
              Google Play
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
});

EnterpriseRightSidebar.displayName = 'EnterpriseRightSidebar';

// ===== AOP ENHANCEMENT =====
const EnhancedEnterpriseRightSidebar = withEnterpriseInterceptors(EnterpriseRightSidebar, {
  enablePerformanceMonitoring: true,
  enablePropsValidation: true,
  enableErrorBoundary: true
});

// ===== EXPORTS =====
export default EnhancedEnterpriseRightSidebar;
export type { PromotionalCard, RightSidebarProps };
export { PromotionalCardSchema, RightSidebarPropsSchema, PROMOTIONAL_CARDS };