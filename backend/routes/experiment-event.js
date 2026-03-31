const express = require('express');

function createExperimentEventRouter({ triggers }) {
  const router = express.Router();

  router.post('/experiment-event', async (req, res) => {
    try {
      const participantId = (req.body.participantId || '').trim();
      const experimentId = (req.body.experimentId || '').trim();
      const eventName = (req.body.eventName || '').trim();
      const source = (req.body.source || 'frontend_page').trim();
      const clientTimestamp =
        typeof req.body.clientTimestamp === 'string' ? req.body.clientTimestamp.trim() : null;

      if (!participantId) {
        res.status(400).json({ error: 'participantId is required' });
        return;
      }

      if (!experimentId) {
        res.status(400).json({ error: 'experimentId is required' });
        return;
      }

      if (!eventName) {
        res.status(400).json({ error: 'eventName is required' });
        return;
      }

      if (!triggers.isKnownEventName(eventName)) {
        res.status(400).json({ error: 'eventName is not in the trigger map' });
        return;
      }

      await triggers.send({
        eventName,
        participantId,
        experimentId,
        source,
        clientTimestamp,
        metadata: {
          page: req.body.page || null,
          path: req.body.path || null
        }
      });

      res.status(202).json({ ok: true, accepted: true, eventName });
    } catch (error) {
      console.error('Failed to record experiment event', error);
      res.status(500).json({ error: 'failed to record experiment event' });
    }
  });

  return router;
}

module.exports = {
  createExperimentEventRouter
};
