/**
 * Test: Order Placement API Compatibility
 * 
 * This test verifies that the order placement API maintains the existing
 * payload structure when using restaurant-specific menu items.
 * 
 * Requirements: 7.1 - Backward Compatibility
 * 
 * Expected payload structure:
 * {
 *   participantId: string,
 *   experimentId: string,
 *   cart: [
 *     {
 *       itemId: string,
 *       name: string,
 *       price: number,
 *       quantity: number
 *     }
 *   ]
 * }
 */

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

/**
 * Simulates the order payload construction logic from app.js
 */
function buildOrderPayload(state, selectedRestaurant) {
  const restaurant = RESTAURANTS[selectedRestaurant];
  const menuItems = restaurant.items;
  
  const cart = Object.entries(state.cart || {})
    .map(([itemId, quantity]) => {
      const item = menuItems.find((m) => m.id === itemId);
      if (!item) {
        return null;
      }

      return {
        itemId,
        name: item.name,
        price: item.price,
        quantity
      };
    })
    .filter(Boolean);

  return {
    participantId: state.participantId,
    experimentId: state.experimentId,
    cart
  };
}

/**
 * Validates that a payload has the correct structure
 */
function validatePayloadStructure(payload) {
  const errors = [];

  // Check top-level properties
  if (typeof payload.participantId !== 'string') {
    errors.push('participantId must be a string');
  }
  if (typeof payload.experimentId !== 'string') {
    errors.push('experimentId must be a string');
  }
  if (!Array.isArray(payload.cart)) {
    errors.push('cart must be an array');
  }

  // Check cart items
  if (Array.isArray(payload.cart)) {
    payload.cart.forEach((item, index) => {
      if (typeof item.itemId !== 'string') {
        errors.push(`cart[${index}].itemId must be a string`);
      }
      if (typeof item.name !== 'string') {
        errors.push(`cart[${index}].name must be a string`);
      }
      if (typeof item.price !== 'number') {
        errors.push(`cart[${index}].price must be a number`);
      }
      if (typeof item.quantity !== 'number') {
        errors.push(`cart[${index}].quantity must be a number`);
      }
      
      // Check for unexpected properties
      const allowedKeys = ['itemId', 'name', 'price', 'quantity'];
      const actualKeys = Object.keys(item);
      const unexpectedKeys = actualKeys.filter(key => !allowedKeys.includes(key));
      if (unexpectedKeys.length > 0) {
        errors.push(`cart[${index}] has unexpected properties: ${unexpectedKeys.join(', ')}`);
      }
    });
  }

  return errors;
}

/**
 * Test cases
 */
