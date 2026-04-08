const assert = require('assert');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const repoRoot = path.resolve(__dirname, '..');
const pythonCommand = process.env.PYTHON || 'python';
const basePort = 4300 + Math.floor(Math.random() * 200);
const bridgePort = basePort + 1000;
const serverPort = basePort;
const fallbackServerPort = basePort + 1;
const bridgeLogPath = path.join(repoRoot, 'backend', 'data', 'eeg-trigger-test-log.csv');

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function spawnProcess(command, args, env) {
  const child = spawn(command, args, {
    cwd: repoRoot,
    env: {
      ...process.env,
      ...env
    },
    stdio: ['ignore', 'pipe', 'pipe']
  });

  let output = '';
  child.stdout.on('data', (chunk) => {
    output += chunk.toString();
  });
  child.stderr.on('data', (chunk) => {
    output += chunk.toString();
  });

  child.getOutput = () => output;
  return child;
}

async function stopProcess(child) {
  if (!child || child.exitCode !== null) {
    return;
  }

  child.kill();
  const exited = await Promise.race([
    new Promise((resolve) => child.once('exit', () => resolve(true))),
    sleep(2000).then(() => false)
  ]);

  if (exited) {
    return;
  }

  const killer = spawn('taskkill', ['/pid', String(child.pid), '/t', '/f'], {
    stdio: 'ignore'
  });
  await new Promise((resolve) => killer.on('exit', resolve));
}

async function waitForJson(url, label, timeoutMs = 10000) {
  const startedAt = Date.now();
  let lastError = null;

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return response.json();
      }
      lastError = new Error(`status ${response.status}`);
    } catch (error) {
      lastError = error;
    }

    await sleep(100);
  }

  throw new Error(`Timed out waiting for ${label}: ${lastError ? lastError.message : 'unknown'}`);
}

async function requestJson(url, { method = 'GET', body } = {}) {
  const response = await fetch(url, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined
  });

  const text = await response.text();
  return {
    status: response.status,
    body: text ? JSON.parse(text) : {}
  };
}

async function waitForOrderDelivered(participantId, experimentId, timeoutMs = 10000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const response = await requestJson(
      `http://127.0.0.1:${serverPort}/api/order?participantId=${encodeURIComponent(participantId)}&experimentId=${encodeURIComponent(experimentId)}`
    );

    if (response.status === 200 && response.body.order && response.body.order.status === 'delivered') {
      return response.body;
    }

    await sleep(50);
  }

  throw new Error('Timed out waiting for delivered order');
}

function readCsvRows(csvPath) {
  const content = fs.readFileSync(csvPath, 'utf8').trim();
  const lines = content.split(/\r?\n/);
  const headers = lines[0].split(',');

  return lines.slice(1).filter(Boolean).map((line) => {
    const values = line.split(',');
    return headers.reduce((row, header, index) => {
      row[header] = values[index] || '';
      return row;
    }, {});
  });
}

function countRows(rows, eventName) {
  return rows.filter((row) => row.eventName === eventName).length;
}

