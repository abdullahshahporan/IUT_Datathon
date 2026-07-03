import { AFTER_HOURS_START, ROOM_ALERT_THRESHOLD_MS } from "../config/constants";
import { AlertRecord, DeviceChangeResult } from "smart-office-shared";
import { hoursBetween, isAfterOfficeHours, toIso } from "../utils/time";
import { OfficeStore } from "./OfficeStore";

type AlertCreationInput = Parameters<OfficeStore["createAlert"]>[0];

export class AlertEngine {
  constructor(private readonly store: OfficeStore) {}

  evaluateDeviceChange(change: DeviceChangeResult): AlertRecord[] {
    const now = new Date(change.changedAt);
    const alerts: AlertRecord[] = [];

    if (
      change.previous.status === "OFF" &&
      change.current.status === "ON" &&
      isAfterOfficeHours(now, AFTER_HOURS_START)
    ) {
      const alert = this.createAlert({
        type: "device-on-after-hours",
        severity: "warning",
        title: "Device turned on after office hours",
        message: `${change.current.name} in ${change.current.roomName} turned on after 5 PM.`,
        roomId: change.current.roomId,
        roomName: change.current.roomName,
        deviceId: change.current.id,
        deviceName: change.current.name,
        signature: `after-hours:${change.current.id}:${toIso(now).slice(0, 16)}`,
        timestamp: now,
      });

      if (alert) {
        alerts.push(alert);
      }
    }

    alerts.push(...this.evaluateRoomPressure(now));
    return alerts;
  }

  evaluateRoomPressure(timestamp = new Date()): AlertRecord[] {
    const alerts: AlertRecord[] = [];

    for (const room of this.store.getRooms()) {
      const roomStartedOn = this.store.getRoomAllOnSince(room.id);
      if (!roomStartedOn) {
        continue;
      }

      const activeDurationMs = timestamp.getTime() - roomStartedOn.getTime();
      if (activeDurationMs < ROOM_ALERT_THRESHOLD_MS) {
        continue;
      }

      const signature = `room-all-on:${room.id}`;
      if (this.store.hasActiveAlert(signature)) {
        continue;
      }

      const alert = this.createAlert({
        type: "room-on-too-long",
        severity: "critical",
        title: "Entire room has been ON for more than 2 hours",
        message: `${room.name} has remained fully active for ${Math.max(2, Math.floor(hoursBetween(roomStartedOn, timestamp)))} hours.`,
        roomId: room.id,
        roomName: room.name,
        signature,
        timestamp,
      });

      if (alert) {
        alerts.push(alert);
      }
    }

    return alerts;
  }

  private createAlert(input: AlertCreationInput): AlertRecord | null {
    const alert = this.store.createAlert(input);
    return alert;
  }
}
