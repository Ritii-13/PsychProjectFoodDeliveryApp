# Psych-Experiment-using-Swiggy-clone

A localhost web prototype for food-delivery psychology experiments with integrated EEG trigger support via PsychoPy.

---

## Table of Contents

1. [Stack](#stack)
2. [Project Structure](#project-structure)
3. [Setup & Run](#setup--run)
4. [Core Experiment Flow](#core-experiment-flow)
5. [EEG Trigger Reference](#eeg-trigger-reference)
6. [Architecture: How Triggers Flow](#architecture-how-triggers-flow)
7. [Running with the EEG Bridge](#running-with-the-eeg-bridge)
8. [Troubleshooting](#troubleshooting)

---

## Stack

- **Backend:** Node.js + Express + Socket.IO
- **Database:** SQLite (file-based, `backend/data/experiment.db`)
- **Frontend:** HTML / CSS / Vanilla JS
- **EEG Bridge:** Python (PsychoPy parallel port)

---

## Project Structure

```
├── backend/
│   ├── server.js              # Express + Socket.IO server
│   ├── db.js                  # SQLite schema + helpers
│   ├── simulator.js           # Live delivery event simulator
│   ├── eeg/
│   │   └── trigger-client.js  # Node.js client that POSTs triggers to the Python bridge
│   ├── routes/
│   │   ├── experiment-event.js # POST /api/experiment-event (frontend page markers)
│   │   ├── order.js           # POST/GET /api/order (order lifecycle)
│   │   └── rating.js          # POST /api/rating (post-delivery ratings)
│   └── data/
│       ├── experiment.db      # SQLite database (auto-created)
│       └── eeg-trigger-log.csv # Bridge-side trigger log (auto-created)
├── config/
│   └── eeg-trigger-map.json   # JSON trigger map (used by Node.js client)
├── frontend/
│   ├── index.html             # Session setup (participant + experiment ID)
│   ├── transition.html        # Fixation / transition screen
│   ├── restaurants.html       # Restaurant selection
│   ├── menu.html              # Menu browsing + cart
│   ├── delivery.html          # Live delivery tracking
│   ├── rating.html            # Post-delivery rating
│   ├── app.js                 # All frontend logic
│   └── style.css              # Shared styling
├── tools/
│   └── eeg_trigger_bridge.py  # Python HTTP bridge → parallel port
├── tests/
│   └── eeg-trigger-integration.test.js
└── package.json
```

---

## Setup & Run

### Prerequisites

- **Node.js** ≥ 18 (for `fetch` and `AbortSignal.timeout`)
- **Python 3.8+** (for the EEG bridge)
- **PsychoPy** (only needed on the EEG recording machine)

### Install & Start

```bash
# 1. Install Node.js dependencies
npm install

# 2. Start the server (development mode with auto-reload)
npm run dev

# 3. Open in browser
#    http://localhost:3000
```

---

## Core Experiment Flow

The participant progresses through these pages in order:

```
index.html → transition.html → restaurants.html → menu.html → delivery.html → rating.html
   (setup)     (fixation)       (stimulus 1)      (stimulus 2)   (stimulus 3)    (response)
```

| Step | Page | What Happens |
|------|------|-------------|
| 1 | **index.html** | Experimenter enters participant ID (e.g. `P-001`) and experiment ID (auto-suggested) |
| 2 | **transition.html** | 2-second fixation/transition screen before the task begins |
| 3 | **restaurants.html** | Participant browses and selects a restaurant |
| 4 | **menu.html** | Participant adds items to cart and places the order |
| 5 | **delivery.html** | Live delivery simulation with real-time ETA updates (delay / faster / normal behavior) |
| 6 | **rating.html** | Participant rates the delivery experience (1–5 stars, trust, fairness, comments) |

After submitting the rating, the session is complete. The participant can start a new experiment (the participant ID is preserved, experiment ID auto-increments).

---

## EEG Trigger Reference

### Trigger Code Table

The trigger map is **unified** across the entire project — the Python bridge (`tools/eeg_trigger_bridge.py`), the JSON config (`config/eeg-trigger-map.json`), and the Node.js client all use the same event names and codes (1–12).

| Trigger Code | Event Name | EEG Label | When It Fires | Emitted By |
|:---:|---|:---:|---|---|
| **1** | `transition_onset` | **S 1** | Transition/fixation page is rendered | Frontend (page load) |
| **2** | `restaurants_onset` | **S 2** | Restaurants page is rendered | Frontend (page load) |
| **3** | `menu_onset` | **S 3** | Menu page is rendered | Frontend (page load) |
| **4** | `order_created` | **S 4** | Participant places an order (clicks "Place Order") | Backend (order route) |
| **5** | `delivery_onset` | **S 5** | Delivery tracking page is rendered | Frontend (page load) |
| **6** | `order_delivered` | **S 6** | Delivery simulation reaches ETA = 0 | Backend (simulator) |
| **7** | `rating_onset` | **S 7** | Rating page is rendered | Frontend (page load) |
| **8** | `rating_submitted` | **S 8** | Participant submits their rating | Backend (rating route) |
| **9** | `trial_start` | **S 9** | Trial begins (emitted at transition page) | Frontend (page load) |
| **10** | `fixation_start` | **S 10** | Fixation cross onset (emitted at transition page) | Frontend (page load) |
| **11** | `stimulus_onset` | **S 11** | Primary stimulus onset (emitted at delivery page) | Frontend (page load) |
| **12** | `response_made` | **S 12** | Participant makes a response (clicks a star rating) | Frontend (rating page) |

> **How to read EEG labels:**
> - **S** = Stimulus / System trigger
> - The number after **S** corresponds to the trigger code sent to the parallel port
> - So **S 1** means code `1` was written to the parallel port, **S 5** means code `5`, etc.
> - Some EEG systems label parallel port inputs as **R** (response) instead of **S** (stimulus). The code is the same — the S/R prefix depends on your amplifier's port configuration.

### Trigger Groups at a Glance

| Group | Codes | Purpose |
|---|:---:|---|
| **Page onsets** | S 1 – S 3, S 5, S 7 | Marks the moment each page is visually rendered |
| **Task events** | S 4, S 6, S 8 | Marks key behavioural milestones (order, delivery, rating) |
| **Experiment structure** | S 9, S 10 | Marks trial and fixation start (both fire on the transition page) |
| **Stimulus & response** | S 11, S 12 | Marks primary stimulus onset (delivery page) and participant response (star click) |

> **TL;DR:** `S1` = transition, `S2` = restaurants, `S3` = menu, `S4` = order placed, `S5` = delivery tracking, `S6` = delivered, `S7` = rating page, `S8` = rating submitted, `S9` = trial start, `S10` = fixation, `S11` = stimulus onset, `S12` = response made.

---

## Architecture: How Triggers Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  BROWSER (participant's screen)                                 │
│                                                                 │
│  Page loads → emitExperimentEvent('restaurants_onset', state)    │
│            → POST /api/experiment-event { eventName, ... }      │
└───────────────────────┬─────────────────────────────────────────┘
                        │ HTTP
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│  NODE.JS SERVER (backend/server.js on port 3000)                │
│                                                                 │
│  Routes call triggers.send({ eventName: 'restaurants_onset' })  │
│  trigger-client.js checks EEG_TRIGGER_MODE:                     │
│    • noop  → just logs, does NOT contact bridge                 │
│    • bridge → POST http://127.0.0.1:8765/trigger { eventName }  │
└───────────────────────┬─────────────────────────────────────────┘
                        │ HTTP (only if mode=bridge)
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│  PYTHON EEG BRIDGE (tools/eeg_trigger_bridge.py on port 8765)   │
│                                                                 │
│  Receives POST /trigger                                         │
│  Looks up eventName in TRIGGER_MAP → gets code (e.g. 2)         │
│  Sends code to parallel port via PsychoPy                       │
│    parallel.setData(2) → hold 10ms → parallel.setData(0)        │
│  Logs to backend/data/eeg-trigger-log.csv                       │
└───────────────────────┬─────────────────────────────────────────┘
                        │ Parallel port (hardware)
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│  EEG AMPLIFIER                                                  │
│                                                                 │
│  Receives TTL pulse on trigger port                             │
│  Records marker: S2 at timestamp T                              │
└─────────────────────────────────────────────────────────────────┘
```

---

## Running with the EEG Bridge

### Step 1: Start the Python Bridge

On the **EEG recording machine**, open a terminal and run:

```bash
# With PsychoPy + parallel port hardware:
python tools/eeg_trigger_bridge.py --mode auto

# Without hardware (dry-run for testing):
python tools/eeg_trigger_bridge.py --mode dry-run
```

or run the bridge file on psychopy IDE.

You should see:
```
============================================================
  EEG TRIGGER BRIDGE — DEBUG MODE
============================================================
[DEBUG ...] trigger_map is a dict: {...}
[DEBUG ...] TriggerBridgeServer invoked

============================================================
  LISTENING on http://127.0.0.1:8765
  Mode: dry-run
  Parallel port: 0x3efc
  Waiting for triggers from the Node.js server ...
============================================================
```

### Step 2: Start the Node.js Server with Bridge Mode

In a **separate terminal**:

```powershell
# PowerShell
$env:EEG_TRIGGER_MODE = "bridge"
npm run dev
```

```cmd
# Command Prompt
set EEG_TRIGGER_MODE=bridge
npm run dev
```

### Step 3: Run the Experiment

1. Open `http://localhost:3000` in the browser
2. Enter participant ID and experiment ID
3. Walk through the experiment flow
4. Watch both terminals for trigger debug messages

### What to Expect in the Terminals

**Node.js server terminal:**
```
[EEG] >> Sending POST http://127.0.0.1:8765/trigger
[EEG]    Payload: {"eventName":"transition_onset","code":1,...}
[EEG] << Bridge responded OK (202): {"ok":true,"code":1,...}
```

**Python bridge terminal:**
```
[DEBUG ...] <-- POST /trigger from ('127.0.0.1', 54321)
[DEBUG ...]   -> Received payload: {"eventName":"transition_onset",...}
[DEBUG ...]   -> Mapped 'transition_onset' -> code 1
[DEBUG ...]   -> TriggerOutput.send() called — code=1, mode=dry-run
[DEBUG ...]   -> DRY-RUN: would have sent code 1 to parallel port
[DEBUG ...]   -> Trigger sent OK (mode=dry-run)
[DEBUG ...]   -> Response sent to client
```

### Without EEG (Default Development Mode)

Just run `npm run dev` without setting `EEG_TRIGGER_MODE`. The trigger client defaults to `noop` mode — triggers are logged to the server console but never sent to the bridge:

```
[EEG] noop trigger transition_onset (11) for P-001/001
[EEG]   -> Skipped (mode=noop). Set EEG_TRIGGER_MODE=bridge to send to PsychoPy bridge.
```

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | Node.js server port |
| `EEG_TRIGGER_MODE` | `noop` | `noop` = log only, `bridge` = send to Python bridge |
| `EEG_TRIGGER_BRIDGE_URL` | `http://127.0.0.1:8765` | URL of the Python EEG bridge |
| `SIMULATION_BEHAVIOR` | *(random)* | Force delivery behavior: `delay`, `faster`, or `normal` |
| `SIMULATION_TICK_INTERVAL_MS` | `1000` | Milliseconds between simulation ticks |
| `SIMULATION_DISPLAY_UPDATE_INTERVAL_TICKS` | `5` | How many ticks between UI updates |
| `SIMULATION_INITIAL_ETA_MIN` | *(random 30–50)* | Force initial ETA in minutes |

---

## Bridge CLI Options

```
python tools/eeg_trigger_bridge.py [OPTIONS]

  --host                 Host to bind (default: 127.0.0.1)
  --port                 Port to listen on (default: 8765)
  --mode                 auto | parallel | dry-run (default: auto)
  --parallel-port-address Hex or decimal port address (default: 0x3EFC)
  --trigger-map          Path to JSON trigger map (default: config/eeg-trigger-map.json)
  --log-path             CSV log path (default: backend/data/eeg-trigger-log.csv)
```

---

## Troubleshooting

| Problem | Cause | Fix |
|---|---|---|
| Server says `noop trigger ... Skipped` | `EEG_TRIGGER_MODE` not set to `bridge` | Set `$env:EEG_TRIGGER_MODE = "bridge"` before starting the server |
| Server says `Failed to send trigger ... fetch failed` | Bridge not running or wrong port | Start the bridge first: `python tools/eeg_trigger_bridge.py` |
| Bridge says `argument of type 'WindowsPath' is not iterable` | Stale `__pycache__` or old code | Delete `tools/__pycache__/` and restart the bridge |
| Bridge says `eventName is not in the trigger map` | Event name exists in JSON but not in bridge's `TRIGGER_MAP` dict | Add the missing event to the `TRIGGER_MAP` dict in `eeg_trigger_bridge.py` |
| Bridge says `Parallel port init FAILED` | PsychoPy not installed or no parallel port | Use `--mode dry-run` for testing without hardware |
| No debug output in bridge terminal | Old `log_message` was suppressing output | Ensure `log_message` calls `debug()` instead of `return` |

---

## Notes

- `orders` uses a composite primary key: (`participant_id`, `experiment_id`).
- The delivery simulation ticks every 1 second by default, with UI updates every 5 ticks.
- Data is stored in `backend/data/experiment.db` (auto-created on first run).
- Trigger logs are appended to `backend/data/eeg-trigger-log.csv`.
- The bridge holds each trigger on the parallel port for **10ms** before resetting to 0.
