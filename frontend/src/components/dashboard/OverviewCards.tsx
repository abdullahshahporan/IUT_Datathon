import { BatteryCharging, Flame, Lightbulb, PlugZap } from "lucide-react";
import { MetricCard } from "./MetricCard";
import { formatKwh, formatWatts } from "@/lib/format";
import { OfficeSnapshot } from "smart-office-shared";

export function OverviewCards({ snapshot }: { snapshot: OfficeSnapshot }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <MetricCard label="Total Devices" value={String(snapshot.totalDevices)} delta="All simulated office devices online in the shared store." accent="from-aurora-500 to-transparent" />
      <MetricCard label="Devices ON" value={String(snapshot.devicesOn)} delta="Live operational devices across the three rooms." accent="from-amber-500 to-transparent" />
      <MetricCard label="Current Power" value={formatWatts(snapshot.currentPowerWatts)} delta="Instantaneous office draw from every device." accent="from-rose-500 to-transparent" />
      <MetricCard label="Estimated Today Usage" value={formatKwh(snapshot.estimatedKwhToday)} delta="Cumulative simulated energy consumption today." accent="from-sky-500 to-transparent" />
    </div>
  );
}
