import { io, Socket } from "socket.io-client";
import { AlertRecord, DeviceRecord, UsageSnapshot } from "smart-office-shared";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL ?? "http://localhost:4000";

export type OfficeSocketEvents = {
  "device:update": (device: DeviceRecord) => void;
  "alert:new": (alert: AlertRecord) => void;
  "usage:update": (usage: UsageSnapshot) => void;
};

let socket: Socket<OfficeSocketEvents> | null = null;

export function getSocket(): Socket<OfficeSocketEvents> {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      autoConnect: true,
    });
  }

  return socket;
}
