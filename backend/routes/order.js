const express = require('express');
const { createRandomSimulationInput, startDeliverySimulation } = require('../simulator');

function normalizeCondition(condition = {}) {
  return {
    certainty: ['certain', 'uncertain'].includes(condition.certainty)
      ? condition.certainty
      : 'certain',
    agency: ['driver', 'system', 'restaurant'].includes(condition.agency)
      ? condition.agency
      : 'driver',
    emotion: ['neutral', 'reassuring', 'urgency'].includes(condition.emotion)
      ? condition.emotion
      : 'neutral'
  };
}

function makeOrderRoom(participantId, experimentId) {
  return `order:${participantId}:${experimentId}`;
}

function createOrderRouter({ io, db }) {
  const router = express.Router();

  router.post('/order', async (req, res) => {
    try {
      const participantId = (req.body.participantId || '').trim();
      const experimentId = (req.body.experimentId || '').trim();
      const cart = Array.isArray(req.body.cart) ? req.body.cart : [];
      const condition = normalizeCondition(req.body.condition);

      if (!participantId) {
        res.status(400).json({ error: 'participantId is required' });
        return;
      }

      if (!experimentId) {
        res.status(400).json({ error: 'experimentId is required' });
        return;
      }

      if (cart.length === 0) {
        res.status(400).json({ error: 'cart cannot be empty' });
        return;
      }

      const simulationInput = createRandomSimulationInput();

      await db.createOrder({
        participantId,
        experimentId,
        condition,
        cart,
        simulationInput
      });
      await db.setOrderStatus(participantId, experimentId, 'in_progress');

      const roomId = makeOrderRoom(participantId, experimentId);

      startDeliverySimulation({
        participantId,
        experimentId,
        roomId,
        condition,
        simulationInput,
        io,
        onEvent: ({ participantId: pid, experimentId: eid, phase, message, etaMin }) =>
          db.insertOrderEvent({
            participantId: pid,
            experimentId: eid,
            phase,
            message,
            etaMin
          }),
        onDelivered: ({ participantId: pid, experimentId: eid }) =>
          db.markOrderDelivered(pid, eid)
      });

      res.status(201).json({ participantId, experimentId, condition, simulationInput });
    } catch (error) {
      if (error && error.code === 'SQLITE_CONSTRAINT') {
        res.status(409).json({
          error: 'A session already exists for this participantId + experimentId'
        });
        return;
      }

      console.error('Failed to create order', error);
      res.status(500).json({ error: 'failed to create order' });
    }
  });

  router.get('/order', async (req, res) => {
    try {
      const participantId = (req.query.participantId || '').trim();
      const experimentId = (req.query.experimentId || '').trim();

      if (!participantId || !experimentId) {
        res.status(400).json({ error: 'participantId and experimentId are required' });
        return;
      }

      const [order, events] = await Promise.all([
        db.getOrder(participantId, experimentId),
        db.getOrderEvents(participantId, experimentId)
      ]);

      if (!order) {
        res.status(404).json({ error: 'order not found' });
        return;
      }

      res.json({ order, events });
    } catch (error) {
      console.error('Failed to fetch order', error);
      res.status(500).json({ error: 'failed to fetch order' });
    }
  });

  return router;
}

module.exports = {
  createOrderRouter
};
