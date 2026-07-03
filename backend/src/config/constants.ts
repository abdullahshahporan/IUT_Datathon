import { RoomDefinition } from "smart-office-shared";

export const OFFICE_ROOMS: RoomDefinition[] = [
  {
    id: "drawing-room",
    code: "drawing",
    name: "Drawing Room",
    fanCount: 2,
    lightCount: 4,
  },
  {
    id: "work-room-1",
    code: "work1",
    name: "Work Room 1",
    fanCount: 2,
    lightCount: 4,
  },
  {
    id: "work-room-2",
    code: "work2",
    name: "Work Room 2",
    fanCount: 2,
    lightCount: 4,
  },
];

export const DEVICE_POWER_WATTS = {
  fan: 60,
  light: 15,
} as const;

export const ROOM_ALERT_THRESHOLD_MS = 2 * 60 * 60 * 1000;
export const AFTER_HOURS_START = 17;

export const HISTORY_MAX_POINTS = 180;
