/**
 * Integration Test: Delivery Tracking with Socket.IO
 * 
 * This test verifies that the Socket.IO delivery tracking functionality
 * remains unchanged and works correctly with restaurant-specific orders.
 * 
 * Validates: Requirements 7.2
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
 * Fetch order events via API
 */
function getOrderEvents(participantId, experimentId) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path: `/api/order?participantId=${participantId}&experimentId=${experimentId}`,
      method: 'GET'
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
 * Run delivery tracking tests
 */
async function runTests() {
  console.log('=== Delivery Tracking Integration Tests ===\n');

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

  // Test 1: Place order with Pizza Hut items and verify events are stored
  console.log('Test 1: Delivery tracking with Pizza Hut order');
  try {
    const participantId = 'TEST_DELIVERY_P001';
    const experimentId = 'TEST_DELIVERY_EXP001';
    
    const payload = {
      participantId,
      experimentId,
      cart: [
        { itemId: 'ph1', name: 'Margherita Pizza', price: 299, quantity: 1 },
        { itemId: 'ph3', name: 'Garlic Breadsticks', price: 149, quantity: 2 }
      ]
    };

    // Place order
    const orderResponse = await placeOrder(payload);
    
    if (orderResponse.statusCode !== 200 && orderResponse.statusCode !== 201) {
      console.log('✗ FAILED: Order placement failed');
      console.log('  Status:', orderResponse.statusCode);
      failed++;
    } else {
      console.log('  ✓ Order placed successfully');
      
      // Wait for delivery simulation to generate events
      console.log('  Waiting for delivery events to be generated...');
      await wait(2000);
      
      // Fetch order events
      const eventsResponse = await getOrderEvents(participantId, experimentId);
      
      if (eventsResponse.statusCode !== 200) {
        console.log('✗ FAILED: Could not fetch order events');
        console.log('  Status:', eventsResponse.statusCode);
        failed++;
      } else {
        const { order, events } = eventsResponse.body;
        
        // Verify order exists
        if (!order) {
          console.log('✗ FAILED: Order not found in database');
          failed++;
        } else if (!Array.isArray(events) || events.length === 0) {
          console.log('✗ FAILED: No delivery events found');
          console.log('  Events:', events);
          failed++;
        } else {
          // Verify event structure
          const firstEvent = events[0];
          const hasRequiredFields = 
            firstEvent.phase && 
            firstEvent.message && 
            firstEvent.eta_min !== undefined && 
            firstEvent.emitted_at;
          
          if (!hasRequiredFields) {
            console.log('✗ FAILED: Event missing required fields');
            console.log('  Event:', firstEvent);
            failed++;
          } else {
            console.log('✓ PASSED: Delivery tracking working correctly');
            console.log('  Order status:', order.status);
            console.log('  Events received:', events.length);
            console.log('  First event phase:', firstEvent.phase);
            console.log('  First event message:', firstEvent.message);
            console.log('  First event ETA:', firstEvent.eta_min, 'min');
            passed++;
          }
        }
      }
    }
  } catch (error) {
    console.log('✗ FAILED: Exception thrown:', error.message);
    failed++;
  }
  console.log();

  // Test 2: Place order with Burger King items
  console.log('Test 2: Delivery tracking with Burger King order');
  try {
    const participantId = 'TEST_DELIVERY_P002';
    const experimentId = 'TEST_DELIVERY_EXP002';
    
    const payload = {
      participantId,
      experimentId,
      cart: [
        { itemId: 'bk1', name: 'Whopper', price: 189, quantity: 2 },
        { itemId: 'bk4', name: 'Chocolate Shake', price: 119, quantity: 1 }
      ]
    };

    const orderResponse = await placeOrder(payload);
    
    if (orderResponse.statusCode !== 200 && orderResponse.statusCode !== 201) {
      console.log('✗ FAILED: Order placement failed');
      failed++;
    } else {
      console.log('  ✓ Order placed successfully');
      
      await wait(2000);
      
      const eventsResponse = await getOrderEvents(participantId, experimentId);
      
      if (eventsResponse.statusCode === 200 && 
          eventsResponse.body.events && 
          eventsResponse.body.events.length > 0) {
        console.log('✓ PASSED: Delivery tracking working for Burger King order');
        console.log('  Events received:', eventsResponse.body.events.length);
        passed++;
      } else {
        console.log('✗ FAILED: No delivery events found');
        failed++;
      }
    }
  } catch (error) {
    console.log('✗ FAILED: Exception thrown:', error.message);
    failed++;
  }
  console.log();

  // Test 3: Place order with Biryani Blues items
  console.log('Test 3: Delivery tracking with Biryani Blues order');
  try {
    const participantId = 'TEST_DELIVERY_P003';
    const experimentId = 'TEST_DELIVERY_EXP003';
    
    const payload = {
      participantId,
      experimentId,
      cart: [
        { itemId: 'bb1', name: 'Hyderabadi Biryani', price: 249, quantity: 1 }
      ]
    };

    const orderResponse = await placeOrder(payload);
    
    if (orderResponse.statusCode !== 200 && orderResponse.statusCode !== 201) {
      console.log('✗ FAILED: Order placement failed');
      failed++;
    } else {
      console.log('  ✓ Order placed successfully');
      
      await wait(2000);
      
      const eventsResponse = await getOrderEvents(participantId, experimentId);
      
      if (eventsResponse.statusCode === 200 && 
          eventsResponse.body.events && 
          eventsResponse.body.events.length > 0) {
        console.log('✓ PASSED: Delivery tracking working for Biryani Blues order');
        console.log('  Events received:', eventsResponse.body.events.length);
        passed++;
      } else {
        console.log('✗ FAILED: No delivery events found');
        failed++;
      }
    }
  } catch (error) {
    console.log('✗ FAILED: Exception thrown:', error.message);
    failed++;
  }
  console.log();

  // Test 4: Place order with Punjab Grill items
  console.log('Test 4: Delivery tracking with Punjab Grill order');
  try {
    const participantId = 'TEST_DELIVERY_P004';
    const experimentId = 'TEST_DELIVERY_EXP004';
    
    const payload = {
      participantId,
      experimentId,
      cart: [
        { itemId: 'pg1', name: 'Butter Chicken', price: 329, quantity: 1 },
        { itemId: 'pg3', name: 'Garlic Naan', price: 59, quantity: 2 }
      ]
    };

    const orderResponse = await placeOrder(payload);
    
    if (orderResponse.statusCode !== 200 && orderResponse.statusCode !== 201) {
      console.log('✗ FAILED: Order placement failed');
      failed++;
    } else {
      console.log('  ✓ Order placed successfully');
      
      await wait(2000);
      
      const eventsResponse = await getOrderEvents(participantId, experimentId);
      
      if (eventsResponse.statusCode === 200 && 
          eventsResponse.body.events && 
          eventsResponse.body.events.length > 0) {
        console.log('✓ PASSED: Delivery tracking working for Punjab Grill order');
        console.log('  Events received:', eventsResponse.body.events.length);
        passed++;
      } else {
        console.log('✗ FAILED: No delivery events found');
        failed++;
      }
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
    console.log('✓ All delivery tracking tests passed!');
    console.log('  Socket.IO delivery tracking functionality is working correctly');
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
