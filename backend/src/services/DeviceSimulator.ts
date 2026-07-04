import { Server } from "socket.io";
import { env } from "../config/env";
import { DeviceChangeResult, DeviceRecord } from "smart-office-shared";
import { randomInt, pickOne } from "../utils/random";
import { OfficeStore } from "./OfficeStore";
import { AlertEngine } from "./AlertEngine";

type RealtimeEmitter = Pick<Server, "emit">;

/**
 * Probability tables keyed by time-of-day segment.
 * Values are [ON→OFF chance, OFF→ON chance] per device type.
 */
const TIME_PROBABILITIES: Record<
  "office" | "evening" | "night",
  { fan: [number, number]; light: [number, number] }
> = {
  /** 09:00 – 17:00  — busy working hours, devices stay on */
  office:  { fan: [0.08, 0.20], light: [0.08, 0.35] },
  /** 17:00 – 22:00  — wind-down, people leaving */
  evening: { fan: [0.30, 0.03], light: [0.25, 0.05] },
  /** 22:00 – 09:00  — overnight, nearly everything off */
  night:   { fan: [0.40, 0.01], light: [0.35, 0.02] },
};

function getTimeSegment(hour: number): keyof typeof TIME_PROBABILITIES {
  if (hour >= 9 && hour < 17) return "office";
  if (hour >= 17 && hour < 22) return "evening";
  return "night";
}

export class DeviceSimulator {
  private timer: NodeJS.Timeout | null = null;

  private started = false;

  constructor(
    private readonly store: OfficeStore,
    private readonly alertEngine: AlertEngine,
    private readonly io: RealtimeEmitter,
  ) {}

  start(): void {
    if (this.started) {
      return;
    }

    this.started = true;
    this.scheduleNextTick(env.simulatorInitialDelayMs);
  }

  stop(): void {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    this.started = false;
  }

  private scheduleNextTick(delayOverride?: number): void {
    const delay = delayOverride ?? randomInt(env.simulatorMinIntervalMs, env.simulatorMaxIntervalMs);
    this.timer = setTimeout(() => {
      void this.runTick();
    }, delay);
  }

  private async runTick(): Promise<void> {
    const timestamp = new Date();
    const changedDevices = this.applyRandomChanges(timestamp);

    for (const change of changedDevices) {
      this.io.emit("device:update", change.current);
      const alerts = this.alertEngine.evaluateDeviceChange(change);
      for (const alert of alerts) {
        this.io.emit("alert:new", alert);
      }
    }

    const scheduledAlerts = this.alertEngine.evaluateRoomPressure(timestamp);
    for (const alert of scheduledAlerts) {
      this.io.emit("alert:new", alert);
    }

    const usage = this.store.sampleSnapshot(timestamp);
    this.io.emit("usage:update", usage);

    // Check if office is drawing more than 85% of max capacity
    const powerAlerts = this.alertEngine.evaluateHighPowerAlert(usage.currentWatts, timestamp);
    for (const alert of powerAlerts) {
      this.io.emit("alert:new", alert);
    }

    this.scheduleNextTick();
  }

  private applyRandomChanges(timestamp: Date): DeviceChangeResult[] {
    const changes: DeviceChangeResult[] = [];
    const desiredChanges = randomInt(1, 2);
    const candidateDevices = this.store.getDevices();

    if (candidateDevices.length === 0) {
      return changes;
    }

    const seen = new Set<string>();
    for (let attempt = 0; attempt < candidateDevices.length && changes.length < desiredChanges; attempt += 1) {
      const room = pickOne(this.store.getRooms());
      const roomDevices = this.store.getRoomDevices(room.id).filter((device) => !seen.has(device.id));
      if (roomDevices.length === 0) {
        continue;
      }

      const device = this.pickRealisticDevice(roomDevices);
      seen.add(device.id);

      if (!this.shouldToggleWithTimeAwareness(device, timestamp.getHours())) {
        continue;
      }

      const result = this.store.toggleDevice(device.id, "simulator", timestamp);
      if (result) {
        changes.push(result);
      }
    }

    return changes;
  }

  private pickRealisticDevice(devices: DeviceRecord[]): DeviceRecord {
    const onDevices = devices.filter((device) => device.status === "ON");
    const offDevices = devices.filter((device) => device.status === "OFF");

    if (onDevices.length > 0 && offDevices.length > 0) {
      const preferActive = Math.random() < 0.55;
      return preferActive ? pickOne(onDevices) : pickOne(offDevices);
    }

    return pickOne(devices);
  }

  /**
   * Time-aware toggle decision: probability of flipping a device changes
   * depending on whether it's office hours, evening wind-down, or overnight.
   */
  private shouldToggleWithTimeAwareness(device: DeviceRecord, hour: number): boolean {
    const segment = getTimeSegment(hour);
    const [onToOff, offToOn] = TIME_PROBABILITIES[segment][device.type];
    const probability = device.status === "ON" ? onToOff : offToOn;
    return Math.random() < probability;
  }
}
