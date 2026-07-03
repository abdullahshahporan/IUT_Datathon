import { useEffect, useMemo, useRef, useState } from "react";
import {
  fetchAlerts,
  fetchDevices,
  fetchRooms,
  fetchUsage,
  dismissAlert as dismissAlertRequest,
} from "@/lib/api";
import { getSocket } from "@/lib/socket";
import {
  AlertRecord,
  DeviceRecord,
  PowerPoint,
  RoomSummary,
  UsageSnapshot,
  OfficeSnapshot,
} from "smart-office-shared";

type LoadingState = "idle" | "loading" | "ready" | "error";

type PowerHistory = {
  total: PowerPoint[];
  rooms: Record<string, PowerPoint[]>;
};

const emptyUsage: UsageSnapshot = {
  currentWatts: 0,
  estimatedKwhToday: 0,
  lastSampleAt: new Date().toISOString(),
  todayWh: 0,
};

export function useOfficeMonitor() {
  const [loadingState, setLoadingState] = useState<LoadingState>("loading");
  const [devices, setDevices] = useState<DeviceRecord[]>([]);
  const [rooms, setRooms] = useState<RoomSummary[]>([]);
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [usage, setUsage] = useState<UsageSnapshot>(emptyUsage);
  const [powerHistory, setPowerHistory] = useState<PowerHistory>({
    total: [],
    rooms: { "drawing-room": [], "work-room-1": [], "work-room-2": [] },
  });
  const [error, setError] = useState<string | null>(null);
  const devicesRef = useRef<DeviceRecord[]>([]);

  useEffect(() => {
    let mounted = true;

    async function loadInitialState(): Promise<void> {
      try {
        setLoadingState("loading");
        const [deviceResponse, roomResponse, alertResponse, usageResponse] = await Promise.all([
          fetchDevices(),
          fetchRooms(),
          fetchAlerts(),
          fetchUsage(),
        ]);

        if (!mounted) {
          return;
        }

        setDevices(deviceResponse.data);
        devicesRef.current = deviceResponse.data;
        setRooms(roomResponse.data);
        setAlerts(alertResponse.data);
        setUsage(usageResponse.data.usage);
        setPowerHistory(usageResponse.data.powerHistory);
        setLoadingState("ready");
      } catch (loadError) {
        if (!mounted) {
          return;
        }

        setError(loadError instanceof Error ? loadError.message : "Failed to load office data");
        setLoadingState("error");
      }
    }

    void loadInitialState();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const socket = getSocket();

    const handleDeviceUpdate = (device: DeviceRecord) => {
      setDevices((current) => {
        const nextDevices = current.map((entry) => (entry.id === device.id ? device : entry));
        devicesRef.current = nextDevices;

        setRooms((currentRooms) =>
          currentRooms.map((room) => {
            if (room.id !== device.roomId) {
              return room;
            }

            const roomDevices = nextDevices.filter((entry) => entry.roomId === room.id);
            const devicesOn = roomDevices.filter((entry) => entry.status === "ON").length;
            const powerWatts = roomDevices.reduce((sum, entry) => sum + entry.powerDrawWatts, 0);

            return {
              ...room,
              devicesOn,
              powerWatts,
              quickStatus:
                devicesOn === 0
                  ? "Idle"
                  : devicesOn === roomDevices.length
                    ? "Fully active"
                    : `${devicesOn}/${roomDevices.length} active`,
            };
          }),
        );

        return nextDevices;
      });
    };

    const handleAlert = (alert: AlertRecord) => {
      setAlerts((current) => {
        if (current.some((entry) => entry.id === alert.id)) {
          return current;
        }

        return [alert, ...current].sort((left, right) => right.generatedAt.localeCompare(left.generatedAt));
      });
    };

    const handleUsage = (nextUsage: UsageSnapshot) => {
      setUsage(nextUsage);
    };

    socket.on("device:update", handleDeviceUpdate);
    socket.on("alert:new", handleAlert);
    socket.on("usage:update", handleUsage);

    return () => {
      socket.off("device:update", handleDeviceUpdate);
      socket.off("alert:new", handleAlert);
      socket.off("usage:update", handleUsage);
    };
  }, []);

  const officeSnapshot = useMemo<OfficeSnapshot>(
    () => ({
      totalDevices: devices.length,
      devicesOn: devices.filter((device) => device.status === "ON").length,
      currentPowerWatts: usage.currentWatts,
      estimatedKwhToday: usage.estimatedKwhToday,
      rooms,
      alerts,
    }),
    [alerts, devices, rooms, usage.currentWatts, usage.estimatedKwhToday],
  );

  async function dismissAlert(alertId: string): Promise<void> {
    const dismissed = await dismissAlertRequest(alertId);
    setAlerts((current) => current.map((alert) => (alert.id === dismissed.id ? dismissed : alert)));
  }

  return {
    loadingState,
    error,
    devices,
    rooms,
    alerts,
    usage,
    powerHistory,
    officeSnapshot,
    dismissAlert,
  };
}
