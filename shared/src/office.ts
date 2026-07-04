export type RoomId = "drawing-room" | "work-room-1" | "work-room-2";

export type RoomCode = "drawing" | "work1" | "work2";

export type DeviceType = "fan" | "light";

export type DeviceStatus = "ON" | "OFF";

export type AlertSeverity = "info" | "warning" | "critical";

export type AlertType = "device-on-after-hours" | "room-on-too-long" | "high-power-consumption";

export interface DeviceRecord {
  id: string;
  name: string;
  roomId: RoomId;
  roomName: string;
  type: DeviceType;
  status: DeviceStatus;
  powerDrawWatts: number;
  lastChangedAt: string;
}

export interface RoomDefinition {
  id: RoomId;
  code: RoomCode;
  name: string;
  fanCount: number;
  lightCount: number;
}

export interface RoomSummary {
  id: RoomId;
  code: RoomCode;
  name: string;
  totalDevices: number;
  devicesOn: number;
  powerWatts: number;
  quickStatus: string;
  allDevicesOnSince: string | null;
}

export interface PowerPoint {
  timestamp: string;
  watts: number;
}

export interface UsageSnapshot {
  currentWatts: number;
  estimatedKwhToday: number;
  lastSampleAt: string;
  todayWh: number;
}

export interface AlertRecord {
  id: string;
  signature: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  roomId: RoomId;
  roomName: string;
  deviceId?: string;
  deviceName?: string;
  generatedAt: string;
  dismissedAt: string | null;
}

export interface DeviceChangeResult {
  previous: DeviceRecord;
  current: DeviceRecord;
  changedAt: string;
  source: "simulator" | "manual";
}

export interface OfficeSnapshot {
  totalDevices: number;
  devicesOn: number;
  currentPowerWatts: number;
  estimatedKwhToday: number;
  rooms: RoomSummary[];
  alerts: AlertRecord[];
}

export interface RealtimePayloads {
  "device:update": DeviceRecord;
  "alert:new": AlertRecord;
  "usage:update": UsageSnapshot;
}
