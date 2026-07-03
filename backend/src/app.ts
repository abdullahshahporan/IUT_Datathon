import cors from "cors";
import express, { Application } from "express";
import { env } from "./config/env";
import { OfficeStore } from "./services/OfficeStore";
import { registerRoutes } from "./routes";

export function createApp(store: OfficeStore): Application {
  const app = express();

  app.use(cors({ origin: env.corsOrigin, credentials: true }));
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));

  app.use((_request, response, next) => {
    response.setHeader("X-Powered-By", "Smart Office Backend");
    next();
  });

  registerRoutes(app, store);

  app.use((_request, response) => {
    response.status(404).json({ message: "Route not found" });
  });

  return app;
}
