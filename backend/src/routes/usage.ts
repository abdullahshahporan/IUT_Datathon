import { Router } from "express";
import { OfficeStore } from "../services/OfficeStore";

export function createUsageRouter(store: OfficeStore): Router {
  const router = Router();

  router.get("/", (_request, response) => {
    response.json({
      data: {
        usage: store.getUsageSnapshot(),
        powerHistory: store.getPowerHistory(),
      },
    });
  });

  return router;
}
