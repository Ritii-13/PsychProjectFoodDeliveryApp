# Psych-Experiment-using-Swiggy-clone

A basic localhost web prototype for food-delivery psychology experiments.

## Stack
- Node.js + Express
- Socket.IO
- SQLite
- HTML/CSS/Vanilla JS

## Structure
- `backend/server.js`: app + websocket server
- `backend/db.js`: SQLite schema + DB helpers
- `backend/simulator.js`: live delivery event simulator
- `backend/routes/order.js`: create/fetch order APIs
- `backend/routes/rating.js`: submit rating API
- `frontend/*.html`: participant flow pages
- `frontend/style.css`: shared styling
- `frontend/app.js`: frontend logic for all pages

## Run
1. Install dependencies:
   `npm install`
2. Start in dev mode:
   `npm run dev`
3. Open:
   `http://localhost:3000`

## Core Flow
1. Set participant ID + experiment ID + condition on `index.html`
2. Add items on `menu.html`
3. Place order and observe live updates on `delivery.html`
4. Submit post-delivery ratings on `rating.html`

## Notes
- `orders` uses a composite primary key: (`participant_id`, `experiment_id`).
- Simulation emits updates every ~6 seconds for quick testing.
- Data is stored in `backend/data/experiment.db`.

## EEG Trigger Bridge
- Shared trigger codes live in `config/eeg-trigger-map.json`.
- Frontend page-entry markers are posted to `POST /api/experiment-event`.
- Backend emits semantic markers for `order_created`, `order_delivered`, and `rating_submitted`.
- Run the local Python bridge on the EEG machine:
  `npm run eeg:bridge`
- For development without hardware:
  `npm run eeg:bridge:dry-run`

### Config
- `EEG_TRIGGER_MODE=noop|bridge`
- `EEG_TRIGGER_BRIDGE_URL=http://127.0.0.1:8765`
- Python bridge parallel port default: `0x3EFC`

### Verification
- End-to-end dry-run verification:
  `npm run test:eeg`
