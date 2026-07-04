import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { MiniLineChart } from "@/components/dashboard/MiniLineChart";
import { useOfficeMonitor } from "@/hooks/useOfficeMonitor";
import { formatKwh, formatWatts } from "@/lib/format";

export function StatisticsPage() {
  const { officeSnapshot, usage, powerHistory } = useOfficeMonitor();
  const totalPoints = powerHistory.total;
  const peakWatts = totalPoints.length > 0 ? Math.max(...totalPoints.map((point) => point.watts)) : usage.currentWatts;

  return (
    <div className="space-y-6 pb-8">
      <Card>
        <CardTitle>Statistics</CardTitle>
        <CardDescription>Usage trends and office-wide activity summaries pulled from the same backend state.</CardDescription>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardDescription>Current power</CardDescription>
          <CardTitle className="mt-2 text-3xl">{formatWatts(usage.currentWatts)}</CardTitle>
          <Badge className="mt-3" variant="neutral">Realtime draw</Badge>
        </Card>
        <Card>
          <CardDescription>Estimated consumption today</CardDescription>
          <CardTitle className="mt-2 text-3xl">{formatKwh(usage.estimatedKwhToday)}</CardTitle>
          <Badge className="mt-3" variant="default">Calculated from live samples</Badge>
        </Card>
        <Card>
          <CardDescription>Peak observed power</CardDescription>
          <CardTitle className="mt-2 text-3xl">{formatWatts(peakWatts)}</CardTitle>
          <Badge className="mt-3" variant="warning">Latest session peak</Badge>
        </Card>
      </div>

      {/* Office-wide power history chart */}
      <MiniLineChart
        title="Total Office Power — Live Trend"
        subtitle="Rolling window of the last 30 samples across all 3 rooms."
        points={totalPoints}
      />

      {/* Per-room power history charts */}
      <div className="grid gap-4 lg:grid-cols-3">
        {officeSnapshot.rooms.map((room) => {
          const roomHistory = powerHistory.rooms[room.id] ?? [];
          const roomPeak = roomHistory.length > 0 ? Math.max(...roomHistory.map((point) => point.watts)) : room.powerWatts;

          return (
            <div key={room.id} className="flex flex-col gap-4">
              <Card>
                <CardDescription>{room.name}</CardDescription>
                <CardTitle className="mt-2 text-2xl">{formatWatts(room.powerWatts)}</CardTitle>
                <p className="mt-3 text-sm text-slate-300">Session peak: {formatWatts(roomPeak)}</p>
                <p className="mt-1 text-sm text-slate-400">{room.devicesOn}/{room.totalDevices} devices active</p>
              </Card>
              <MiniLineChart
                title={room.name}
                subtitle="Room power draw over time."
                points={roomHistory}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
