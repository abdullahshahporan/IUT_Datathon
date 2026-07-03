import { DEVICE_POWER_WATTS, HISTORY_MAX_POINTS, OFFICE_ROOMS } from "../config/constants";
import {
  AlertRecord,
  AlertSeverity,
  AlertType,
  DeviceChangeResult,
  DeviceRecord,
  DeviceStatus,
  OfficeSnapshot,
  PowerPoint,
  RoomId,
  RoomSummary,
  UsageSnapshot,
} from "smart-office-shared";
import { createId, getDateKey, toIso } from "../utils/time";
import { randomInt, weightedChoice } from "../utils/random";

type RoomRuntimeState = {
  id: RoomId;
  code: string;
  name: string;
  deviceIds: string[];
  allDevicesOnSince: Date | null;
};

type UsageRuntimeState = {
  dayKey: string;
  lastSampleAt: Date;
  totalWhToday: number;
};

function cloneDevice(device: DeviceRecord): DeviceRecord {
  return { ...device };
}

function createHistoryBucket(): PowerPoint[] {
  return [];
}

export class OfficeStore {
  private readonly devices = new Map<string, DeviceRecord>();

  private readonly rooms = new Map<RoomId, RoomRuntimeState>();

  private readonly alerts = new Map<string, AlertRecord>();

  private readonly totalPowerHistory: PowerPoint[] = [];

  private readonly roomPowerHistory = new Map<RoomId, PowerPoint[]>();

  private readonly usage: UsageRuntimeState;

  constructor() {
    const now = new Date();
    this.usage = {
      dayKey: getDateKey(now),
      lastSampleAt: now,
      totalWhToday: 0,
    };

    this.seedOffice(now);
    this.sampleSnapshot(now);
  }

  getDevices(): DeviceRecord[] {
    return [...this.devices.values()].sort((left, right) => {
      const roomCompare = left.roomName.localeCompare(right.roomName);
      if (roomCompare !== 0) {
        return roomCompare;
      }

      return left.name.localeCompare(right.name);
    });
  }

  getDevice(deviceId: string): DeviceRecord | null {
    const device = this.devices.get(deviceId);
    return device ? cloneDevice(device) : null;
  }

  getRooms(): RoomSummary[] {
    return OFFICE_ROOMS.map((room) => this.buildRoomSummary(room.id));
  }

  getAlerts(includeDismissed = false): AlertRecord[] {
    return [...this.alerts.values()]
      .filter((alert) => includeDismissed || alert.dismissedAt === null)
      .sort((left, right) => right.generatedAt.localeCompare(left.generatedAt));
  }

  getActiveAlerts(): AlertRecord[] {
    return this.getAlerts(false);
  }

  getUsageSnapshot(): UsageSnapshot {
    return {
      currentWatts: this.getCurrentPowerWatts(),
      estimatedKwhToday: Number((this.usage.totalWhToday / 1000).toFixed(3)),
      lastSampleAt: this.usage.lastSampleAt.toISOString(),
      todayWh: Number(this.usage.totalWhToday.toFixed(2)),
    };
  }

  getPowerHistory(): { total: PowerPoint[]; rooms: Record<RoomId, PowerPoint[]> } {
    const rooms = OFFICE_ROOMS.reduce<Record<RoomId, PowerPoint[]>>((accumulator, room) => {
      accumulator[room.id] = [...(this.roomPowerHistory.get(room.id) ?? [])];
      return accumulator;
    }, {} as Record<RoomId, PowerPoint[]>);

    return {
      total: [...this.totalPowerHistory],
      rooms,
    };
  }

  getOfficeSnapshot(): OfficeSnapshot {
    const rooms = this.getRooms();
    const usage = this.getUsageSnapshot();

    return {
      totalDevices: this.devices.size,
      devicesOn: this.getDevicesOnCount(),
      currentPowerWatts: usage.currentWatts,
      estimatedKwhToday: usage.estimatedKwhToday,
      rooms,
      alerts: this.getActiveAlerts(),
    };
  }

  getRoomDevices(roomId: RoomId): DeviceRecord[] {
    return this.getDevices().filter((device) => device.roomId === roomId);
  }