async function main() {
  if (fs.existsSync(bridgeLogPath)) {
    fs.unlinkSync(bridgeLogPath);
  }

  const bridge = spawnProcess(
    pythonCommand,
    [
      'tools/eeg_trigger_bridge.py',
      '--mode',
      'dry-run',
      '--port',
      String(bridgePort),
      '--log-path',
      bridgeLogPath
    ],
    {}
  );

  const server = spawnProcess(
    'node',
    ['backend/server.js'],
    {
      PORT: String(serverPort),
      EEG_TRIGGER_MODE: 'bridge',
      EEG_TRIGGER_BRIDGE_URL: `http://127.0.0.1:${bridgePort}`,
      SIMULATION_INITIAL_ETA_MIN: '1',
      SIMULATION_TICK_INTERVAL_MS: '25',
      SIMULATION_DISPLAY_UPDATE_INTERVAL_TICKS: '1',
      SIMULATION_BEHAVIOR: 'normal'
    }
  );

  const participantId = `P-EEG-${Date.now()}`;
  const experimentId = `EEG-${Date.now()}`;

  try {
    await waitForJson(`http://127.0.0.1:${bridgePort}/health`, 'bridge health');
    await waitForJson(`http://127.0.0.1:${serverPort}/health`, 'server health');

    const frontendEvents = [
      'trial_start',
      'fixation_start',
      'transition_onset',
      'restaurants_onset',
      'menu_onset',
      'stimulus_onset',
      'delivery_onset',
      'rating_onset',
      'response_made'
    ];

    for (const eventName of frontendEvents) {
      const response = await requestJson(`http://127.0.0.1:${serverPort}/api/experiment-event`, {
        method: 'POST',
        body: {
          eventName,
          participantId,
          experimentId,
          source: 'test_frontend'
        }
      });

      assert.strictEqual(response.status, 202, `${eventName} should be accepted`);
    }

    const orderResponse = await requestJson(`http://127.0.0.1:${serverPort}/api/order`, {
      method: 'POST',
      body: {
        participantId,
        experimentId,
        cart: [
          {
            itemId: 'ph1',
            name: 'Margherita Pizza',
            price: 299,
            quantity: 1
          }
        ]
      }
    });
    assert.strictEqual(orderResponse.status, 201, 'order should be created successfully');

    await waitForOrderDelivered(participantId, experimentId);

    const ratingResponse = await requestJson(`http://127.0.0.1:${serverPort}/api/rating`, {
      method: 'POST',
      body: {
        participantId,
        experimentId,
        overall: 5,
        comments: 'EEG trigger integration test'
      }
    });
    assert.strictEqual(ratingResponse.status, 201, 'rating should be submitted successfully');

    await sleep(250);

    const rows = readCsvRows(bridgeLogPath);
    const expectedEvents = [
      'trial_start',
      'fixation_start',
      'transition_onset',
      'restaurants_onset',
      'menu_onset',
      'stimulus_onset',
      'delivery_onset',
      'rating_onset',
      'response_made',
      'order_created',
      'order_delivered',
      'rating_submitted'
    ];

    for (const eventName of expectedEvents) {
      assert.strictEqual(countRows(rows, eventName), 1, `${eventName} should be logged exactly once`);
    }
  } finally {
    await stopProcess(server);
    await stopProcess(bridge);
  }

  const fallbackServer = spawnProcess(
    'node',
    ['backend/server.js'],
    {
      PORT: String(fallbackServerPort),
      EEG_TRIGGER_MODE: 'bridge',
      EEG_TRIGGER_BRIDGE_URL: 'http://127.0.0.1:59999',
      SIMULATION_INITIAL_ETA_MIN: '1',
      SIMULATION_TICK_INTERVAL_MS: '25',
      SIMULATION_DISPLAY_UPDATE_INTERVAL_TICKS: '1'
    }
  );

  try {
    await waitForJson(`http://127.0.0.1:${fallbackServerPort}/health`, 'fallback server health');

    const participantId = `P-EEG-OFFLINE-${Date.now()}`;
    const experimentId = `EEG-OFFLINE-${Date.now()}`;

    const eventResponse = await requestJson(
      `http://127.0.0.1:${fallbackServerPort}/api/experiment-event`,
      {
        method: 'POST',
        body: {
          eventName: 'transition_onset',
          participantId,
          experimentId,
          source: 'test_frontend'
        }
      }
    );
    assert.strictEqual(eventResponse.status, 202, 'frontend event should still be accepted when bridge is offline');

    const orderResponse = await requestJson(`http://127.0.0.1:${fallbackServerPort}/api/order`, {
      method: 'POST',
      body: {
        participantId,
        experimentId,
        cart: [
          {
            itemId: 'ph2',
            name: 'Pepperoni Pizza',
            price: 399,
            quantity: 1
          }
        ]
      }
    });
    assert.strictEqual(orderResponse.status, 201, 'order should still succeed when bridge is offline');

    const ratingResponse = await requestJson(`http://127.0.0.1:${fallbackServerPort}/api/rating`, {
      method: 'POST',
      body: {
        participantId,
        experimentId,
        overall: 4,
        comments: 'Offline bridge fallback test'
      }
    });
    assert.strictEqual(ratingResponse.status, 201, 'rating should still succeed when bridge is offline');
  } finally {
    await stopProcess(fallbackServer);
  }

  console.log('EEG trigger integration tests passed');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
