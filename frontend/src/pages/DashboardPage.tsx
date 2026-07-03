import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { OverviewCards } from "@/components/dashboard/OverviewCards";
import { RoomCards } from "@/components/dashboard/RoomCards";
import { DeviceTable } from "@/components/dashboard/DeviceTable";
import { PowerGauge } from "@/components/dashboard/PowerGauge";
import { MiniLineChart } from "@/components/dashboard/MiniLineChart";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import { FloorPlan } from "@/components/dashboard/FloorPlan";
import { useOfficeMonitor } from "@/hooks/useOfficeMonitor";
import { formatTime } from "@/lib/format";

export function DashboardPage() {
  const { officeSnapshot, devices, alerts, usage, powerHistory, dismissAlert } = useOfficeMonitor();

  return (
    <div className="space-y-6 pb-8">
      <OverviewCards snapshot={officeSnapshot} />

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <RoomCards rooms={officeSnapshot.rooms} />
        <PowerGauge value={usage.currentWatts} max={450} />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <MiniLineChart title="Room Power Chart" subtitle="Realtime power trend by room using the live shared store." points={powerHistory.total} />
        <Card>
          <CardTitle>Total Consumption Chart</CardTitle>
          <CardDescription>Realtime estimated office energy usage sampled from the backend.</CardDescription>
          <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-ink-900/40 p-4 text-sm text-slate-300">
            <p className="mb-3 text-white">Latest sample: {formatTime(usage.lastSampleAt)}</p>
            <div className="grid gap-3 md:grid-cols-3">
              {officeSnapshot.rooms.map((room) => (
                <div key={room.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-500">{room.name}</p>
                  <p className="mt-2 text-xl font-semibold text-white">{room.powerWatts} W</p>
                  <p className="mt-1 text-xs text-slate-400">{room.devicesOn}/{room.totalDevices} devices active</p>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <DeviceTable devices={devices} />
        <AlertsPanel alerts={alerts.slice(0, 5)} onDismiss={dismissAlert} />
      </div>

      <FloorPlan rooms={officeSnapshot.rooms} devices={devices} />
    </div>
  );
}
