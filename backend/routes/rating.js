const express = require('express');

function createRatingRouter({ db, triggers }) {
  const router = express.Router();

  router.post('/rating', async (req, res) => {
    try {
      const participantId = (req.body.participantId || '').trim();
      const experimentId = (req.body.experimentId || '').trim();
      const overall = Number(req.body.overall);
      const trust = req.body.trust === '' || req.body.trust == null ? null : Number(req.body.trust);
      const fairness =
        req.body.fairness === '' || req.body.fairness == null ? null : Number(req.body.fairness);
      const comments = (req.body.comments || '').trim();

      if (!participantId) {
        res.status(400).json({ error: 'participantId is required' });
        return;
      }

      if (!experimentId) {
        res.status(400).json({ error: 'experimentId is required' });
        return;
      }

      if (!Number.isInteger(overall) || overall < 1 || overall > 5) {
        res.status(400).json({ error: 'overall must be 1-5' });
        return;
      }

      await db.saveRating({
        participantId,
        experimentId,
        overall,
        trust,
        fairness,
        comments
      });
      await triggers.send({
        eventName: 'rating_submitted',
        participantId,
        experimentId,
        source: 'backend_rating',
        metadata: {
          overall,
          trust,
          fairness
        }
      });

      res.status(201).json({ ok: true });
    } catch (error) {
      console.error('Failed to save rating', error);
      res.status(500).json({ error: 'failed to save rating' });
    }
  });

  return router;
}

module.exports = {
  createRatingRouter
};
