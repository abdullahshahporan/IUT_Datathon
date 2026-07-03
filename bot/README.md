# Smart Office Discord Bot

Discord bot for the Smart Office Monitoring System.

## Installation

```bash
cd bot
npm install
copy .env.example .env
```

Set `DISCORD_BOT_TOKEN` before starting.

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

- `DISCORD_BOT_TOKEN`: Discord bot token.
- `DISCORD_GUILD_ID`: Optional guild for faster testing.
- `BACKEND_API_URL`: Backend REST API URL.
- `BACKEND_SOCKET_URL`: Backend Socket.IO URL.
- `COMMAND_PREFIX`: Command prefix, default `!`.
- `ALERT_CHANNEL_ID`: Optional channel to receive automatic alert messages.

## Commands

- `!status`
- `!room drawing`
- `!room work1`
- `!room work2`
- `!usage`
- `!alerts`

## Behavior

The bot reads every status message from the backend API and listens to the backend Socket.IO stream for new alerts. It never hardcodes office state, so the dashboard and the bot always reflect the same source of truth.
