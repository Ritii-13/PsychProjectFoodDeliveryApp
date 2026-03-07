# Design Document: Restaurant Selection UI

## Overview

This design implements a restaurant selection flow for a food delivery study application. The enhancement adds a new intermediate page (restaurants.html) between the session setup (index.html) and menu browsing (menu.html), allowing participants to select from 4 restaurants before viewing restaurant-specific menus.

The design follows a mobile-first approach inspired by popular food delivery platforms like Swiggy, maintaining visual consistency with the existing application while introducing minimal architectural changes. The implementation leverages the existing localStorage-based session state management and preserves all current functionality including order placement, delivery tracking, and rating submission.

Key design principles:
- Minimal disruption to existing codebase
- Mobile-first responsive design
- Consistent visual language across all pages
- Preservation of existing session state structure
- Restaurant-specific menu data organization

## Architecture

### High-Level Flow

```
index.html (Session Setup)
    ↓
restaurants.html (NEW - Restaurant Selection)
    ↓
menu.html (Menu Browsing - Enhanced)
    ↓
delivery.html (Delivery Tracking)
    ↓
rating.html (Rating Submission)
```

### Component Architecture

The application follows a simple client-side architecture with no framework dependencies:

1. **Page Components**: Each HTML page represents a distinct step in the user journey
2. **Shared State**: localStorage-based session state shared across all pages
3. **Shared Logic**: app.js contains all JavaScript logic for all pages
4. **Shared Styles**: style.css provides consistent styling across pages

### Navigation Guards

The design introduces navigation guards to ensure proper flow:

- **restaurants.html**: Requires participantId and experimentId in session state
- **menu.html**: Requires participantId, experimentId, AND selectedRestaurant in session state
- **delivery.html**: Requires orderStarted flag (existing)
- **rating.html**: Requires orderStarted flag (existing)

### Session State Extension

The existing session state structure will be extended:

```javascript
{
  participantId: string,
  experimentId: string,
  cart: object,
  orderStarted: boolean,
  selectedRestaurant: string  // NEW - restaurant identifier
}
```

## Components and Interfaces

### 1. Restaurant Selection Page (restaurants.html)

**Purpose**: Display 4 restaurants as clickable cards and capture user selection

**UI Structure**:
```
┌─────────────────────────────────┐
│  Delivery Experience Study      │
│  Select a Restaurant            │
├─────────────────────────────────┤
│  ┌───────────────────────────┐  │
│  │  Pizza Hut                │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │  Burger King              │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │  Biryani Blues            │  │
│  └───────────────────────────┘  │
│  ┌───────────────────────────┐  │
│  │  Punjab Grill             │  │
│  └───────────────────────────┘  │
└─────────────────────────────────┘
```

**HTML Structure**:
- Standard page layout matching existing pages
- Container with card wrapper
- Restaurant cards as clickable divs with data-restaurant-id attributes
- Mobile viewport meta tag
- Link to style.css and app.js

**Interaction**:
- Click on any restaurant card
- Store selectedRestaurant in session state
- Navigate to menu.html

### 2. Enhanced Menu Page (menu.html)

**Changes Required**:
1. Add navigation guard to check for selectedRestaurant
2. Display selected restaurant name in header/meta section
3. Filter menu items based on selected restaurant
4. Maintain all existing cart functionality

**Modified UI Structure**:
```
┌─────────────────────────────────┐
│  Select Items                   │
│  Pizza Hut                      │  ← NEW
│  Participant: P-001 | Exp: ...  │
├─────────────────────────────────┤
│  [Menu items for Pizza Hut]     │
│  ...                            │
└─────────────────────────────────┘
```

### 3. JavaScript Functions (app.js)

**New Functions**:

