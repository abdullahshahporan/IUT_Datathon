import { Router } from "express";
import { OfficeStore } from "../services/OfficeStore";

export function createRoomsRouter(store: OfficeStore): Router {
  const router = Router();

  router.get("/", (_request, response) => {
    response.json({
      data: store.getRooms(),
    });
  });

  return router;
}
