import { AlertRecord, RoomSummary, UsageSnapshot } from "smart-office-shared";

export function formatWatts(value: number): string {
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value)} W`;
}

export function formatKwh(value: number): string {
  return `${value.toFixed(2)} kWh`;
}

export function formatRoomSummary(room: RoomSummary): string {
  const deviceLabel = room.devicesOn === 1 ? "device" : "devices";
  return `${room.name} currently has ${room.devicesOn} ${deviceLabel} running and is drawing ${formatWatts(room.powerWatts)}.`;
}

export function formatOfficeStatus(rooms: RoomSummary[]): string {
  const parts = rooms.map((room) => `${room.name}: ${room.devicesOn}/${room.totalDevices} on, ${formatWatts(room.powerWatts)}`);
  return parts.join(" | ");
}

export function formatUsageSummary(usage: UsageSnapshot): string {
  return `Current office draw is ${formatWatts(usage.currentWatts)} and today's estimated usage is ${formatKwh(usage.estimatedKwhToday)}.`;
}

export function formatAlertSummary(alert: AlertRecord): string {
  return `${alert.roomName}: ${alert.title} - ${alert.message}`;
}
