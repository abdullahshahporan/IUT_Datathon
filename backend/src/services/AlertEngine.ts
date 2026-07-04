import { AFTER_HOURS_START, BEFORE_HOURS_END, HIGH_POWER_THRESHOLD_WATTS, MAX_OFFICE_WATTS, ROOM_ALERT_THRESHOLD_MS } from "../config/constants";
import { AlertRecord, DeviceChangeResult } from "smart-office-shared";
import { getOfficeHoursLabel, hoursBetween, isOutsideOfficeHours, toIso } from "../utils/time";
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
      isOutsideOfficeHours(now, BEFORE_HOURS_END, AFTER_HOURS_START)
    ) {
      const label = getOfficeHoursLabel(now, BEFORE_HOURS_END, AFTER_HOURS_START);
      const alert = this.createAlert({
        type: "device-on-after-hours",
        severity: "warning",
        title: `Device turned on ${label}`,
        message: `${change.current.name} in ${change.current.roomName} was switched on ${label}.`,
        roomId: change.current.roomId,
        roomName: change.current.roomName,
        deviceId: change.current.id,
        deviceName: change.current.name,
        signature: `outside-hours:${change.current.id}:${toIso(now).slice(0, 16)}`,
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

  /**
   * Fires a high-power-consumption alert when total office watts exceed 85% of
   * the theoretical maximum (495 W). Deduplicated by a rolling 10-minute window.
   */
  evaluateHighPowerAlert(totalWatts: number, timestamp = new Date()): AlertRecord[] {
    if (totalWatts < HIGH_POWER_THRESHOLD_WATTS) {
      return [];
    }

    const windowKey = toIso(timestamp).slice(0, 15); // deduplicate per 10-min window
    const signature = `high-power:${windowKey}`;

    if (this.store.hasActiveAlert(signature)) {
      return [];
    }

    const percentUsed = Math.round((totalWatts / MAX_OFFICE_WATTS) * 100);
    const alert = this.createAlert({
      type: "high-power-consumption",
      severity: "warning",
      title: "High power consumption detected",
      message: `Office is drawing ${totalWatts} W — ${percentUsed}% of max capacity (${MAX_OFFICE_WATTS} W). Consider turning off unused devices.`,
      roomId: "drawing-room", // use as a placeholder; this is an office-wide alert
      roomName: "Office-wide",
      signature,
      timestamp,
    });

    return alert ? [alert] : [];
  }

  private createAlert(input: AlertCreationInput): AlertRecord | null {
    const alert = this.store.createAlert(input);
    return alert;
  }
}
