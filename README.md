# Smart Office Monitoring System

Smart Office Monitoring System for a hackathon demo with three services and one shared domain package.

## Project Structure

- [backend](backend) - Express + Socket.IO API, simulator, and alert engine.
- [frontend](frontend) - React dashboard with live monitoring and analytics.
- [bot](bot) - Discord bot that reads the same backend source of truth.
- [shared](shared) - Shared TypeScript types and office domain definitions.

## Prerequisites

- Node.js 20 or newer
- npm
- A Discord bot token for the bot service

## Installation

Install each folder separately:

```bash
cd backend
npm install

cd ../frontend
npm install

cd ../bot
npm install

cd ../shared
npm install
```

Copy each `.env.example` file to `.env` before running any service.

## Running the System

Run the services in separate terminals:

```bash
cd shared
npm run build

cd ../backend
npm run dev

cd ../frontend
npm run dev

cd ../bot
npm run dev
```

Recommended order:

1. Start `backend` first.
2. Start `frontend` second.
3. Start `bot` after setting `DISCORD_BOT_TOKEN`.

## Environment Variables

### Backend

- `PORT` - HTTP port, default `4000`.
- `CORS_ORIGIN` - Dashboard origin.
- `SIMULATOR_MIN_INTERVAL_MS` - Minimum simulator tick delay.
- `SIMULATOR_MAX_INTERVAL_MS` - Maximum simulator tick delay.
- `SIMULATOR_INITIAL_DELAY_MS` - Delay before the simulator starts.

### Frontend

- `VITE_API_URL` - Backend REST API URL.
- `VITE_SOCKET_URL` - Backend Socket.IO URL.

### Bot

- `DISCORD_BOT_TOKEN` - Discord bot token.
- `DISCORD_GUILD_ID` - Optional test guild.
- `BACKEND_API_URL` - Backend REST API URL.
- `BACKEND_SOCKET_URL` - Backend Socket.IO URL.
- `COMMAND_PREFIX` - Command prefix, default `!`.
- `ALERT_CHANNEL_ID` - Optional channel for automatic alert forwarding.

## Available API Endpoints

- `GET /devices`
- `GET /rooms`
- `GET /alerts`
- `POST /alerts/:id/dismiss`
- `GET /usage`
- `GET /health`

## Socket.IO Events

- `device:update`
- `alert:new`
- `usage:update`

## Discord Commands

- `!status`
- `!room drawing`
- `!room work1`
- `!room work2`
- `!usage`
- `!alerts`

## Screenshots

Add screenshots here after running the dashboard.

- Dashboard overview
- Alerts page
- Statistics page
- Floor plan view

## Notes

The backend is the single source of truth. The simulator mutates the in-memory store, the dashboard reads it through REST and Socket.IO, and the Discord bot formats the same live backend data into conversational messages.