function runTests() {
  let passed = 0;
  let failed = 0;

  console.log('=== Order Placement API Compatibility Tests ===\n');

  // Test 1: Pizza Hut order
  console.log('Test 1: Pizza Hut order with multiple items');
  try {
    const state = {
      participantId: 'P001',
      experimentId: 'EXP001',
      cart: {
        'ph1': 2,  // 2x Margherita Pizza
        'ph3': 1   // 1x Garlic Breadsticks
      }
    };
    
    const payload = buildOrderPayload(state, 'pizza-hut');
    const errors = validatePayloadStructure(payload);
    
    if (errors.length === 0) {
      console.log('✓ PASSED: Payload structure is correct');
      console.log('  Payload:', JSON.stringify(payload, null, 2));
      passed++;
    } else {
      console.log('✗ FAILED: Payload structure errors:');
      errors.forEach(err => console.log('  -', err));
      failed++;
    }
  } catch (error) {
    console.log('✗ FAILED: Exception thrown:', error.message);
    failed++;
  }
  console.log();

  // Test 2: Burger King order
  console.log('Test 2: Burger King order with single item');
  try {
    const state = {
      participantId: 'P002',
      experimentId: 'EXP002',
      cart: {
        'bk1': 1  // 1x Whopper
      }
    };
    
    const payload = buildOrderPayload(state, 'burger-king');
    const errors = validatePayloadStructure(payload);
    
    if (errors.length === 0) {
      console.log('✓ PASSED: Payload structure is correct');
      console.log('  Payload:', JSON.stringify(payload, null, 2));
      passed++;
    } else {
      console.log('✗ FAILED: Payload structure errors:');
      errors.forEach(err => console.log('  -', err));
      failed++;
    }
  } catch (error) {
    console.log('✗ FAILED: Exception thrown:', error.message);
    failed++;
  }
  console.log();

  // Test 3: Biryani Blues order
  console.log('Test 3: Biryani Blues order with all items');
  try {
    const state = {
      participantId: 'P003',
      experimentId: 'EXP003',
      cart: {
        'bb1': 1,  // 1x Hyderabadi Biryani
        'bb2': 1,  // 1x Chicken Biryani
        'bb3': 2,  // 2x Raita
        'bb4': 3   // 3x Gulab Jamun
      }
    };
    
    const payload = buildOrderPayload(state, 'biryani-blues');
    const errors = validatePayloadStructure(payload);
    
    if (errors.length === 0) {
      console.log('✓ PASSED: Payload structure is correct');
      console.log('  Payload:', JSON.stringify(payload, null, 2));
      passed++;
    } else {
      console.log('✗ FAILED: Payload structure errors:');
      errors.forEach(err => console.log('  -', err));
      failed++;
    }
  } catch (error) {
    console.log('✗ FAILED: Exception thrown:', error.message);
    failed++;
  }
  console.log();

  // Test 4: Punjab Grill order
  console.log('Test 4: Punjab Grill order with multiple quantities');
  try {
    const state = {
      participantId: 'P004',
      experimentId: 'EXP004',
      cart: {
        'pg1': 2,  // 2x Butter Chicken
        'pg3': 4   // 4x Garlic Naan
      }
    };
    
    const payload = buildOrderPayload(state, 'punjab-grill');
    const errors = validatePayloadStructure(payload);
    
    if (errors.length === 0) {
      console.log('✓ PASSED: Payload structure is correct');
      console.log('  Payload:', JSON.stringify(payload, null, 2));
      passed++;
    } else {
      console.log('✗ FAILED: Payload structure errors:');
      errors.forEach(err => console.log('  -', err));
      failed++;
    }
  } catch (error) {
    console.log('✗ FAILED: Exception thrown:', error.message);
    failed++;
  }
  console.log();

  // Test 5: Verify cart item properties match expected format
  console.log('Test 5: Verify cart item properties are exactly as expected');
  try {
    const state = {
      participantId: 'P005',
      experimentId: 'EXP005',
      cart: {
        'ph2': 1  // 1x Pepperoni Pizza
      }
    };
    
    const payload = buildOrderPayload(state, 'pizza-hut');
    const cartItem = payload.cart[0];
    
    const expectedKeys = ['itemId', 'name', 'price', 'quantity'];
    const actualKeys = Object.keys(cartItem).sort();
    const expectedKeysSorted = expectedKeys.sort();
    
    if (JSON.stringify(actualKeys) === JSON.stringify(expectedKeysSorted)) {
      console.log('✓ PASSED: Cart item has exactly the expected properties');
      console.log('  Expected:', expectedKeys);
      console.log('  Actual:', actualKeys);
      passed++;
    } else {
      console.log('✗ FAILED: Cart item properties mismatch');
      console.log('  Expected:', expectedKeys);
      console.log('  Actual:', actualKeys);
      failed++;
    }
  } catch (error) {
    console.log('✗ FAILED: Exception thrown:', error.message);
    failed++;
  }
  console.log();

  // Summary
  console.log('=== Test Summary ===');
  console.log(`Total: ${passed + failed}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  console.log();

  if (failed === 0) {
    console.log('✓ All tests passed! Order placement API is compatible with restaurant-specific items.');
    process.exit(0);
  } else {
    console.log('✗ Some tests failed. Please review the errors above.');
    process.exit(1);
  }
}

// Run the tests
runTests();