  setDeviceStatus(
    deviceId: string,
    nextStatus: DeviceStatus,
    source: "simulator" | "manual" = "simulator",
    timestamp = new Date(),
  ): DeviceChangeResult | null {
    const existing = this.devices.get(deviceId);

    if (!existing || existing.status === nextStatus) {
      return null;
    }

    this.sampleSnapshot(timestamp);

    const previous = cloneDevice(existing);
    existing.status = nextStatus;
    existing.powerDrawWatts = nextStatus === "ON" ? DEVICE_POWER_WATTS[existing.type] : 0;
    existing.lastChangedAt = toIso(timestamp);

    this.refreshRoomState(existing.roomId, timestamp);
    this.sampleSnapshot(timestamp);

    return {
      previous,
      current: cloneDevice(existing),
      changedAt: toIso(timestamp),
      source,
    };
  }

  toggleDevice(deviceId: string, source: "simulator" | "manual" = "simulator", timestamp = new Date()): DeviceChangeResult | null {
    const device = this.devices.get(deviceId);
    if (!device) {
      return null;
    }

    const nextStatus: DeviceStatus = device.status === "ON" ? "OFF" : "ON";
    return this.setDeviceStatus(deviceId, nextStatus, source, timestamp);
  }

  dismissAlert(alertId: string, timestamp = new Date()): AlertRecord | null {
    const alert = this.alerts.get(alertId);
    if (!alert || alert.dismissedAt !== null) {
      return null;
    }

    alert.dismissedAt = toIso(timestamp);
    return { ...alert };
  }

  createAlert(input: {
    type: AlertType;
    severity: AlertSeverity;
    title: string;
    message: string;
    roomId: RoomId;
    roomName: string;
    deviceId?: string;
    deviceName?: string;
    signature: string;
    timestamp?: Date;
  }): AlertRecord {
    const existing = [...this.alerts.values()].find((alert) => alert.signature === input.signature && alert.dismissedAt === null);
    if (existing) {
      return { ...existing };
    }

    const generatedAt = toIso(input.timestamp ?? new Date());
    const alert: AlertRecord = {
      id: createId("alert"),
      signature: input.signature,
      type: input.type,
      severity: input.severity,
      title: input.title,
      message: input.message,
      roomId: input.roomId,
      roomName: input.roomName,
      generatedAt,
      dismissedAt: null,
      ...(input.deviceId ? { deviceId: input.deviceId } : {}),
      ...(input.deviceName ? { deviceName: input.deviceName } : {}),
    };

    this.alerts.set(alert.id, alert);
    return { ...alert };
  }

  hasActiveAlert(signature: string): boolean {
    return [...this.alerts.values()].some((alert) => alert.signature === signature && alert.dismissedAt === null);
  }

  sampleSnapshot(timestamp = new Date()): UsageSnapshot {
    this.rollUsage(timestamp);

    const totalWatts = this.getCurrentPowerWatts();
    const totalPoint: PowerPoint = {
      timestamp: toIso(timestamp),
      watts: totalWatts,
    };

    this.totalPowerHistory.push(totalPoint);
    if (this.totalPowerHistory.length > HISTORY_MAX_POINTS) {
      this.totalPowerHistory.splice(0, this.totalPowerHistory.length - HISTORY_MAX_POINTS);
    }

    for (const room of OFFICE_ROOMS) {
      const point: PowerPoint = {
        timestamp: totalPoint.timestamp,
        watts: this.getRoomPowerWatts(room.id),
      };

      const bucket = this.roomPowerHistory.get(room.id) ?? createHistoryBucket();
      bucket.push(point);
      if (bucket.length > HISTORY_MAX_POINTS) {
        bucket.splice(0, bucket.length - HISTORY_MAX_POINTS);
      }
      this.roomPowerHistory.set(room.id, bucket);
    }

    return this.getUsageSnapshot();
  }

  getDevicesOnCount(): number {
    return [...this.devices.values()].filter((device) => device.status === "ON").length;
  }

  getCurrentPowerWatts(): number {
    return [...this.devices.values()].reduce((sum, device) => sum + device.powerDrawWatts, 0);
  }

  getRoomPowerWatts(roomId: RoomId): number {
    return this.getRoomDevices(roomId).reduce((sum, device) => sum + device.powerDrawWatts, 0);
  }

  getRoomAllOnSince(roomId: RoomId): Date | null {
    return this.rooms.get(roomId)?.allDevicesOnSince ?? null;
  }

  getRoomSummary(roomId: RoomId): RoomSummary {
    return this.buildRoomSummary(roomId);
  }

