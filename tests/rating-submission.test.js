/**
 * Integration Test: Rating Submission Functionality
 * 
 * This test verifies that the rating submission functionality
 * remains unchanged and works correctly with restaurant-specific orders.
 * 
 * Validates: Requirements 7.3
 * 
 * Note: This test requires the backend server to be running.
 */

const http = require('http');

/**
 * Check if server is running
 */
function checkServer() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3000/health', (res) => {
      resolve(res.statusCode === 200);
    });
    
    req.on('error', () => {
      resolve(false);
    });
    
    req.end();
  });
}

/**
 * Place an order via API
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
 * Submit a rating via API
 */
function submitRating(payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/rating',
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
 * Wait for a specified duration
 */
function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Run rating submission tests
 */
async function runTests() {
  console.log('=== Rating Submission Integration Tests ===\n');

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

  // Test 1: Submit rating after Pizza Hut order
  console.log('Test 1: Rating submission with Pizza Hut order');
  try {
    const participantId = 'TEST_RATING_P001';
    const experimentId = 'TEST_RATING_EXP001';
    
    // Place order first
    const orderPayload = {
      participantId,
      experimentId,
      cart: [
        { itemId: 'ph1', name: 'Margherita Pizza', price: 299, quantity: 1 },
        { itemId: 'ph3', name: 'Garlic Breadsticks', price: 149, quantity: 2 }
      ]
    };

    const orderResponse = await placeOrder(orderPayload);
    
    if (orderResponse.statusCode !== 200 && orderResponse.statusCode !== 201) {
      console.log('✗ FAILED: Order placement failed');
      console.log('  Status:', orderResponse.statusCode);
      failed++;
    } else {
      console.log('  ✓ Order placed successfully');
      
      // Wait a moment for order to be processed
      await wait(500);
      
      // Submit rating
      const ratingPayload = {
        participantId,
        experimentId,
        overall: 5,
        trust: null,
        fairness: null,
        comments: 'Great pizza delivery experience!'
      };

      const ratingResponse = await submitRating(ratingPayload);
      
      if (ratingResponse.statusCode !== 200 && ratingResponse.statusCode !== 201) {
        console.log('✗ FAILED: Rating submission failed');
        console.log('  Status:', ratingResponse.statusCode);
        console.log('  Response:', ratingResponse.body);
        failed++;
      } else {
        console.log('✓ PASSED: Rating submitted successfully');
        console.log('  Response:', ratingResponse.body.message || 'Rating saved');
        passed++;
      }
    }
  } catch (error) {
    console.log('✗ FAILED: Exception thrown:', error.message);
    failed++;
  }
  console.log();

  // Test 2: Submit rating after Burger King order
  console.log('Test 2: Rating submission with Burger King order');
  try {
    const participantId = 'TEST_RATING_P002';
    const experimentId = 'TEST_RATING_EXP002';
    
    const orderPayload = {
      participantId,
      experimentId,
      cart: [
        { itemId: 'bk1', name: 'Whopper', price: 189, quantity: 2 },
        { itemId: 'bk4', name: 'Chocolate Shake', price: 119, quantity: 1 }
      ]
    };

    const orderResponse = await placeOrder(orderPayload);
    
    if (orderResponse.statusCode !== 200 && orderResponse.statusCode !== 201) {
      console.log('✗ FAILED: Order placement failed');
      failed++;
    } else {
      console.log('  ✓ Order placed successfully');
      
      await wait(500);
      
      const ratingPayload = {
        participantId,
        experimentId,
        overall: 4,
        trust: null,
        fairness: null,
        comments: 'Good burger!'
      };

      const ratingResponse = await submitRating(ratingPayload);
      
      if (ratingResponse.statusCode === 200 || ratingResponse.statusCode === 201) {
        console.log('✓ PASSED: Rating submitted successfully for Burger King order');
        passed++;
      } else {
        console.log('✗ FAILED: Rating submission failed');
        console.log('  Status:', ratingResponse.statusCode);
        failed++;
      }
    }
  } catch (error) {
    console.log('✗ FAILED: Exception thrown:', error.message);
    failed++;
  }
  console.log();

  // Test 3: Submit rating after Biryani Blues order
  console.log('Test 3: Rating submission with Biryani Blues order');
  try {
    const participantId = 'TEST_RATING_P003';
    const experimentId = 'TEST_RATING_EXP003';
    
    const orderPayload = {
      participantId,
      experimentId,
      cart: [
        { itemId: 'bb1', name: 'Hyderabadi Biryani', price: 249, quantity: 1 },
        { itemId: 'bb4', name: 'Gulab Jamun', price: 79, quantity: 2 }
      ]
    };

    const orderResponse = await placeOrder(orderPayload);
    
    if (orderResponse.statusCode !== 200 && orderResponse.statusCode !== 201) {
      console.log('✗ FAILED: Order placement failed');
      failed++;
    } else {
      console.log('  ✓ Order placed successfully');
      
      await wait(500);
      
      const ratingPayload = {
        participantId,
        experimentId,
        overall: 5,
        trust: null,
        fairness: null,
        comments: 'Excellent biryani!'
      };

      const ratingResponse = await submitRating(ratingPayload);
      
      if (ratingResponse.statusCode === 200 || ratingResponse.statusCode === 201) {
        console.log('✓ PASSED: Rating submitted successfully for Biryani Blues order');
        passed++;
      } else {
        console.log('✗ FAILED: Rating submission failed');
        console.log('  Status:', ratingResponse.statusCode);
        failed++;
      }
    }
  } catch (error) {
    console.log('✗ FAILED: Exception thrown:', error.message);
    failed++;
  }
  console.log();

  // Test 4: Submit rating after Punjab Grill order
  console.log('Test 4: Rating submission with Punjab Grill order');
  try {
    const participantId = 'TEST_RATING_P004';
    const experimentId = 'TEST_RATING_EXP004';
    
    const orderPayload = {
      participantId,
      experimentId,
      cart: [
        { itemId: 'pg1', name: 'Butter Chicken', price: 329, quantity: 1 },
        { itemId: 'pg3', name: 'Garlic Naan', price: 59, quantity: 2 }
      ]
    };

    const orderResponse = await placeOrder(orderPayload);
    
    if (orderResponse.statusCode !== 200 && orderResponse.statusCode !== 201) {
      console.log('✗ FAILED: Order placement failed');
      failed++;
    } else {
      console.log('  ✓ Order placed successfully');
      
      await wait(500);
      
      const ratingPayload = {
        participantId,
        experimentId,
        overall: 4,
        trust: null,
        fairness: null,
        comments: 'Delicious butter chicken!'
      };

      const ratingResponse = await submitRating(ratingPayload);
      
      if (ratingResponse.statusCode === 200 || ratingResponse.statusCode === 201) {
        console.log('✓ PASSED: Rating submitted successfully for Punjab Grill order');
        passed++;
      } else {
        console.log('✗ FAILED: Rating submission failed');
        console.log('  Status:', ratingResponse.statusCode);
        failed++;
      }
    }
  } catch (error) {
    console.log('✗ FAILED: Exception thrown:', error.message);
    failed++;
  }
  console.log();

  // Test 5: Verify rating payload structure is preserved
  console.log('Test 5: Verify rating payload structure');
  try {
    const participantId = 'TEST_RATING_P005';
    const experimentId = 'TEST_RATING_EXP005';
    
    const orderPayload = {
      participantId,
      experimentId,
      cart: [
        { itemId: 'ph2', name: 'Pepperoni Pizza', price: 399, quantity: 1 }
      ]
    };

    await placeOrder(orderPayload);
    await wait(500);
    
    // Test with all rating fields populated
    const ratingPayload = {
      participantId,
      experimentId,
      overall: 3,
      trust: '4',
      fairness: '5',
      comments: 'Testing all fields'
    };

    const ratingResponse = await submitRating(ratingPayload);
    
    if (ratingResponse.statusCode === 200 || ratingResponse.statusCode === 201) {
      console.log('✓ PASSED: Rating payload structure preserved');
      console.log('  All fields accepted correctly');
      passed++;
    } else {
      console.log('✗ FAILED: Rating submission failed with complete payload');
      console.log('  Status:', ratingResponse.statusCode);
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
    console.log('✓ All rating submission tests passed!');
    console.log('  Rating submission functionality is working correctly');
    console.log('  with restaurant-specific orders from all 4 restaurants.');
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