```javascript
// Restaurant data structure
const RESTAURANTS = {
  'pizza-hut': {
    name: 'Pizza Hut',
    items: [
      { id: 'ph1', name: 'Margherita Pizza', price: 299 },
      { id: 'ph2', name: 'Pepperoni Pizza', price: 399 },
      { id: 'ph3', name: 'Garlic Breadsticks', price: 149 },
      { id: 'ph4', name: 'Chocolate Lava Cake', price: 129 }
    ]
  },
  'burger-king': {
    name: 'Burger King',
    items: [
      { id: 'bk1', name: 'Whopper', price: 189 },
      { id: 'bk2', name: 'Chicken Royale', price: 179 },
      { id: 'bk3', name: 'French Fries', price: 99 },
      { id: 'bk4', name: 'Chocolate Shake', price: 119 }
    ]
  },
  'biryani-blues': {
    name: 'Biryani Blues',
    items: [
      { id: 'bb1', name: 'Hyderabadi Biryani', price: 249 },
      { id: 'bb2', name: 'Chicken Biryani', price: 279 },
      { id: 'bb3', name: 'Raita', price: 49 },
      { id: 'bb4', name: 'Gulab Jamun', price: 79 }
    ]
  },
  'punjab-grill': {
    name: 'Punjab Grill',
    items: [
      { id: 'pg1', name: 'Butter Chicken', price: 329 },
      { id: 'pg2', name: 'Paneer Tikka', price: 269 },
      { id: 'pg3', name: 'Garlic Naan', price: 59 },
      { id: 'pg4', name: 'Lassi', price: 89 }
    ]
  }
};

// Page handler for restaurants.html
function pageRestaurants() {
  const state = requireSession();
  if (!state) return;
  
  // Render restaurant cards
  // Attach click handlers
  // Store selection and navigate
}

// Modified pageMenu() to handle restaurant context
function pageMenu() {
  const state = requireSession();
  if (!state) return;
  
  // Check for selectedRestaurant
  if (!state.selectedRestaurant) {
    window.location.href = 'restaurants.html';
    return;
  }
  
  // Get restaurant-specific menu items
  const restaurant = RESTAURANTS[state.selectedRestaurant];
  const menuItems = restaurant.items;
  
  // Display restaurant name
  // Render menu items (restaurant-specific)
  // Maintain existing cart logic
}
```

**Modified Functions**:
- `pageHome()`: Change navigation target from menu.html to restaurants.html
- `pageMenu()`: Add restaurant context validation and display
- Rating page back-home handler: Clear selectedRestaurant along with other state

## Data Models

### Restaurant Data Structure

```javascript
{
  id: string,              // kebab-case identifier (e.g., 'pizza-hut')
  name: string,            // Display name (e.g., 'Pizza Hut')
  items: MenuItem[]        // Array of menu items
}
```

### Menu Item Structure (Existing)

```javascript
{
  id: string,              // Unique across ALL restaurants
  name: string,            // Item display name
  price: number            // Price in INR
}
```

### Session State Structure (Extended)

```javascript
{
  participantId: string,
  experimentId: string,
  cart: {
    [itemId: string]: number  // quantity
  },
  orderStarted: boolean,
  selectedRestaurant: string   // NEW: restaurant id
}
```

### Cart Item Structure (Existing - for API)

```javascript
{
  itemId: string,
  name: string,
  price: number,
  quantity: number
}
```

## UI/UX Design

### Visual Design System

The design maintains the existing visual language:

**Colors** (from existing CSS variables):
- Background: `#f5f6f8` with gradient
- Card: `#ffffff`
- Text: `#17212b`
- Muted text: `#55606d`
- Primary (buttons): `#ef4e24`
- Border: `#d8dde3`

**Typography**:
- Font family: 'Segoe UI', Tahoma, sans-serif
- Headings: Bold, default size
- Body: Regular weight

**Spacing**:
- Card padding: 24px (desktop), 16px (mobile)
- Element gaps: 10-12px
- Border radius: 8-12px

### Restaurant Card Design

Each restaurant card will be a clickable element with:
- Full-width layout on mobile
- Minimum 44px height for touch targets
- Border, border-radius, and shadow matching existing menu items
- Hover state with background color change
- Restaurant name centered or left-aligned

