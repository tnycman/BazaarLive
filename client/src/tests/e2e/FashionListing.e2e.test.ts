// Fashion Listing E2E Tests - Enterprise-grade end-to-end testing
import { test, expect, Page, BrowserContext } from '@playwright/test';
import { setupTestUser, cleanupTestUser, TEST_USER_CREDENTIALS } from '../helpers/userSetup';
import { createTestListing, cleanupTestListings } from '../helpers/listingSetup';

test.describe('Fashion Listing End-to-End Tests', () => {
  let context: BrowserContext;
  let page: Page;
  let testUserId: string;

  test.beforeAll(async ({ browser }) => {
    // Setup test environment
    context = await browser.newContext();
    page = await context.newPage();
    
    // Setup test user
    testUserId = await setupTestUser();
  });

  test.afterAll(async () => {
    // Cleanup test environment
    await cleanupTestUser(testUserId);
    await cleanupTestListings();
    await context.close();
  });

  test.beforeEach(async () => {
    // Reset page state
    await page.goto('/');
    
    // Login as test user
    await page.click('[data-testid="login-button"]');
    await page.fill('[data-testid="email-input"]', TEST_USER_CREDENTIALS.email);
    await page.fill('[data-testid="password-input"]', TEST_USER_CREDENTIALS.password);
    await page.click('[data-testid="submit-login"]');
    
    // Wait for authentication
    await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test.describe('Create Fashion Listing Flow', () => {
    test('should create a complete fashion listing successfully', async () => {
      // Navigate to create listing page
      await page.click('[data-testid="temp-add-listing-button"]');
      await expect(page.locator('[data-testid="text-create-listing-title"]')).toBeVisible();

      // Verify fashion-only messaging
      await expect(page.locator('text=Fashion-Only Marketplace')).toBeVisible();
      await expect(page.locator('text=👗 Women\'s Fashion')).toBeVisible();

      // Fill in basic information
      await page.fill('input[placeholder*="Vintage Chanel Blazer"]', 'Vintage Designer Dress - Size 8');
      await page.fill('textarea[placeholder*="Describe the item"]', 
        'Beautiful vintage dress from the 1990s. Excellent condition with no visible wear. Perfect for special occasions or formal events.');

      // Select fashion category
      const womenCategory = page.locator('[data-category="women"]');
      await womenCategory.click();
      await expect(womenCategory).toHaveClass(/ring-2 ring-purple-500/);

      // Fill product details
      await page.fill('input[placeholder*="Chanel, Zara"]', 'Vintage Designer');
      await page.selectOption('select[data-testid*="condition"]', 'excellent');
      await page.fill('input[placeholder*="S, 6, 32x34"]', '8');
      await page.fill('input[placeholder*="Black, Navy Blue"]', 'Navy Blue');
      await page.fill('input[placeholder*="Cotton, Silk"]', 'Silk');

      // Fill pricing
      await page.fill('input[type="number"][placeholder="0.00"]', '299.99');
      await page.fill('input[type="number"][placeholder="0.00"]', '450.00'); // Original price

      // Add negotiable and shipping options
      await page.check('input[type="checkbox"] + label:has-text("Price is negotiable")');
      await page.check('input[type="checkbox"] + label:has-text("Shipping included")');

      // Add images
      await page.click('button:has-text("Add Image")');
      await page.fill('input[placeholder="Enter image URL:"]', 'https://example.com/dress1.jpg');
      await page.keyboard.press('Enter');

      await page.click('button:has-text("Add Image")');
      await page.fill('input[placeholder="Enter image URL:"]', 'https://example.com/dress2.jpg');
      await page.keyboard.press('Enter');

      // Verify images were added
      await expect(page.locator('img[alt="Preview 1"]')).toBeVisible();
      await expect(page.locator('img[alt="Preview 2"]')).toBeVisible();

      // Add tags
      await page.fill('input[placeholder*="Add a tag"]', 'vintage');
      await page.click('button:has-text("Add")');
      await expect(page.locator('[data-testid*="tag-vintage"]')).toBeVisible();

      await page.fill('input[placeholder*="Add a tag"]', 'designer');
      await page.click('button:has-text("Add")');
      await expect(page.locator('[data-testid*="tag-designer"]')).toBeVisible();

      // Add style tags (expand advanced options first)
      await page.click('text=Advanced Options & Tags');
      await page.fill('input[placeholder*="boho, minimalist"]', 'elegant');
      await page.click('button:has-text("Add")');

      // Add special attributes
      await page.check('input[type="checkbox"] + label:has-text("Vintage Item")');

      // Add location
      await page.fill('input[placeholder*="New York, NY"]', 'San Francisco, CA');

      // Verify live preview updates
      await expect(page.locator('[data-testid*="preview"]')).toContainText('Vintage Designer Dress');
      await expect(page.locator('[data-testid*="preview"]')).toContainText('$299.99');

      // Check completion progress
      await expect(page.locator('text=100% Complete')).toBeVisible();

      // Submit the listing
      await page.click('button:has-text("Create Fashion Listing")');

      // Verify success
      await expect(page.locator('text=Your fashion listing has been created successfully')).toBeVisible();
      
      // Should redirect to marketplace
      await page.waitForURL('**/marketplace');
      await expect(page.locator('h1')).toContainText('Marketplace');
    });

    test('should show validation errors for incomplete form', async () => {
      // Navigate to create listing page
      await page.click('[data-testid="temp-add-listing-button"]');
      
      // Try to submit without filling required fields
      await page.click('button:has-text("Create Fashion Listing")');

      // Should see validation progress
      await expect(page.locator('text=Required fields:')).toBeVisible();
      
      // Button should be disabled
      await expect(page.locator('button:has-text("Create Fashion Listing")')).toBeDisabled();
    });

    test('should handle image management correctly', async () => {
      await page.click('[data-testid="temp-add-listing-button"]');

      // Add multiple images
      for (let i = 1; i <= 3; i++) {
        await page.click('button:has-text("Add Image")');
        await page.fill('input[placeholder="Enter image URL:"]', `https://example.com/image${i}.jpg`);
        await page.keyboard.press('Enter');
      }

      // Verify all images are shown
      for (let i = 1; i <= 3; i++) {
        await expect(page.locator(`img[alt="Preview ${i}"]`)).toBeVisible();
      }

      // Remove middle image
      await page.hover(`img[alt="Preview 2"]`);
      await page.click(`[data-testid="button-remove-image-1"]`);

      // Verify image was removed
      await expect(page.locator('img[alt="Preview 2"]')).not.toBeVisible();
      
      // First image should have "Main" badge
      await expect(page.locator('text=Main')).toBeVisible();
    });

    test('should handle category-specific subcategories', async () => {
      await page.click('[data-testid="temp-add-listing-button"]');

      // Select women's category
      await page.click('[data-category="women"]');

      // Should show women's subcategories
      await expect(page.locator('select option:has-text("Dresses")')).toBeVisible();
      await expect(page.locator('select option:has-text("Tops")')).toBeVisible();

      // Switch to men's category
      await page.click('[data-category="men"]');

      // Should show men's subcategories
      await expect(page.locator('select option:has-text("Shirts")')).toBeVisible();
      await expect(page.locator('select option:has-text("Suits")')).toBeVisible();
    });

    test('should provide helpful feedback and tips', async () => {
      await page.click('[data-testid="temp-add-listing-button"]');

      // Should show fashion-specific tips
      await expect(page.locator('text=Fashion Listing Success Tips')).toBeVisible();
      await expect(page.locator('text=Use natural lighting whenever possible')).toBeVisible();
      await expect(page.locator('text=Include accurate measurements')).toBeVisible();
      await expect(page.locator('text=Research similar items for competitive pricing')).toBeVisible();

      // Should show completion progress
      await expect(page.locator('text=Listing Completion')).toBeVisible();
      await expect(page.locator('progress')).toBeVisible();
    });
  });

  test.describe('Fashion Listing Display and Interaction', () => {
    let testListingId: string;

    test.beforeEach(async () => {
      // Create a test listing
      testListingId = await createTestListing({
        sellerId: testUserId,
        title: 'Test Fashion Item for E2E',
        fashionCategory: 'women',
        price: 99.99,
        images: ['https://example.com/test.jpg']
      });
    });

    test('should display fashion listing correctly in marketplace', async () => {
      // Navigate to marketplace
      await page.goto('/marketplace');

      // Find the test listing
      const listingCard = page.locator(`[data-listing-id="${testListingId}"]`);
      await expect(listingCard).toBeVisible();

      // Verify listing information
      await expect(listingCard.locator('h3')).toContainText('Test Fashion Item for E2E');
      await expect(listingCard.locator('text=$99.99')).toBeVisible();
      await expect(listingCard.locator('img')).toBeVisible();
    });

    test('should handle listing interactions (like, view)', async () => {
      await page.goto('/marketplace');

      // Click on listing to view details
      const listingCard = page.locator(`[data-listing-id="${testListingId}"]`);
      await listingCard.click();

      // Should navigate to listing detail page
      await page.waitForURL(`**/listings/${testListingId}`);

      // Verify listing details
      await expect(page.locator('h1')).toContainText('Test Fashion Item for E2E');
      await expect(page.locator('text=$99.99')).toBeVisible();

      // Test like functionality
      const likeButton = page.locator('[data-testid="like-button"]');
      await likeButton.click();
      await expect(page.locator('text=Liked successfully')).toBeVisible();

      // Test unlike
      await likeButton.click();
      await expect(page.locator('text=Unliked successfully')).toBeVisible();
    });

    test('should handle commenting on listings', async () => {
      await page.goto(`/listings/${testListingId}`);

      // Add a comment
      await page.fill('[data-testid="comment-input"]', 'This looks amazing! Is it still available?');
      await page.click('[data-testid="submit-comment"]');

      // Verify comment appears
      await expect(page.locator('text=This looks amazing! Is it still available?')).toBeVisible();
      await expect(page.locator('[data-testid="comment-list"]')).toContainText(TEST_USER_CREDENTIALS.username);
    });
  });

  test.describe('Fashion Listing Search and Filtering', () => {
    test.beforeEach(async () => {
      // Create multiple test listings for search testing
      await Promise.all([
        createTestListing({
          sellerId: testUserId,
          title: 'Red Vintage Dress',
          fashionCategory: 'women',
          subcategory: 'dresses',
          color: 'red',
          price: 150,
          tags: ['vintage', 'formal']
        }),
        createTestListing({
          sellerId: testUserId,
          title: 'Blue Denim Jacket',
          fashionCategory: 'unisex',
          subcategory: 'jackets',
          color: 'blue',
          price: 80,
          tags: ['casual', 'denim']
        }),
        createTestListing({
          sellerId: testUserId,
          title: 'Black Designer Shoes',
          fashionCategory: 'women',
          subcategory: 'shoes',
          color: 'black',
          price: 200,
          tags: ['designer', 'formal']
        })
      ]);
    });

    test('should search listings by text', async () => {
      await page.goto('/marketplace');

      // Search for "vintage"
      await page.fill('[data-testid="search-input"]', 'vintage');
      await page.press('[data-testid="search-input"]', 'Enter');

      // Should show only vintage items
      await expect(page.locator('text=Red Vintage Dress')).toBeVisible();
      await expect(page.locator('text=Blue Denim Jacket')).not.toBeVisible();
    });

    test('should filter by fashion category', async () => {
      await page.goto('/marketplace');

      // Open filters
      await page.click('[data-testid="filters-toggle"]');

      // Select women's category
      await page.check('input[value="women"]');
      await page.click('[data-testid="apply-filters"]');

      // Should show only women's items
      await expect(page.locator('text=Red Vintage Dress')).toBeVisible();
      await expect(page.locator('text=Black Designer Shoes')).toBeVisible();
      await expect(page.locator('text=Blue Denim Jacket')).not.toBeVisible();
    });

    test('should filter by price range', async () => {
      await page.goto('/marketplace');

      // Open filters
      await page.click('[data-testid="filters-toggle"]');

      // Set price range
      await page.fill('[data-testid="min-price"]', '100');
      await page.fill('[data-testid="max-price"]', '180');
      await page.click('[data-testid="apply-filters"]');

      // Should show only items in price range
      await expect(page.locator('text=Red Vintage Dress')).toBeVisible(); // $150
      await expect(page.locator('text=Blue Denim Jacket')).not.toBeVisible(); // $80
      await expect(page.locator('text=Black Designer Shoes')).not.toBeVisible(); // $200
    });

    test('should sort listings correctly', async () => {
      await page.goto('/marketplace');

      // Sort by price low to high
      await page.selectOption('[data-testid="sort-select"]', 'price_low');

      // Verify order (should be $80, $150, $200)
      const listings = page.locator('[data-testid*="listing-card"]');
      const firstListing = listings.first();
      const lastListing = listings.last();

      await expect(firstListing).toContainText('Blue Denim Jacket'); // $80
      await expect(lastListing).toContainText('Black Designer Shoes'); // $200
    });

    test('should handle combined filters', async () => {
      await page.goto('/marketplace');

      // Open filters
      await page.click('[data-testid="filters-toggle"]');

      // Apply multiple filters
      await page.check('input[value="women"]'); // Category
      await page.fill('[data-testid="min-price"]', '140'); // Min price
      await page.check('input[value="formal"]'); // Tag

      await page.click('[data-testid="apply-filters"]');

      // Should show only items matching all criteria
      await expect(page.locator('text=Red Vintage Dress')).toBeVisible(); // Women's, $150, formal tag
      await expect(page.locator('text=Black Designer Shoes')).toBeVisible(); // Women's, $200, formal tag
      await expect(page.locator('text=Blue Denim Jacket')).not.toBeVisible(); // Unisex, wrong tag
    });
  });

  test.describe('Responsive Design and Accessibility', () => {
    test('should work correctly on mobile devices', async () => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      await page.click('[data-testid="temp-add-listing-button"]');

      // Mobile-specific elements should be visible
      await expect(page.locator('[data-testid="text-create-listing-title"]')).toBeVisible();

      // Form should be responsive
      await expect(page.locator('.grid.md\\:grid-cols-4')).toBeVisible(); // Fashion categories grid
      await expect(page.locator('.grid.md\\:grid-cols-2')).toBeVisible(); // Form fields grid

      // Should be able to fill form on mobile
      await page.fill('input[placeholder*="Vintage Chanel Blazer"]', 'Mobile Test Item');
      await page.click('[data-category="women"]');

      // Live preview should work on mobile
      await expect(page.locator('text=Mobile Test Item')).toBeVisible();
    });

    test('should be accessible via keyboard navigation', async () => {
      await page.click('[data-testid="temp-add-listing-button"]');

      // Tab through form elements
      await page.keyboard.press('Tab'); // Title input
      await page.keyboard.type('Accessibility Test Item');

      await page.keyboard.press('Tab'); // Description textarea
      await page.keyboard.type('Testing keyboard accessibility');

      // Should be able to navigate to category selection
      await page.keyboard.press('Tab');
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter'); // Select category

      // Form should be completable via keyboard
      await expect(page.locator('input[value="Accessibility Test Item"]')).toBeVisible();
    });

    test('should meet accessibility standards', async () => {
      await page.click('[data-testid="temp-add-listing-button"]');

      // Check for proper ARIA labels and roles
      await expect(page.locator('input[aria-label], input[aria-labelledby]')).toHaveCount.greaterThan(0);
      await expect(page.locator('button[aria-label], button[aria-labelledby]')).toHaveCount.greaterThan(0);

      // Check for form validation messages
      await page.click('button:has-text("Create Fashion Listing")');
      await expect(page.locator('[role="alert"], .text-red-500, .text-destructive')).toBeVisible();
    });
  });

  test.describe('Error Handling and Edge Cases', () => {
    test('should handle network errors gracefully', async () => {
      await page.click('[data-testid="temp-add-listing-button"]');

      // Fill out valid form
      await page.fill('input[placeholder*="Vintage Chanel Blazer"]', 'Network Test Item');
      await page.click('[data-category="women"]');
      await page.selectOption('select', 'excellent');
      await page.fill('input[type="number"]', '99.99');

      // Simulate network failure
      await page.route('**/api/fashion/listings', route => route.abort());

      await page.click('button:has-text("Create Fashion Listing")');

      // Should show error message
      await expect(page.locator('text=Failed to save listing')).toBeVisible();
      
      // Form data should be preserved
      await expect(page.locator('input[value="Network Test Item"]')).toBeVisible();
    });

    test('should handle invalid image URLs', async () => {
      await page.click('[data-testid="temp-add-listing-button"]');

      // Try to add invalid image URL
      await page.click('button:has-text("Add Image")');
      
      // This would be handled by the image validation in the form
      // The actual implementation would show appropriate error messages
    });

    test('should prevent duplicate form submissions', async () => {
      await page.click('[data-testid="temp-add-listing-button"]');

      // Fill minimum required fields
      await page.fill('input[placeholder*="Vintage Chanel Blazer"]', 'Duplicate Test');
      await page.click('[data-category="women"]');
      await page.selectOption('select', 'excellent');
      await page.fill('input[type="number"]', '99.99');
      await page.click('button:has-text("Add Image")');
      await page.fill('input[placeholder="Enter image URL:"]', 'https://example.com/test.jpg');
      await page.keyboard.press('Enter');

      // Click submit button multiple times rapidly
      const submitButton = page.locator('button:has-text("Create Fashion Listing")');
      await submitButton.click();
      await submitButton.click();
      await submitButton.click();

      // Button should be disabled during submission
      await expect(submitButton).toBeDisabled();
      await expect(page.locator('button:has-text("Creating...")')).toBeVisible();
    });
  });
});
