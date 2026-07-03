import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { PowerPoint, RoomId } from "smart-office-shared";
import { formatWatts } from "@/lib/format";

function buildPoints(values: PowerPoint[], width: number, height: number): string {
  if (values.length === 0) {
    return "";
  }

  const maxValue = Math.max(...values.map((point) => point.watts), 1);
  return values
    .map((point, index) => {
      const x = values.length === 1 ? width / 2 : (index / (values.length - 1)) * width;
      const y = height - (point.watts / maxValue) * height;
      return `${x},${y}`;
    })
    .join(" ");
}

export function MiniLineChart({
  title,
  subtitle,
  points,
}: {
  title: string;
  subtitle: string;
  points: PowerPoint[];
}) {
  const gradientId = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-gradient`;
  const width = 540;
  const height = 180;
  const latest = points.at(-1)?.watts ?? 0;
  const polylinePoints = buildPoints(points.slice(-30), width, height);

  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{subtitle}</CardDescription>
        </div>
        <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-right">
          <p className="text-xs uppercase tracking-[0.25em] text-slate-400">Now</p>
          <p className="text-lg font-semibold text-white">{formatWatts(latest)}</p>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-white/10 bg-ink-900/40 p-4">
        <svg viewBox={`0 0 ${width} ${height}`} className="h-48 w-full">
          <defs>
            <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#5eead4" />
              <stop offset="100%" stopColor="#fb7185" />
            </linearGradient>
          </defs>
          <polyline
            points={polylinePoints}
            fill="none"
            stroke={`url(#${gradientId})`}
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {points.slice(-30).map((point, index, array) => {
            const x = array.length === 1 ? width / 2 : (index / Math.max(array.length - 1, 1)) * width;
            const maxValue = Math.max(...array.map((entry) => entry.watts), 1);
            const y = height - (point.watts / maxValue) * height;
            return <circle key={point.timestamp} cx={x} cy={y} r="4" fill="#5eead4" opacity="0.9" />;
          })}
        </svg>
      </div>
    </Card>
  );
}