**CSS Structure**:
```css
.restaurant-list {
  display: grid;
  gap: 12px;
  margin-top: 16px;
}

.restaurant-card {
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: background 0.2s;
  min-height: 44px;
  display: flex;
  align-items: center;
}

.restaurant-card:hover {
  background: #fff4ee;
}

.restaurant-card strong {
  font-size: 16px;
  color: var(--text);
}
```

### Mobile-First Responsive Behavior

**Viewport Configuration**:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
```

**Responsive Breakpoints**:
- Mobile: < 600px (single column, full-width cards)
- Desktop: ≥ 600px (same layout, max-width container)

**Touch Optimization**:
- Minimum 44px tap target height
- Adequate spacing between cards (12px)
- No hover-dependent interactions

### Page Transitions

All navigation uses standard `window.location.href` assignments:
- No animations or transitions
- Instant page loads
- Browser back button works naturally

## Implementation Approach

### Phase 1: Create Restaurant Selection Page

1. Create `frontend/restaurants.html`
   - Copy structure from index.html
   - Update title and heading
   - Add restaurant card container
   - Link to style.css and app.js

2. Add restaurant card styles to `frontend/style.css`
   - `.restaurant-list` grid layout
   - `.restaurant-card` styling with hover states
   - Mobile-responsive adjustments

3. Add restaurant data and page handler to `frontend/app.js`
   - Define `RESTAURANTS` constant with 4 restaurants and items
   - Implement `pageRestaurants()` function
   - Add page routing logic

### Phase 2: Modify Navigation Flow

1. Update `pageHome()` in app.js
   - Change navigation target from `menu.html` to `restaurants.html`

2. Update `pageMenu()` in app.js
   - Add navigation guard for `selectedRestaurant`
   - Redirect to restaurants.html if missing
   - Display selected restaurant name
   - Filter menu items by restaurant

3. Update rating page back-home handler
   - Clear `selectedRestaurant` from state

### Phase 3: Testing and Validation

1. Test complete flow:
   - Session setup → Restaurant selection → Menu → Order → Delivery → Rating
   
2. Test navigation guards:
   - Direct URL access to menu.html without restaurant selection
   - Browser back button behavior
   
3. Test cart functionality:
   - Items from different restaurants have unique IDs
   - Cart persists across navigation
   - Order placement includes correct item data

4. Test mobile responsiveness:
   - Restaurant cards on mobile devices
   - Touch target sizes
   - Viewport scaling

### Backward Compatibility Considerations

**Preserved Functionality**:
- All existing API endpoints remain unchanged
- Order payload structure unchanged
- Delivery tracking via Socket.IO unchanged
- Rating submission unchanged
- Session state management pattern unchanged

**Migration Path**:
- No database schema changes required
- No backend changes required
- Existing sessions will be invalid (missing selectedRestaurant)
- Users will be redirected to index.html to start fresh

### File Changes Summary

**New Files**:
- `frontend/restaurants.html` (new page)

**Modified Files**:
- `frontend/app.js` (add RESTAURANTS data, pageRestaurants function, modify pageHome and pageMenu)
- `frontend/style.css` (add restaurant card styles)

**Unchanged Files**:
- `frontend/index.html`
- `frontend/delivery.html`
- `frontend/rating.html`
- All backend files


## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Restaurant Selection Updates Session State

*For any* restaurant selection from the available restaurants, clicking that restaurant should store the correct restaurant identifier in the session state's selectedRestaurant field.

**Validates: Requirements 1.2, 4.1**

### Property 2: Restaurant Selection Triggers Navigation

*For any* restaurant card clicked on the restaurant selection page, the application should navigate to the menu page.

**Validates: Requirements 1.3**

### Property 3: Restaurant Cards Are Clickable

*For any* restaurant displayed on the restaurant selection page, that restaurant should be rendered as a clickable element containing the restaurant name.

**Validates: Requirements 1.5**

### Property 4: Menu Page Validates Restaurant Context

*For any* attempt to load the menu page, if the session state does not contain a selectedRestaurant, the application should redirect to the restaurant selection page.

**Validates: Requirements 2.2, 2.3**

### Property 5: Menu Displays Restaurant-Specific Items

*For any* selected restaurant in session state, the menu page should display only the food items associated with that specific restaurant.

**Validates: Requirements 3.1**

### Property 6: Menu Displays Selected Restaurant Name

*For any* selected restaurant in session state, the menu page should display that restaurant's name in the page header or metadata section.

**Validates: Requirements 3.2**

### Property 7: Menu Items Rendered With Required Elements

*For any* food item displayed on the menu page, that item should be rendered with its name, price, and an add button.

**Validates: Requirements 3.3**

### Property 8: Cart Functionality Preserved

*For any* food item added to the cart, the cart should correctly calculate and display the item quantity, line total, and overall cart total.

**Validates: Requirements 3.4, 7.5**

### Property 9: Session State Properties Preserved

*For any* operation that modifies session state (including adding restaurant context), all existing session state properties (participantId, experimentId, cart, orderStarted) should remain unchanged.

**Validates: Requirements 4.2, 7.4**

### Property 10: Restaurant Context Persists Across Navigation

*For any* navigation between pages after restaurant selection, the selectedRestaurant value in session state should remain unchanged until the session is explicitly cleared.

**Validates: Requirements 4.3**

### Property 11: Restaurant Cards Meet Touch Target Size

*For any* restaurant card displayed on the restaurant selection page, that card should have a minimum height of 44 pixels to ensure touch-friendly interaction.

**Validates: Requirements 5.3**

### Property 12: Food Items Have Required Structure

*For any* food item defined in the restaurant data, that item should have an id, name, and price property.

**Validates: Requirements 6.2**

### Property 13: Restaurants Have Minimum Items

*For any* restaurant defined in the application, that restaurant should have at least 4 food items.

**Validates: Requirements 6.3**

### Property 14: Item IDs Are Unique Across Restaurants

*For any* two food items from the complete set of all restaurant menus, those items should have different id values to prevent cart conflicts.

**Validates: Requirements 6.4**

### Property 15: Order Payload Structure Preserved

*For any* order placed through the application, the API payload should maintain the existing structure with participantId, experimentId, and cart array containing itemId, name, price, and quantity for each item.

**Validates: Requirements 7.1**

## Error Handling

### Navigation Guard Failures

**Scenario**: User attempts to access menu.html without completing restaurant selection

**Handling**:
- Check for `selectedRestaurant` in session state
- If missing, redirect to `restaurants.html`
- No error message needed (seamless redirect)

**Scenario**: User attempts to access restaurants.html without session setup

**Handling**:
- Use existing `requireSession()` function
- Check for `participantId` and `experimentId`
- If missing, redirect to `index.html`
- No error message needed (seamless redirect)

### Invalid Restaurant Selection

**Scenario**: Session state contains invalid restaurant identifier

**Handling**:
- In `pageMenu()`, check if `RESTAURANTS[state.selectedRestaurant]` exists
- If undefined, redirect to `restaurants.html`
- Clear invalid `selectedRestaurant` from state before redirect

### Missing Menu Items

**Scenario**: Restaurant data structure is incomplete or malformed

**Handling**:
- Validate restaurant data on page load
- If restaurant has no items, display "No items available" message
- Prevent order placement if cart is empty (existing validation)

### Session State Corruption

**Scenario**: localStorage data is corrupted or invalid JSON

**Handling**:
- Existing `getState()` function has try-catch for JSON parsing
- Returns empty object on parse failure
- User will be redirected to index.html by navigation guards

### Browser Compatibility

**Scenario**: localStorage is not available or disabled

**Handling**:
- Application will fail gracefully (navigation guards will redirect to index.html)
- Consider adding feature detection and user-friendly error message
- Not critical for study environment with controlled browser setup

## Testing Strategy

### Dual Testing Approach

This feature will be validated using both unit tests and property-based tests:

- **Unit tests**: Verify specific examples, edge cases, and integration points
- **Property tests**: Verify universal properties across all inputs through randomization

### Unit Testing Focus

Unit tests should cover:

1. **Specific Examples**:
   - Restaurant selection page displays exactly 4 restaurants (Pizza Hut, Burger King, Biryani Blues, Punjab Grill)
   - Session form submission navigates to restaurants.html
   - Menu page without restaurant context redirects to restaurants.html
   - Back-home button clears all session state including restaurant context
   - Viewport meta tag is present with correct attributes
   - Restaurant cards display in single-column layout on mobile
   - CSS design system is applied (colors, fonts, border-radius)
   - Restaurant data exists for all 4 restaurants in app.js
   - Delivery tracking functionality still works
   - Rating submission functionality still works

2. **Integration Points**:
   - Complete flow: session setup → restaurant selection → menu → order → delivery → rating
   - Browser back button behavior
   - Session state persistence across page reloads

3. **Edge Cases**:
   - Direct URL access to menu.html without restaurant selection
   - Invalid restaurant identifier in session state
   - Empty cart order placement attempt
   - Corrupted localStorage data

### Property-Based Testing Focus

Property tests should verify universal behaviors across randomized inputs. We'll use **fast-check** (JavaScript property-based testing library) configured to run a minimum of 100 iterations per test.

Each property test must include a comment tag referencing the design document property:
```javascript
// Feature: restaurant-selection-ui, Property 1: Restaurant Selection Updates Session State
```

Property tests should cover:

1. **Restaurant Selection Behavior** (Properties 1-3):
   - For any restaurant clicked, verify session state is updated correctly
   - For any restaurant clicked, verify navigation occurs
   - For any restaurant, verify it's rendered as clickable with name

2. **Navigation Guards** (Properties 4, 10):
   - For any menu page load without restaurant context, verify redirect
   - For any navigation sequence, verify restaurant context persists

3. **Restaurant-Specific Display** (Properties 5-7):
   - For any selected restaurant, verify only that restaurant's items display
   - For any selected restaurant, verify restaurant name displays
   - For any menu item, verify it renders with name, price, and add button

4. **Cart Functionality** (Property 8):
   - For any items added to cart, verify correct quantity, line totals, and cart total
   - For any combination of items from different restaurants, verify calculations

5. **Session State Management** (Properties 9, 10):
   - For any session state modification, verify existing properties preserved
   - For any navigation, verify restaurant context persists

6. **Data Structure Validation** (Properties 11-14):
   - For any restaurant card, verify minimum 44px height
   - For any food item, verify id, name, price properties exist
   - For any restaurant, verify at least 4 items
   - For any pair of items across all restaurants, verify unique IDs

7. **API Compatibility** (Property 15):
   - For any order placed, verify payload structure matches expected format

### Test Configuration

**Property-Based Testing Library**: fast-check (npm package)

**Minimum Iterations**: 100 per property test

**Tag Format**: 
```javascript
// Feature: restaurant-selection-ui, Property {number}: {property_text}
```

**Example Property Test**:
```javascript
// Feature: restaurant-selection-ui, Property 1: Restaurant Selection Updates Session State
fc.assert(
  fc.property(
    fc.constantFrom('pizza-hut', 'burger-king', 'biryani-blues', 'punjab-grill'),
    (restaurantId) => {
      // Simulate restaurant selection
      selectRestaurant(restaurantId);
      const state = getState();
      return state.selectedRestaurant === restaurantId;
    }
  ),
  { numRuns: 100 }
);
```

### Testing Tools

- **Test Framework**: Jest or Mocha
- **Property Testing**: fast-check
- **DOM Testing**: jsdom or browser environment
- **Assertion Library**: Chai or Jest assertions

### Test Organization

```
tests/
  unit/
    restaurant-selection.test.js
    menu-page.test.js
    navigation-flow.test.js
    session-state.test.js
  property/
    restaurant-selection.property.test.js
    menu-display.property.test.js
    cart-functionality.property.test.js
    data-validation.property.test.js
```

### Coverage Goals

- Unit test coverage: Focus on critical paths and edge cases
- Property test coverage: All 15 correctness properties must have corresponding tests
- Integration test coverage: Complete user journey from session setup to rating submission
