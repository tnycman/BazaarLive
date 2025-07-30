/**
 * Simple Category Page - Working Implementation
 * No complex architecture, just basic functionality
 */

import React from 'react';
import { Header } from '@/components/Header';
import { Navigation } from '@/components/Navigation';

// Simple product type
interface SimpleProduct {
  id: string;
  title: string;
  brand: string;
  price: string;
  originalPrice?: string;
  size: string;
  image: string;
  seller: {
    id: string;
    username: string;
    avatar?: string;
  };
  stats: {
    likes: number;
    comments: number;
    shares: number;
  };
  condition: string;
  isLiked: boolean;
}

// Sample data
const SAMPLE_PRODUCTS: SimpleProduct[] = [
  {
    id: 'women-1',
    title: 'Designer Silk Blouse',
    brand: 'Theory',
    price: '$89',
    originalPrice: '$165',
    size: 'M',
    image: 'https://images.unsplash.com/photo-1544441893-675973e31985?w=400&h=400&fit=crop',
    seller: {
      id: 'seller1',
      username: 'fashionista_jane',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop'
    },
    stats: { likes: 24, comments: 8, shares: 3 },
    condition: 'excellent',
    isLiked: false
  },
  {
    id: 'women-2',
    title: 'Vintage Denim Jacket',
    brand: 'Levi\'s',
    price: '$65',
    originalPrice: '$98',
    size: 'S',
    image: 'https://images.unsplash.com/photo-1523205771623-e0faa4d2813d?w=400&h=400&fit=crop',
    seller: {
      id: 'seller2',
      username: 'vintage_vibes',
      avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b0c5?w=100&h=100&fit=crop'
    },
    stats: { likes: 67, comments: 15, shares: 9 },
    condition: 'good',
    isLiked: true
  },
  {
    id: 'women-3',
    title: 'Cashmere Sweater',
    brand: 'Everlane',
    price: '$118',
    originalPrice: '$168',
    size: 'M',
    image: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop',
    seller: {
      id: 'seller3',
      username: 'cozy_closet',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&h=100&fit=crop'
    },
    stats: { likes: 89, comments: 21, shares: 12 },
    condition: 'new_with_tags',
    isLiked: true
  },
  {
    id: 'women-4',
    title: 'Midi Floral Dress',
    brand: 'Reformation',
    price: '$148',
    originalPrice: '$218',
    size: 'S',
    image: 'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop',
    seller: {
      id: 'seller4',
      username: 'spring_styles',
      avatar: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=100&h=100&fit=crop'
    },
    stats: { likes: 134, comments: 29, shares: 18 },
    condition: 'excellent',
    isLiked: true
  }
];

export function SimpleCategoryPage() {
  return (
    <div className="min-h-screen bg-gray-50" data-testid="simple-category-page">
      {/* Header */}
      <Header />
      
      {/* Navigation */}
      <Navigation />
      
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Left Sidebar - Filters */}
          <div className="w-64 flex-shrink-0" data-testid="simple-filters">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Filters</h3>
              
              {/* Categories */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-2">Categories</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-gray-600">Tops</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-gray-600">Dresses</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-gray-600">Outerwear</span>
                  </label>
                </div>
              </div>
              
              {/* Brands */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-2">Brands</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-gray-600">Theory</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-gray-600">Levi's</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-gray-600">Everlane</span>
                  </label>
                </div>
              </div>
              
              {/* Size */}
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Size</h4>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-gray-600">XS</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-gray-600">S</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-gray-600">M</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-gray-600">L</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          {/* Main Content - Products Grid */}
          <div className="flex-1" data-testid="simple-products">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Women's Fashion</h1>
              <p className="text-lg text-gray-600">{SAMPLE_PRODUCTS.length} items available</p>
            </div>
            
            {/* Products Grid */}
            <div className="grid grid-cols-4 gap-4">
              {SAMPLE_PRODUCTS.map(product => (
                <div 
                  key={product.id}
                  className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                  data-testid={`product-card-${product.id}`}
                >
                  {/* Product Image */}
                  <div className="aspect-square overflow-hidden bg-gray-100">
                    <img
                      src={product.image}
                      alt={product.title}
                      className="w-full h-full object-cover"
                      data-testid={`product-image-${product.id}`}
                    />
                  </div>
                  
                  {/* Product Info */}
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500 uppercase tracking-wide">{product.brand}</span>
                      <span className="text-xs text-gray-500">{product.size}</span>
                    </div>
                    
                    <h3 className="text-sm font-medium text-gray-900 mb-2 line-clamp-2">{product.title}</h3>
                    
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-lg font-semibold text-gray-900">{product.price}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">{product.originalPrice}</span>
                      )}
                    </div>
                    
                    {/* Seller Info */}
                    <div className="flex items-center space-x-2 mb-3">
                      <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                        {product.seller.avatar && (
                          <img src={product.seller.avatar} alt="" className="w-full h-full object-cover" />
                        )}
                      </div>
                      <span className="text-xs text-gray-600 truncate">{product.seller.username}</span>
                    </div>
                    
                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <div className="flex items-center space-x-3">
                        <span>❤️ {product.stats.likes}</span>
                        <span>💬 {product.stats.comments}</span>
                        <span>📤 {product.stats.shares}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}