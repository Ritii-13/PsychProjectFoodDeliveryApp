const path = require('path');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const db = require('./db');
const { createOrderRouter } = require('./routes/order');
const { createRatingRouter } = require('./routes/rating');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, '..', 'frontend')));

app.use('/api', createOrderRouter({ io, db }));
app.use('/api', createRatingRouter({ db }));

io.on('connection', (socket) => {
  socket.on('join-order', (session) => {
    const participantId = (session && session.participantId ? session.participantId : '').trim();
    const experimentId = (session && session.experimentId ? session.experimentId : '').trim();

    if (!participantId || !experimentId) {
      return;
    }

    socket.join(`order:${participantId}:${experimentId}`);
  });
});

app.get('/health', (_req, res) => {
  res.json({ ok: true, timestamp: new Date().toISOString() });
});

app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'frontend', 'index.html'));
});

(async () => {
  try {
    await db.init();
    server.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server', error);
    process.exit(1);
  }
})();
