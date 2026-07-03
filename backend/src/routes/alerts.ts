import { Router } from "express";
import { OfficeStore } from "../services/OfficeStore";

export function createAlertsRouter(store: OfficeStore): Router {
  const router = Router();

  router.get("/", (request, response) => {
    const activeOnly = request.query.active !== "false";

    response.json({
      data: activeOnly ? store.getActiveAlerts() : store.getAlerts(true),
    });
  });

  router.post("/:id/dismiss", (request, response) => {
    const alert = store.dismissAlert(request.params.id);
    if (!alert) {
      return response.status(404).json({ message: "Alert not found" });
    }

    return response.json({
      data: alert,
    });
  });

  return router;
}
