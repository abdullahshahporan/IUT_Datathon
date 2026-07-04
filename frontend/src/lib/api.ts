import {
  AlertsResponse,
  DeviceListResponse,
  RoomsResponse,
  UsageResponse,
  AlertRecord,
} from "smart-office-shared";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function fetchDevices(): Promise<DeviceListResponse> {
  return request<DeviceListResponse>("/devices");
}

export async function fetchRooms(): Promise<RoomsResponse> {
  return request<RoomsResponse>("/rooms");
}

export async function fetchAlerts(includeAll = false): Promise<AlertsResponse> {
  const suffix = includeAll ? "?active=false" : "";
  return request<AlertsResponse>(`/alerts${suffix}`);
}

export async function dismissAlert(alertId: string): Promise<AlertRecord> {
  const response = await request<{ data: AlertRecord }>(`/alerts/${alertId}/dismiss`, {
    method: "POST",
  });

  return response.data;
}

export async function fetchUsage(): Promise<UsageResponse> {
  return request<UsageResponse>("/usage");
}

export async function toggleDevice(deviceId: string): Promise<any> {
  return request<any>(`/devices/${deviceId}/toggle`, {
    method: "POST",
  });
}
