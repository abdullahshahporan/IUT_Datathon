import { motion } from "framer-motion";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { formatWatts } from "@/lib/format";

export function PowerGauge({ value, max = 500 }: { value: number; max?: number }) {
  const percent = Math.min(100, Math.round((value / max) * 100));
  const radius = 74;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (percent / 100) * circumference;

  return (
    <Card className="flex h-full flex-col justify-between">
      <div>
        <CardTitle>Live Power Meter</CardTitle>
        <CardDescription>Animated office draw based on current device state.</CardDescription>
      </div>

      <div className="mt-6 flex items-center justify-center">
        <svg viewBox="0 0 220 220" className="h-56 w-56 overflow-visible">
          <defs>
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#5eead4" />
              <stop offset="100%" stopColor="#f59e0b" />
            </linearGradient>
          </defs>
          <circle cx="110" cy="110" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="18" />
          <motion.circle
            cx="110"
            cy="110"
            r={radius}
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth="18"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            style={{ transformOrigin: "110px 110px", transform: "rotate(-90deg)" }}
          />
          <text x="110" y="98" fill="#cbd5e1" textAnchor="middle" fontSize="14" letterSpacing="4">
            OFFICE POWER
          </text>
          <text x="110" y="124" fill="white" textAnchor="middle" fontSize="28" fontWeight="700">
            {percent}%
          </text>
          <text x="110" y="150" fill="#94a3b8" textAnchor="middle" fontSize="12">
            {formatWatts(value)}
          </text>
        </svg>
      </div>

      <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
        <span>Low</span>
        <span>Moderate</span>
        <span>High</span>
      </div>
    </Card>
  );
}
