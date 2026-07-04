# Smart Office Monitoring System

A real-time office device monitoring system with a live web dashboard and Discord bot. Built for **IUT Datathon / Techhathon Nationals** — Lights, Fans, Discord: The Boss's Big Idea.

---

## Architecture

```
[DeviceSimulator]
      │  toggles 15 simulated devices every 3–6 s
      ▼
[OfficeStore]  ←→  [AlertEngine]
      │                  │ device-on-after-hours
      │                  │ room-on-too-long
      │                  │ high-power-consumption
      ▼
[Express REST API + Socket.IO]  (port 4000)
      │                │
      ▼                ▼
[React Dashboard]  [Discord Bot]
  WebSocket         HTTP polling
  live updates    + WebSocket alerts
```

### Office layout
- **3 rooms**: Drawing Room, Work Room 1, Work Room 2
- **5 devices per room**: 2 fans (60 W each) + 3 lights (15 W each)
- **15 devices total** — max theoretical draw: **495 W**

---

## Project Structure

| Folder | Description |
|---|---|
| [backend](backend) | Express + Socket.IO API, in-memory store, device simulator, alert engine |
| [frontend](frontend) | React + Vite dashboard with real-time charts, floor plan, and alerts |
| [bot](bot) | Discord bot — commands + proactive alert relay, Gemini-powered replies |
| [shared](shared) | Shared TypeScript types (single source of truth for domain types) |

---

## Prerequisites

- Node.js 20 or newer
- npm
- A Discord bot token (create at [discord.com/developers](https://discord.com/developers/applications))
- A Google Gemini API key ([aistudio.google.com](https://aistudio.google.com/apikey)) — optional but strongly recommended for conversational bot responses

---

## Setup

### 1. Install dependencies

Build the shared package first — all other services depend on it.

```bash
cd shared
npm install
npm run build

cd ../backend
npm install

cd ../frontend
npm install

cd ../bot
npm install
```

### 2. Configure environment variables

Copy and fill in the `.env` files for each service (see tables below).

```bash
# backend
cp backend/.env.example backend/.env

# frontend
cp frontend/.env.example frontend/.env

# bot
cp bot/.env.example bot/.env
```

---

## Environment Variables

### Backend — `backend/.env`

| Variable | Default | Description |
|---|---|---|
| `PORT` | `4000` | HTTP server port |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed dashboard origin |
| `SIMULATOR_MIN_INTERVAL_MS` | `3000` | Min device simulator tick (ms) |
| `SIMULATOR_MAX_INTERVAL_MS` | `6000` | Max device simulator tick (ms) |
| `SIMULATOR_INITIAL_DELAY_MS` | `1000` | Delay before simulator starts (ms) |

### Frontend — `frontend/.env`

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:4000` | Backend REST API base URL |
| `VITE_SOCKET_URL` | `http://localhost:4000` | Backend Socket.IO URL |

### Bot — `bot/.env`

| Variable | Required | Description |
|---|---|---|
| `DISCORD_BOT_TOKEN` | ✅ | Discord bot token from the developer portal |
| `DISCORD_GUILD_ID` | optional | Test guild ID for slash-command registration |
| `BACKEND_API_URL` | `http://localhost:4000` | Backend REST API URL |
| `BACKEND_SOCKET_URL` | `http://localhost:4000` | Backend Socket.IO URL for alert relay |
| `COMMAND_PREFIX` | `!` | Prefix for bot commands |
| `ALERT_CHANNEL_ID` | optional | Discord channel ID for proactive alert messages |
| `GEMINI_API_KEY` | optional | Google Gemini API key for conversational replies |

---

## Running the System

Start each service in a separate terminal. **Order matters.**

```bash
# Terminal 1 — backend
cd backend && npm run dev

# Terminal 2 — frontend
cd frontend && npm run dev

# Terminal 3 — bot (after setting DISCORD_BOT_TOKEN)
cd bot && npm run dev
```

The dashboard will be available at **http://localhost:5173**.

---

## Discord Bot Commands

| Command | What it does |
|---|---|
| `!status` | Office-wide device summary across all 3 rooms |
| `!room drawing` | Status of the Drawing Room |
| `!room work1` | Status of Work Room 1 |
| `!room work2` | Status of Work Room 2 |
| `!usage` | Current power draw (W) and estimated daily consumption (kWh) |
| `!alerts` | Top 5 active alerts |

All responses are passed through **Gemini 1.5 Flash** for friendly, conversational phrasing (falls back to plain text if `GEMINI_API_KEY` is not set).

The bot also **proactively posts** to the configured alert channel whenever an alert is triggered.

---

## Alert Types

| Type | Trigger |
|---|---|
| `device-on-after-hours` | A device turns ON outside office hours (before 9 AM or after 5 PM) |
| `room-on-too-long` | All devices in a room have been ON continuously for more than 2 hours |
| `high-power-consumption` | Total office draw exceeds 85% of max capacity (≥ 421 W / 495 W) |

---

## API Reference

### REST endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Service status |
| `GET` | `/devices` | All 15 devices (filterable by room, type, status) |
| `GET` | `/rooms` | 3 room summaries with live power and device counts |
| `GET` | `/alerts` | Active alerts (pass `?active=false` for all) |
| `POST` | `/alerts/:id/dismiss` | Dismiss an alert |
| `GET` | `/usage` | Current watts, estimated kWh today, and power history |

### Socket.IO events (client ← server)

| Event | Payload |
|---|---|
| `device:update` | `DeviceRecord` — a device's state just changed |
| `alert:new` | `AlertRecord` — a new alert was triggered |
| `usage:update` | `UsageSnapshot` — latest power consumption sample |

---

## Diagrams

See the [`docs/diagrams/`](docs/diagrams/) folder for:
- `system-diagram.png` — high-level data flow diagram
- `wokwi-schematic.png` — ESP32 + relay module hardware schematic (one representative room)
