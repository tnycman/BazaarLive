// Custom hook for analytics tracking and management
import { useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { analyticsService } from '@/services/analytics/AnalyticsService';
import { useLocation } from 'wouter';

export function useAnalytics() {
  const { user, isAuthenticated } = useAuth();
  const [location] = useLocation();

  // Set user ID when authenticated
  useEffect(() => {
    if (isAuthenticated && user && 'id' in user) {
      analyticsService.setUserId(user.id as string);
    }
  }, [isAuthenticated, user]);

  // Track page views on route changes
  useEffect(() => {
    if (isAuthenticated) {
      analyticsService.trackPageView(location, document.title);
    }
  }, [location, isAuthenticated]);

  // Analytics tracking methods
  const trackListingView = useCallback((listingId: string, category: string, vertical: string) => {
    if (isAuthenticated) {
      analyticsService.trackListingView(listingId, category, vertical);
    }
  }, [isAuthenticated]);

  const trackListingLike = useCallback((listingId: string, action: 'like' | 'unlike') => {
    if (isAuthenticated) {
      analyticsService.trackListingLike(listingId, action);
    }
  }, [isAuthenticated]);

  const trackListingComment = useCallback((listingId: string, commentLength: number) => {
    if (isAuthenticated) {
      analyticsService.trackListingComment(listingId, commentLength);
    }
  }, [isAuthenticated]);

  const trackPurchase = useCallback((transactionId: string, value: number, listingId: string) => {
    if (isAuthenticated) {
      analyticsService.trackPurchase(transactionId, value, listingId);
    }
  }, [isAuthenticated]);

  const trackListingCreation = useCallback((listingId: string, category: string, price: number) => {
    if (isAuthenticated) {
      analyticsService.trackListingCreation(listingId, category, price);
    }
  }, [isAuthenticated]);

  const trackUserFollow = useCallback((targetUserId: string, action: 'follow' | 'unfollow') => {
    if (isAuthenticated) {
      analyticsService.trackUserFollow(targetUserId, action);
    }
  }, [isAuthenticated]);

  const trackSearch = useCallback((query: string, resultsCount: number, filters?: any) => {
    if (isAuthenticated) {
      analyticsService.trackSearch(query, resultsCount, filters);
    }
  }, [isAuthenticated]);

  const trackError = useCallback((error: Error, context?: string) => {
    analyticsService.trackError(error, context);
  }, []);

  return {
    trackListingView,
    trackListingLike,
    trackListingComment,
    trackPurchase,
    trackListingCreation,
    trackUserFollow,
    trackSearch,
    trackError,
    isTrackingEnabled: isAuthenticated
  };
}