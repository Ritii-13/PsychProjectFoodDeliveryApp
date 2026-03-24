const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();

const dataDir = path.join(__dirname, 'data');
const dbPath = path.join(dataDir, 'experiment.db');

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const connection = new sqlite3.Database(dbPath);

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    connection.run(sql, params, function onRun(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this);
    });
  });
}

function get(sql, params = []) {
  return new Promise((resolve, reject) => {
    connection.get(sql, params, (err, row) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(row);
    });
  });
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    connection.all(sql, params, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      resolve(rows);
    });
  });
}

function tableName(name) {
  return name.replace(/[^a-zA-Z0-9_]/g, '');
}

async function tableExists(name) {
  const row = await get(
    "SELECT name FROM sqlite_master WHERE type = 'table' AND name = ?",
    [tableName(name)]
  );
  return Boolean(row);
}

async function getTableColumns(name) {
  return all(`PRAGMA table_info(${tableName(name)})`);
}

async function createTables() {
  await run(`
    CREATE TABLE IF NOT EXISTS orders (
      participant_id TEXT NOT NULL,
      experiment_id TEXT NOT NULL,
      condition_certainty TEXT NOT NULL,
      condition_agency TEXT NOT NULL,
      condition_emotion TEXT NOT NULL,
      cart_json TEXT NOT NULL,
      initial_eta_min INTEGER NOT NULL DEFAULT 0,
      eta_behavior TEXT NOT NULL DEFAULT 'normal',
      simulation_input_json TEXT NOT NULL DEFAULT '{}',
      status TEXT NOT NULL DEFAULT 'created',
      created_at TEXT NOT NULL,
      delivered_at TEXT,
      PRIMARY KEY (participant_id, experiment_id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS order_events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      participant_id TEXT NOT NULL,
      experiment_id TEXT NOT NULL,
      phase TEXT NOT NULL,
      message TEXT NOT NULL,
      eta_min INTEGER,
      emitted_at TEXT NOT NULL,
      FOREIGN KEY(participant_id, experiment_id)
        REFERENCES orders(participant_id, experiment_id)
    )
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS ratings (
      participant_id TEXT NOT NULL,
      experiment_id TEXT NOT NULL,
      rating_overall INTEGER NOT NULL,
      rating_trust INTEGER,
      rating_fairness INTEGER,
      comments TEXT,
      submitted_at TEXT NOT NULL,
      PRIMARY KEY (participant_id, experiment_id),
      FOREIGN KEY(participant_id, experiment_id)
        REFERENCES orders(participant_id, experiment_id)
    )
  `);
}

async function ensureOrderColumns() {
  const columns = await getTableColumns('orders');
  const columnNames = new Set(columns.map((column) => column.name));

  if (!columnNames.has('initial_eta_min')) {
    await run('ALTER TABLE orders ADD COLUMN initial_eta_min INTEGER NOT NULL DEFAULT 0');
  }

  if (!columnNames.has('eta_behavior')) {
    await run("ALTER TABLE orders ADD COLUMN eta_behavior TEXT NOT NULL DEFAULT 'normal'");
  }

  if (!columnNames.has('simulation_input_json')) {
    await run("ALTER TABLE orders ADD COLUMN simulation_input_json TEXT NOT NULL DEFAULT '{}'");
  }
}

async function hasCompositeSessionKey() {
  const columns = await getTableColumns('orders');
  if (!columns.length) {
    return false;
  }

  const pkColumns = columns
    .filter((column) => column.pk > 0)
    .sort((left, right) => left.pk - right.pk)
    .map((column) => column.name);

  return (
    pkColumns.length === 2 &&
    pkColumns[0] === 'participant_id' &&
    pkColumns[1] === 'experiment_id'
  );
}

async function migrateLegacySchema() {
  const hasOrders = await tableExists('orders');
  if (!hasOrders) {
    return;
  }

  const hasOrderEvents = await tableExists('order_events');
  const hasRatings = await tableExists('ratings');

  await run('PRAGMA foreign_keys = OFF');

  try {
    await run('ALTER TABLE orders RENAME TO legacy_orders');
    if (hasOrderEvents) {
      await run('ALTER TABLE order_events RENAME TO legacy_order_events');
    }
    if (hasRatings) {
      await run('ALTER TABLE ratings RENAME TO legacy_ratings');
    }

    await createTables();

    await run(`
      INSERT INTO orders (
        participant_id,
        experiment_id,
        condition_certainty,
        condition_agency,
        condition_emotion,
        cart_json,
        status,
        created_at,
        delivered_at
      )
      SELECT
        participant_id,
        'LEGACY-' || CAST(id AS TEXT),
        condition_certainty,
        condition_agency,
        condition_emotion,
        cart_json,
        status,
        created_at,
        delivered_at
      FROM legacy_orders
    `);

    if (hasOrderEvents) {
      await run(`
        INSERT INTO order_events (
          participant_id,
          experiment_id,
          phase,
          message,
          eta_min,
          emitted_at
        )
        SELECT
          o.participant_id,
          'LEGACY-' || CAST(o.id AS TEXT),
          e.phase,
          e.message,
          e.eta_min,
          e.emitted_at
        FROM legacy_order_events e
        JOIN legacy_orders o ON o.id = e.order_id
      `);
    }

    if (hasRatings) {
      await run(`
        INSERT OR REPLACE INTO ratings (
          participant_id,
          experiment_id,
          rating_overall,
          rating_trust,
          rating_fairness,
          comments,
          submitted_at
        )
        SELECT
          o.participant_id,
          'LEGACY-' || CAST(o.id AS TEXT),
          r.rating_overall,
          r.rating_trust,
          r.rating_fairness,
          r.comments,
          r.submitted_at
        FROM legacy_ratings r
        JOIN legacy_orders o ON o.id = r.order_id
      `);
    }

    if (hasOrderEvents) {
      await run('DROP TABLE legacy_order_events');
    }
    if (hasRatings) {
      await run('DROP TABLE legacy_ratings');
    }
    await run('DROP TABLE legacy_orders');
  } finally {
    await run('PRAGMA foreign_keys = ON');
  }
}

