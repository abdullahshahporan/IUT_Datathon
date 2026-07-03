import { DiscordBot } from "./services/DiscordBot";

async function bootstrap(): Promise<void> {
  const bot = new DiscordBot();

  process.once("SIGINT", async () => {
    await bot.stop();
    process.exit(0);
  });

  process.once("SIGTERM", async () => {
    await bot.stop();
    process.exit(0);
  });

  await bot.start();
}

bootstrap().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown bot startup error";
  console.error(message);
  process.exit(1);
});
