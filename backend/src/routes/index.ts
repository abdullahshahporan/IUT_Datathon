import { Application } from "express";
import { OfficeStore } from "../services/OfficeStore";
import { createAlertsRouter } from "./alerts";
import { createDevicesRouter } from "./devices";
import { createRoomsRouter } from "./rooms";
import { createUsageRouter } from "./usage";

export function registerRoutes(app: Application, store: OfficeStore): void {
  app.get("/health", (_request, response) => {
    response.json({
      status: "ok",
      service: "smart-office-backend",
      timestamp: new Date().toISOString(),
    });
  });

  app.use("/devices", createDevicesRouter(store));
  app.use("/rooms", createRoomsRouter(store));
  app.use("/alerts", createAlertsRouter(store));
  app.use("/usage", createUsageRouter(store));
}
