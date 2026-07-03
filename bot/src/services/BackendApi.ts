import { env } from "../config/env";
import {
  AlertsResponse,
  DeviceListResponse,
  RoomSummary,
  RoomsResponse,
  UsageResponse,
  AlertRecord,
  UsageSnapshot,
} from "smart-office-shared";

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${env.backendApiUrl}${path}`);

  if (!response.ok) {
    throw new Error(`Backend request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export class BackendApi {
  async getDevices(): Promise<DeviceListResponse> {
    return request<DeviceListResponse>("/devices");
  }

  async getRooms(): Promise<RoomsResponse> {
    return request<RoomsResponse>("/rooms");
  }

  async getAlerts(includeAll = false): Promise<AlertsResponse> {
    return request<AlertsResponse>(`/alerts${includeAll ? "?active=false" : ""}`);
  }

  async getUsage(): Promise<UsageSnapshot> {
    const response = await request<UsageResponse>("/usage");
    return response.data.usage;
  }

  async getRoomByCode(code: string): Promise<RoomSummary | null> {
    const response = await this.getRooms();
    return response.data.find((room) => room.code === code) ?? null;
  }

  async getAlertsText(): Promise<string> {
    const response = await this.getAlerts();
    if (response.data.length === 0) {
      return "There are no active alerts right now.";
    }

    return response.data.map((alert) => `${alert.roomName}: ${alert.title}`).join("\n");
  }

  async getAlertPayloads(): Promise<AlertRecord[]> {
    const response = await this.getAlerts();
    return response.data;
  }
}
