import { RoomDefinition } from "smart-office-shared";

export const OFFICE_ROOMS: RoomDefinition[] = [
  {
    id: "drawing-room",
    code: "drawing",
    name: "Drawing Room",
    fanCount: 2,
    lightCount: 3,
  },
  {
    id: "work-room-1",
    code: "work1",
    name: "Work Room 1",
    fanCount: 2,
    lightCount: 3,
  },
  {
    id: "work-room-2",
    code: "work2",
    name: "Work Room 2",
    fanCount: 2,
    lightCount: 3,
  },
];

export const DEVICE_POWER_WATTS = {
  fan: 60,
  light: 15,
} as const;

/** Office hours: 9 AM – 5 PM */
export const BEFORE_HOURS_END = 9;
export const AFTER_HOURS_START = 17;

export const ROOM_ALERT_THRESHOLD_MS = 2 * 60 * 60 * 1000;

/** Max theoretical office draw: 3 rooms × (2 fans × 60 W + 3 lights × 15 W) = 3 × 165 W = 495 W */
export const MAX_OFFICE_WATTS = 495;
/** Fire a high-power alert when the office exceeds 85% of capacity */
export const HIGH_POWER_THRESHOLD_WATTS = Math.round(MAX_OFFICE_WATTS * 0.85);

export const HISTORY_MAX_POINTS = 180;
