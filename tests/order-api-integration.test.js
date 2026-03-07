/**
 * Integration Test: Order Placement API with Backend
 * 
 * This test verifies that the order placement API endpoint accepts
 * and processes restaurant-specific menu items correctly.
 * 
 * Requirements: 7.1 - Backward Compatibility
 * 
 * Note: This test requires the backend server to be running.
 */

const http = require('http');

const RESTAURANTS = {
  'pizza-hut': {
    name: 'Pizza Hut',
    items: [
      { id: 'ph1', name: 'Margherita Pizza', price: 299 },
      { id: 'ph2', name: 'Pepperoni Pizza', price: 399 }
    ]
  },
  'burger-king': {
    name: 'Burger King',
    items: [
      { id: 'bk1', name: 'Whopper', price: 189 },
      { id: 'bk2', name: 'Chicken Royale', price: 179 }
    ]
  }
};

/**
 * Make a POST request to the order API
 */
function placeOrder(payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/order',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(body);
          resolve({ statusCode: res.statusCode, body: response });
        } catch (error) {
          reject(new Error(`Failed to parse response: ${body}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(data);
    req.end();
  });
}

/**
 * Check if server is running
 */
function checkServer() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3000/', (res) => {
      resolve(true);
    });
    
    req.on('error', () => {
      resolve(false);
    });
    
    req.end();
  });
}

/**
 * Run integration tests
 */
async function runTests() {
  console.log('=== Order Placement API Integration Tests ===\n');

  // Check if server is running
  console.log('Checking if backend server is running...');
  const serverRunning = await checkServer();
  
  if (!serverRunning) {
    console.log('✗ Backend server is not running on localhost:3000');
    console.log('  Please start the server with: npm start');
    console.log('  Skipping integration tests.');
    process.exit(0);
  }
  console.log('✓ Backend server is running\n');

  let passed = 0;
  let failed = 0;

  // Test 1: Place order with Pizza Hut items
  console.log('Test 1: Place order with Pizza Hut items');
  try {
    const payload = {
      participantId: 'TEST_P001',
      experimentId: 'TEST_EXP001',
      cart: [
        {
          itemId: 'ph1',
          name: 'Margherita Pizza',
          price: 299,
          quantity: 2
        },
        {
          itemId: 'ph2',
          name: 'Pepperoni Pizza',
          price: 399,
          quantity: 1
        }
      ]
    };

    const response = await placeOrder(payload);
    
    if (response.statusCode === 200 || response.statusCode === 201) {
      console.log('✓ PASSED: Order placed successfully');
      console.log('  Status:', response.statusCode);
      console.log('  Response:', JSON.stringify(response.body, null, 2));
      passed++;
    } else {
      console.log('✗ FAILED: Unexpected status code');
      console.log('  Expected: 200 or 201');
      console.log('  Actual:', response.statusCode);
      console.log('  Response:', JSON.stringify(response.body, null, 2));
      failed++;
    }
  } catch (error) {
    console.log('✗ FAILED: Exception thrown:', error.message);
    failed++;
  }
  console.log();

  // Test 2: Place order with Burger King items
  console.log('Test 2: Place order with Burger King items');
  try {
    const payload = {
      participantId: 'TEST_P002',
      experimentId: 'TEST_EXP002',
      cart: [
        {
          itemId: 'bk1',
          name: 'Whopper',
          price: 189,
          quantity: 1
        }
      ]
    };

    const response = await placeOrder(payload);
    
    if (response.statusCode === 200 || response.statusCode === 201) {
      console.log('✓ PASSED: Order placed successfully');
      console.log('  Status:', response.statusCode);
      console.log('  Response:', JSON.stringify(response.body, null, 2));
      passed++;
    } else {
      console.log('✗ FAILED: Unexpected status code');
      console.log('  Expected: 200 or 201');
      console.log('  Actual:', response.statusCode);
      console.log('  Response:', JSON.stringify(response.body, null, 2));
      failed++;
    }
  } catch (error) {
    console.log('✗ FAILED: Exception thrown:', error.message);
    failed++;
  }
  console.log();

  // Test 3: Verify empty cart is rejected
  console.log('Test 3: Verify empty cart is rejected');
  try {
    const payload = {
      participantId: 'TEST_P003',
      experimentId: 'TEST_EXP003',
      cart: []
    };

    const response = await placeOrder(payload);
    
    if (response.statusCode === 400) {
      console.log('✓ PASSED: Empty cart rejected as expected');
      console.log('  Status:', response.statusCode);
      console.log('  Response:', JSON.stringify(response.body, null, 2));
      passed++;
    } else {
      console.log('✗ FAILED: Empty cart should be rejected with 400');
      console.log('  Expected: 400');
      console.log('  Actual:', response.statusCode);
      console.log('  Response:', JSON.stringify(response.body, null, 2));
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
    console.log('✓ All integration tests passed! Backend API is compatible with restaurant-specific items.');
    process.exit(0);
  } else {
    console.log('✗ Some tests failed. Please review the errors above.');
    process.exit(1);
  }
}

// Run the tests
runTests().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
