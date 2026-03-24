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

  router.get('/next-experiment-id', async (req, res) => {
    try {
      const participantId = (req.query.participantId || '').trim();

      if (!participantId) {
        res.status(400).json({ error: 'participantId is required' });
        return;
      }

      // Get all experiments FOR THIS PARTICIPANT (not globally)
      const participantExperiments = await db.getParticipantExperiments(participantId);
      console.log(`Experiments for participant ${participantId}:`, participantExperiments);
      
      const existingExpNums = participantExperiments.map((exp) => {
        const expMatch = exp.experiment_id.match(/\d+/);
        return expMatch ? parseInt(expMatch[0], 10) : null;
      }).filter((num) => num !== null);

      console.log('Extracted experiment numbers for this participant:', existingExpNums);

      // Find the maximum experiment number for THIS PARTICIPANT and get the next one
      // Start from 1, not 0
      const maxExpNum = existingExpNums.length > 0 ? Math.max(...existingExpNums) : 0;
      const nextExpNum = maxExpNum + 1;

      console.log(`Max experiment number for ${participantId}:`, maxExpNum, '-> Next will be:', nextExpNum);

      const suggestedExpId = String(nextExpNum).padStart(3, '0');
      res.json({ suggestedExpId, experimentNumber: nextExpNum });
    } catch (error) {
      console.error('Failed to get next experiment ID', error);
      res.status(500).json({ error: 'failed to get next experiment ID' });
    }
  });

  return router;
}

module.exports = {
  createOrderRouter
};
