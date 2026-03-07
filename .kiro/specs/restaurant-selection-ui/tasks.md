# Implementation Plan: Restaurant Selection UI

## Overview

This implementation adds a restaurant selection flow to the food delivery study application. The work involves creating a new restaurant selection page (restaurants.html), modifying the navigation flow to include restaurant selection before menu browsing, and updating the menu page to display restaurant-specific items. All changes maintain backward compatibility with existing order placement, delivery tracking, and rating functionality.

## Tasks

- [x] 1. Set up restaurant data structure and constants
  - Add RESTAURANTS constant to app.js with 4 restaurants (Pizza Hut, Burger King, Biryani Blues, Punjab Grill)
  - Each restaurant should have name and items array with at least 4 food items
  - Ensure all item IDs are unique across restaurants
  - _Requirements: 1.1, 6.1, 6.2, 6.3, 6.4_

- [ ]* 1.1 Write property test for restaurant data structure
  - **Property 12: Food Items Have Required Structure**
  - **Validates: Requirements 6.2**
  - **Property 13: Restaurants Have Minimum Items**
  - **Validates: Requirements 6.3**
  - **Property 14: Item IDs Are Unique Across Restaurants**
  - **Validates: Requirements 6.4**

- [ ] 2. Create restaurant selection page
  - [x] 2.1 Create frontend/restaurants.html with page structure
    - Copy base structure from index.html
    - Add viewport meta tag for mobile-first design
    - Include title "Select a Restaurant"
    - Add container for restaurant cards
    - Link to style.css and app.js
    - _Requirements: 1.4, 5.1_

  - [x] 2.2 Add restaurant card styles to frontend/style.css
    - Create .restaurant-list grid layout with 12px gap
    - Create .restaurant-card styling with border, padding, hover states
    - Ensure minimum 44px height for touch targets
    - Apply existing design system (colors, fonts, border-radius)
    - _Requirements: 1.5, 5.3, 5.4, 5.5_

  - [x] 2.3 Implement pageRestaurants() function in app.js
    - Add session validation using requireSession()
    - Render restaurant cards dynamically from RESTAURANTS data
    - Attach click handlers to store selectedRestaurant in session state
    - Navigate to menu.html on restaurant selection
    - _Requirements: 1.2, 1.3, 4.1_

- [ ]* 2.4 Write property tests for restaurant selection behavior
  - **Property 1: Restaurant Selection Updates Session State**
  - **Validates: Requirements 1.2, 4.1**
  - **Property 2: Restaurant Selection Triggers Navigation**
  - **Validates: Requirements 1.3**
  - **Property 3: Restaurant Cards Are Clickable**
  - **Validates: Requirements 1.5**
  - **Property 11: Restaurant Cards Meet Touch Target Size**
  - **Validates: Requirements 5.3**

- [x] 3. Checkpoint - Verify restaurant selection page
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Modify navigation flow
  - [x] 4.1 Update pageHome() in app.js to navigate to restaurants.html
    - Change navigation target from menu.html to restaurants.html
    - _Requirements: 2.1_

  - [x] 4.2 Add navigation guard to pageMenu() in app.js
    - Check for selectedRestaurant in session state
    - Redirect to restaurants.html if missing
    - _Requirements: 2.2, 2.3_

  - [x] 4.3 Update rating page back-home handler in app.js
    - Clear selectedRestaurant from session state when returning home
    - _Requirements: 4.4_

- [ ]* 4.4 Write property tests for navigation guards
  - **Property 4: Menu Page Validates Restaurant Context**
  - **Validates: Requirements 2.2, 2.3**
  - **Property 10: Restaurant Context Persists Across Navigation**
  - **Validates: Requirements 4.3**

- [x] 5. Enhance menu page with restaurant context
  - [x] 5.1 Update pageMenu() to display selected restaurant name
    - Get restaurant name from RESTAURANTS using selectedRestaurant
    - Display restaurant name in header or metadata section
    - _Requirements: 3.2_

  - [x] 5.2 Update pageMenu() to filter menu items by restaurant
    - Get restaurant-specific items from RESTAURANTS data
    - Render only items for selected restaurant
    - Maintain existing menu item display format (name, price, add button)
    - _Requirements: 3.1, 3.3_

  - [x] 5.3 Verify cart functionality remains unchanged
    - Ensure add to cart logic works with restaurant-specific items
    - Verify cart calculations (quantity, line totals, cart total)
    - _Requirements: 3.4, 7.5_

- [ ]* 5.4 Write property tests for menu display and cart functionality
  - **Property 5: Menu Displays Restaurant-Specific Items**
  - **Validates: Requirements 3.1**
  - **Property 6: Menu Displays Selected Restaurant Name**
  - **Validates: Requirements 3.2**
  - **Property 7: Menu Items Rendered With Required Elements**
  - **Validates: Requirements 3.3**
  - **Property 8: Cart Functionality Preserved**
  - **Validates: Requirements 3.4, 7.5**

- [x] 6. Checkpoint - Verify complete flow
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 7. Validate session state management
  - [x] 7.1 Verify session state extension
    - Confirm selectedRestaurant is added to session state
    - Verify existing properties (participantId, experimentId, cart, orderStarted) are preserved
    - _Requirements: 4.1, 4.2_

  - [x] 7.2 Test session state persistence across navigation
    - Navigate through complete flow: index → restaurants → menu → delivery → rating
    - Verify selectedRestaurant persists until session is cleared
    - _Requirements: 4.3_

- [ ]* 7.3 Write property tests for session state management
  - **Property 9: Session State Properties Preserved**
  - **Validates: Requirements 4.2, 7.4**

- [ ] 8. Validate backward compatibility
  - [x] 8.1 Verify order placement API compatibility
    - Test order placement with restaurant-specific items
    - Confirm API payload structure matches existing format
    - _Requirements: 7.1_

  - [x] 8.2 Verify delivery tracking functionality
    - Test Socket.IO connection and delivery status updates
    - _Requirements: 7.2_

  - [x] 8.3 Verify rating submission functionality
    - Test rating form submission and back-home navigation
    - _Requirements: 7.3_

- [ ]* 8.4 Write property test for API compatibility
  - **Property 15: Order Payload Structure Preserved**
  - **Validates: Requirements 7.1**

- [x] 9. Final checkpoint - Complete integration test
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property-based tests use fast-check with minimum 100 iterations
- All property tests must include comment tags: `// Feature: restaurant-selection-ui, Property {number}: {property_text}`
- Checkpoints ensure incremental validation at key milestones
- Mobile-first design approach maintains consistency with existing pages
- All existing functionality (order placement, delivery tracking, rating) must remain unchanged
