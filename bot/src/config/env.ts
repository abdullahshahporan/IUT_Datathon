import dotenv from "dotenv";

dotenv.config();

function parseNumber(value: string | undefined, fallback: number): number {
  if (value === undefined) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const env = {
  discordToken: process.env.DISCORD_BOT_TOKEN ?? "",
  guildId: process.env.DISCORD_GUILD_ID ?? "",
  backendApiUrl: process.env.BACKEND_API_URL ?? "http://localhost:4000",
  backendSocketUrl: process.env.BACKEND_SOCKET_URL ?? "http://localhost:4000",
  commandPrefix: process.env.COMMAND_PREFIX ?? "!",
  alertChannelId: process.env.ALERT_CHANNEL_ID ?? "",
  alertPollIntervalMs: parseNumber(process.env.ALERT_POLL_INTERVAL_MS, 15_000),
  geminiApiKey: process.env.GEMINI_API_KEY ?? "",
};
