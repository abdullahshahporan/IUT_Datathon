import { startServer } from "./server";

async function bootstrap(): Promise<void> {
  const runtime = await startServer();
  const address = runtime.httpServer.address();
  const port = typeof address === "object" && address ? address.port : "unknown";

  console.log(`Smart Office backend running on port ${port}`);
}

bootstrap().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : "Unknown startup error";
  console.error(message);
  process.exit(1);
});
