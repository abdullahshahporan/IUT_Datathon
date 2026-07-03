# Smart Office Frontend

Modern React dashboard for the Smart Office Monitoring System.

## Installation

```bash
cd frontend
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
npm run preview
```

## Environment Variables

- `VITE_API_URL`: Backend REST API base URL.
- `VITE_SOCKET_URL`: Backend Socket.IO URL.

## Screenshots

- Dashboard overview
- Live alerts and dismiss actions
- Statistics and power charts
- Office floor plan with animated devices

## Architecture

The app keeps the backend as the single source of truth. It loads the initial state through REST, subscribes to Socket.IO for live updates, and renders dashboard pages from the same normalized in-memory snapshot.
