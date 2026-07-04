import { createServer, Server as HttpServer } from "http";
import { Server } from "socket.io";
import { env } from "./config/env";
import { createApp } from "./app";
import { OfficeStore } from "./services/OfficeStore";
import { AlertEngine } from "./services/AlertEngine";
import { DeviceSimulator } from "./services/DeviceSimulator";

export type BackendRuntime = {
  store: OfficeStore;
  alertEngine: AlertEngine;
  simulator: DeviceSimulator;
  httpServer: HttpServer;
  io: Server;
};

export function createBackendRuntime(): BackendRuntime {
  const store = new OfficeStore();
  const app = createApp(store);
  const httpServer = createServer(app);

  const io = new Server(httpServer, {
    cors: {
      origin: env.corsOrigin,
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    socket.emit("usage:update", store.getUsageSnapshot());
  });

  const alertEngine = new AlertEngine(store);
  const simulator = new DeviceSimulator(store, alertEngine, io);

  app.set("io", io);
  app.set("alertEngine", alertEngine);

  return {
    store,
    alertEngine,
    simulator,
    httpServer,
    io,
  };
}

export async function startServer(): Promise<BackendRuntime> {
  const runtime = createBackendRuntime();

  await new Promise<void>((resolve) => {
    runtime.httpServer.listen(env.port, () => resolve());
  });

  runtime.simulator.start();
  return runtime;
}
