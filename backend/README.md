# Smart Office Backend

Express + Socket.IO backend for the Smart Office Monitoring System.

## Installation

```bash
cd backend
npm install
copy .env.example .env
```

## Development

```bash
npm run dev
```

## Production Build

```bash
npm run build
npm start
```

## Environment Variables

- `PORT`: HTTP port for the backend.
- `CORS_ORIGIN`: Allowed dashboard origin.
- `SIMULATOR_MIN_INTERVAL_MS`: Minimum simulator tick delay.
- `SIMULATOR_MAX_INTERVAL_MS`: Maximum simulator tick delay.
- `SIMULATOR_INITIAL_DELAY_MS`: Delay before the simulator starts.
- `NODE_ENV`: Runtime environment.

## API Endpoints

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

## Architecture

The backend keeps a single in-memory office store as the source of truth. The simulator mutates the store every few seconds, the alert engine inspects the new state, REST endpoints read from the same store, and Socket.IO broadcasts live changes to the dashboard and future bot client.