  pickDeviceForSimulation(): DeviceRecord {
    const allDevices = this.getDevices();
    if (allDevices.length === 0) {
      throw new Error("No devices are available for simulation");
    }

    return allDevices[randomInt(0, allDevices.length - 1)]!;
  }

  shouldToggleDevice(device: DeviceRecord): boolean {
    const flipProbability =
      device.type === "fan"
        ? device.status === "ON"
          ? 0.18
          : 0.10
        : device.status === "ON"
          ? 0.12
          : 0.22;

    return Math.random() < flipProbability;
  }

  getTargetStatusAfterToggle(device: DeviceRecord): DeviceStatus {
    return device.status === "ON" ? "OFF" : "ON";
  }

  getRandomRoomId(): RoomId {
    return weightedChoice<RoomId>(OFFICE_ROOMS.map((room) => ({ value: room.id, weight: 1 })));
  }

  private seedOffice(now: Date): void {
    for (const room of OFFICE_ROOMS) {
      const deviceIds: string[] = [];

      for (let index = 0; index < room.fanCount; index += 1) {
        const device = this.createDevice(room.id, room.name, "fan", index + 1, this.getInitialStatus("fan"));
        deviceIds.push(device.id);
      }

      for (let index = 0; index < room.lightCount; index += 1) {
        const device = this.createDevice(room.id, room.name, "light", index + 1, this.getInitialStatus("light"));
        deviceIds.push(device.id);
      }

      this.rooms.set(room.id, {
        id: room.id,
        code: room.code,
        name: room.name,
        deviceIds,
        allDevicesOnSince: null,
      });

      this.roomPowerHistory.set(room.id, []);
      this.refreshRoomState(room.id, now);
    }
  }

  private createDevice(
    roomId: RoomId,
    roomName: string,
    type: "fan" | "light",
    index: number,
    status: DeviceStatus,
  ): DeviceRecord {
    const id = createId(`${roomId}-${type}`);
    const powerDrawWatts = status === "ON" ? DEVICE_POWER_WATTS[type] : 0;
    const device: DeviceRecord = {
      id,
      name: `${roomName} ${type === "fan" ? "Fan" : "Light"} ${index}`,
      roomId,
      roomName,
      type,
      status,
      powerDrawWatts,
      lastChangedAt: toIso(new Date()),
    };

    this.devices.set(id, device);
    return device;
  }

  private getInitialStatus(type: "fan" | "light"): DeviceStatus {
    const onProbability = type === "fan" ? 0.45 : 0.65;
    return Math.random() < onProbability ? "ON" : "OFF";
  }

  private refreshRoomState(roomId: RoomId, timestamp: Date): void {
    const room = this.rooms.get(roomId);
    if (!room) {
      return;
    }

    const devices = this.getRoomDevices(roomId);
    const allDevicesOn = devices.length > 0 && devices.every((device) => device.status === "ON");

    if (allDevicesOn) {
      room.allDevicesOnSince ??= timestamp;
    } else {
      room.allDevicesOnSince = null;
    }
  }

  private rollUsage(timestamp: Date): void {
    const dayKey = getDateKey(timestamp);
    if (dayKey !== this.usage.dayKey) {
      this.usage.dayKey = dayKey;
      this.usage.totalWhToday = 0;
      this.usage.lastSampleAt = timestamp;
      return;
    }

    const elapsedHours = (timestamp.getTime() - this.usage.lastSampleAt.getTime()) / 3_600_000;
    if (elapsedHours > 0) {
      this.usage.totalWhToday += this.getCurrentPowerWatts() * elapsedHours;
    }

    this.usage.lastSampleAt = timestamp;
  }

  private buildRoomSummary(roomId: RoomId): RoomSummary {
    const room = this.rooms.get(roomId);
    if (!room) {
      throw new Error(`Room not found: ${roomId}`);
    }

    const devices = this.getRoomDevices(roomId);
    const devicesOn = devices.filter((device) => device.status === "ON").length;
    const powerWatts = devices.reduce((sum, device) => sum + device.powerDrawWatts, 0);
    const totalDevices = devices.length;

    return {
      id: room.id,
      code: room.code as RoomSummary["code"],
      name: room.name,
      totalDevices,
      devicesOn,
      powerWatts,
      quickStatus:
        devicesOn === 0
          ? "Idle"
          : devicesOn === totalDevices
            ? "Fully active"
            : `${devicesOn}/${totalDevices} active`,
      allDevicesOnSince: room.allDevicesOnSince ? toIso(room.allDevicesOnSince) : null,
    };
  }
}