async function init() {
  await run('PRAGMA foreign_keys = ON');

  if (await tableExists('orders')) {
    const hasNewPrimaryKey = await hasCompositeSessionKey();
    if (!hasNewPrimaryKey) {
      await migrateLegacySchema();
    }
  }

  await createTables();
  await ensureOrderColumns();
}

async function createOrder({ participantId, experimentId, condition, cart, simulationInput }) {
  const createdAt = new Date().toISOString();
  const initialEtaMin = Number.isInteger(simulationInput && simulationInput.initialEtaMin)
    ? simulationInput.initialEtaMin
    : 0;
  const etaBehavior =
    simulationInput && typeof simulationInput.behavior === 'string'
      ? simulationInput.behavior
      : 'normal';
  const simulationInputJson = JSON.stringify(simulationInput || {});

  await run(
    `
      INSERT INTO orders (
        participant_id,
        experiment_id,
        condition_certainty,
        condition_agency,
        condition_emotion,
        cart_json,
        initial_eta_min,
        eta_behavior,
        simulation_input_json,
        status,
        created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'created', ?)
    `,
    [
      participantId,
      experimentId,
      condition.certainty,
      condition.agency,
      condition.emotion,
      JSON.stringify(cart),
      initialEtaMin,
      etaBehavior,
      simulationInputJson,
      createdAt
    ]
  );

  return { participantId, experimentId };
}

function insertOrderEvent({ participantId, experimentId, phase, message, etaMin }) {
  return run(
    `
      INSERT INTO order_events (
        participant_id,
        experiment_id,
        phase,
        message,
        eta_min,
        emitted_at
      )
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    [participantId, experimentId, phase, message, etaMin, new Date().toISOString()]
  );
}

function setOrderStatus(participantId, experimentId, status) {
  return run(
    'UPDATE orders SET status = ? WHERE participant_id = ? AND experiment_id = ?',
    [status, participantId, experimentId]
  );
}

function markOrderDelivered(participantId, experimentId) {
  const now = new Date().toISOString();
  return run(
    `
      UPDATE orders
      SET status = ?, delivered_at = ?
      WHERE participant_id = ? AND experiment_id = ?
    `,
    ['delivered', now, participantId, experimentId]
  );
}

function getOrder(participantId, experimentId) {
  return get(
    `
      SELECT *
      FROM orders
      WHERE participant_id = ? AND experiment_id = ?
    `,
    [participantId, experimentId]
  );
}

function getOrderEvents(participantId, experimentId) {
  return all(
    `
      SELECT *
      FROM order_events
      WHERE participant_id = ? AND experiment_id = ?
      ORDER BY id ASC
    `,
    [participantId, experimentId]
  );
}

function saveRating({ participantId, experimentId, overall, trust, fairness, comments }) {
  return run(
    `
      INSERT INTO ratings (
        participant_id,
        experiment_id,
        rating_overall,
        rating_trust,
        rating_fairness,
        comments,
        submitted_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(participant_id, experiment_id) DO UPDATE SET
        rating_overall = excluded.rating_overall,
        rating_trust = excluded.rating_trust,
        rating_fairness = excluded.rating_fairness,
        comments = excluded.comments,
        submitted_at = excluded.submitted_at
    `,
    [
      participantId,
      experimentId,
      overall,
      trust,
      fairness,
      comments || '',
      new Date().toISOString()
    ]
  );
}

function getParticipantExperiments(participantId) {
  return all(
    `
      SELECT DISTINCT experiment_id
      FROM orders
      WHERE participant_id = ?
      ORDER BY experiment_id ASC
    `,
    [participantId]
  );
}

function getAllExperiments() {
  return all(
    `
      SELECT DISTINCT experiment_id
      FROM orders
      ORDER BY experiment_id ASC
    `,
    []
  );
}

module.exports = {
  init,
  createOrder,
  insertOrderEvent,
  setOrderStatus,
  markOrderDelivered,
  getOrder,
  getOrderEvents,
  saveRating,
  getParticipantExperiments,
  getAllExperiments
};
