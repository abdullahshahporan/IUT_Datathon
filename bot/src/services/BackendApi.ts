import { env } from "../config/env";
import {
  DeviceRecord,
  RoomSummary,
  AlertRecord,
  UsageSnapshot,
} from "smart-office-shared";

// Inline response wrapper shapes that match the backend REST API
interface ListResponse<T> { data: T[]; total?: number }
interface SingleResponse<T> { data: T }
interface UsageResponseBody {
  data: {
    usage: UsageSnapshot;
    powerHistory: {
      total: Array<{ timestamp: string; watts: number }>;
      rooms: Record<string, Array<{ timestamp: string; watts: number }>>;
    };
  };
}

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${env.backendApiUrl}${path}`);

  if (!response.ok) {
    throw new Error(`Backend request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export class BackendApi {
  async getDevices(): Promise<ListResponse<DeviceRecord>> {
    return request<ListResponse<DeviceRecord>>("/devices");
  }

  async getRooms(): Promise<ListResponse<RoomSummary>> {
    return request<ListResponse<RoomSummary>>("/rooms");
  }

  async getAlerts(includeAll = false): Promise<ListResponse<AlertRecord>> {
    return request<ListResponse<AlertRecord>>(`/alerts${includeAll ? "?active=false" : ""}`);
  }

  async getUsage(): Promise<UsageSnapshot> {
    const response = await request<UsageResponseBody>("/usage");
    return response.data.usage;
  }

  async getRoomByCode(code: string): Promise<RoomSummary | null> {
    const response = await this.getRooms();
    return response.data.find((room: RoomSummary) => room.code === code) ?? null;
  }

  async getAlertsText(): Promise<string> {
    const response = await this.getAlerts();
    if (response.data.length === 0) {
      return "There are no active alerts right now.";
    }

    return response.data.map((alert: AlertRecord) => `${alert.roomName}: ${alert.title}`).join("\n");
  }

  async getAlertPayloads(): Promise<AlertRecord[]> {
    const response = await this.getAlerts();
    return response.data;
  }
}
