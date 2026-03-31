const fs = require('fs');
const path = require('path');

const TRIGGER_MAP_PATH = path.join(__dirname, '..', '..', 'config', 'eeg-trigger-map.json');
const DEFAULT_TRIGGER_MODE = 'noop';
const DEFAULT_BRIDGE_URL = 'http://127.0.0.1:8765';
const DEFAULT_TIMEOUT_MS = 1000;

function loadTriggerMap() {
  return JSON.parse(fs.readFileSync(TRIGGER_MAP_PATH, 'utf8'));
}

function normalizeMode(mode) {
  return String(mode || DEFAULT_TRIGGER_MODE)
    .trim()
    .toLowerCase();
}

function createTriggerClient({ logger = console } = {}) {
  const triggerMap = loadTriggerMap();
  const mode = normalizeMode(process.env.EEG_TRIGGER_MODE);
  const bridgeUrl = String(process.env.EEG_TRIGGER_BRIDGE_URL || DEFAULT_BRIDGE_URL).replace(
    /\/+$/,
    ''
  );

  function isKnownEventName(eventName) {
    return Object.prototype.hasOwnProperty.call(triggerMap, eventName);
  }

  async function send({
    eventName,
    participantId,
    experimentId,
    source = 'backend',
    clientTimestamp = null,
    metadata = null
  }) {
    const normalizedEventName = String(eventName || '').trim();
    if (!isKnownEventName(normalizedEventName)) {
      logger.warn(`[EEG] Ignoring unknown trigger event "${normalizedEventName}"`);
      return {
        ok: false,
        skipped: true,
        mode,
        reason: 'unknown_event'
      };
    }

    const payload = {
      eventName: normalizedEventName,
      code: triggerMap[normalizedEventName],
      participantId: String(participantId || '').trim(),
      experimentId: String(experimentId || '').trim(),
      source: String(source || 'backend').trim(),
      clientTimestamp,
      serverTimestamp: new Date().toISOString(),
      metadata
    };

    if (mode !== 'bridge') {
      logger.info(
        `[EEG] noop trigger ${payload.eventName} (${payload.code}) for ${payload.participantId}/${payload.experimentId}`
      );
      return {
        ok: true,
        skipped: true,
        mode,
        payload
      };
    }

    try {
      const response = await fetch(`${bridgeUrl}/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(DEFAULT_TIMEOUT_MS)
      });

      if (!response.ok) {
        const responseText = await response.text();
        throw new Error(`bridge responded with ${response.status}: ${responseText}`);
      }

      return {
        ok: true,
        mode,
        payload
      };
    } catch (error) {
      logger.warn(
        `[EEG] Failed to send trigger ${payload.eventName} (${payload.code}): ${error.message}`
      );
      return {
        ok: false,
        mode,
        payload,
        error: error.message
      };
    }
  }

  return {
    mode,
    bridgeUrl,
    triggerMap,
    isKnownEventName,
    send
  };
}

module.exports = {
  TRIGGER_MAP_PATH,
  createTriggerClient,
  loadTriggerMap
};
