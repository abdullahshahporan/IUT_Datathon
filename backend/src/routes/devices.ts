import { Router } from "express";
import { OfficeStore } from "../services/OfficeStore";

function compareNullable(left: string, right: string, direction: "asc" | "desc"): number {
  const factor = direction === "asc" ? 1 : -1;
  return left.localeCompare(right) * factor;
}

export function createDevicesRouter(store: OfficeStore): Router {
  const router = Router();

  router.get("/", (request, response) => {
    const query = request.query;
    const search = typeof query.q === "string" ? query.q.trim().toLowerCase() : "";
    const roomFilter = typeof query.room === "string" ? query.room.toLowerCase() : "";
    const typeFilter = typeof query.type === "string" ? query.type.toLowerCase() : "";
    const statusFilter = typeof query.status === "string" ? query.status.toUpperCase() : "";
    const sort = typeof query.sort === "string" ? query.sort : "room";
    const order = query.order === "desc" ? "desc" : "asc";

    const devices = store
      .getDevices()
      .filter((device) => {
        const searchable = [device.name, device.roomName, device.type, device.status].join(" ").toLowerCase();

        if (search && !searchable.includes(search)) {
          return false;
        }

        if (roomFilter && device.roomId.toLowerCase() !== roomFilter && device.roomName.toLowerCase() !== roomFilter) {
          return false;
        }

        if (typeFilter && device.type.toLowerCase() !== typeFilter) {
          return false;
        }

        if (statusFilter && device.status !== statusFilter) {
          return false;
        }

        return true;
      })
      .sort((left, right) => {
        const direction = order === "asc" ? 1 : -1;

        switch (sort) {
          case "name":
            return compareNullable(left.name, right.name, order);
          case "room":
            return compareNullable(left.roomName, right.roomName, order);
          case "status":
            return compareNullable(left.status, right.status, order);
          case "power":
            return (left.powerDrawWatts - right.powerDrawWatts) * direction;
          case "lastChanged":
            return compareNullable(left.lastChangedAt, right.lastChangedAt, order);
          default:
            return compareNullable(left.roomName, right.roomName, order);
        }
      });

    response.json({
      data: devices,
      total: devices.length,
    });
  });

  router.post("/:id/toggle", (request, response) => {
    const deviceId = request.params.id;
    const timestamp = new Date();

    const change = store.toggleDevice(deviceId, "manual", timestamp);
    if (!change) {
      return response.status(404).json({ message: "Device not found" });
    }

    const io = request.app.get("io");
    const alertEngine = request.app.get("alertEngine");

    if (io) {
      io.emit("device:update", change.current);
    }

    if (alertEngine && io) {
      const alerts = alertEngine.evaluateDeviceChange(change);
      for (const alert of alerts) {
        io.emit("alert:new", alert);
      }
    }

    const usage = store.sampleSnapshot(timestamp);
    if (io) {
      io.emit("usage:update", usage);
    }

    if (alertEngine && io) {
      const powerAlerts = alertEngine.evaluateHighPowerAlert(usage.currentWatts, timestamp);
      for (const alert of powerAlerts) {
        io.emit("alert:new", alert);
      }
    }

    return response.json({
      data: change,
    });
  });

  return router;
}
