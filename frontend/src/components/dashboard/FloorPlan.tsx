import { motion } from "framer-motion";
import { Fan, Lightbulb } from "lucide-react";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { DeviceRecord, RoomSummary } from "smart-office-shared";
import { cn } from "@/lib/cn";

type RoomShape = {
  id: string;
  label: string;
  x: number;
  y: number;
};

const roomShapes: RoomShape[] = [
  { id: "drawing-room", label: "Drawing Room", x: 6, y: 18 },
  { id: "work-room-1", label: "Work Room 1", x: 36, y: 18 },
  { id: "work-room-2", label: "Work Room 2", x: 66, y: 18 },
];

function RoomIcon({ type, active }: { type: "fan" | "light"; active: boolean }) {
  const Icon = type === "fan" ? Fan : Lightbulb;

  return (
    <div
      className={cn(
        "flex h-10 w-10 items-center justify-center rounded-2xl border transition-all",
        active
          ? type === "fan"
            ? "border-aurora-400/30 bg-aurora-500/20 text-aurora-200 shadow-[0_0_24px_rgba(20,184,166,0.2)]"
            : "border-ember-400/30 bg-ember-500/20 text-amber-100 shadow-[0_0_24px_rgba(245,158,11,0.18)]"
          : "border-white/10 bg-white/5 text-slate-500",
        type === "fan" && active ? "animate-spinSlow" : "",
        type === "light" && active ? "animate-pulseGlow" : "",
      )}
    >
      <Icon className="h-4 w-4" />
    </div>
  );
}

export function FloorPlan({ rooms, devices }: { rooms: RoomSummary[]; devices: DeviceRecord[] }) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <CardTitle>Office Floor Plan</CardTitle>
          <CardDescription>Simple top view with live device glow and fan rotation when active.</CardDescription>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-[1.75rem] border border-white/10 bg-ink-900/40 p-4">
        <div className="grid gap-4 md:grid-cols-3">
          {roomShapes.map((shape, index) => {
            const room = rooms.find((entry) => entry.id === shape.id);
            const roomDevices = devices.filter((device) => device.roomId === shape.id);
            const activeLights = roomDevices.filter((device) => device.type === "light" && device.status === "ON").length;
            const activeFans = roomDevices.filter((device) => device.type === "fan" && device.status === "ON").length;

            return (
              <motion.div
                key={shape.id}
                className="relative rounded-[1.5rem] border border-white/10 bg-white/5 p-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08, duration: 0.35 }}
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Room</p>
                    <h4 className="mt-1 font-semibold text-white">{room?.name ?? shape.label}</h4>
                  </div>
                  <div className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300">
                    {room?.quickStatus ?? "Unknown"}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {roomDevices
                    .filter((device) => device.type === "light")
                    .slice(0, 3)
                    .map((device) => (
                      <RoomIcon key={device.id} type="light" active={device.status === "ON"} />
                    ))}
                  {roomDevices
                    .filter((device) => device.type === "fan")
                    .slice(0, 2)
                    .map((device) => (
                      <RoomIcon key={device.id} type="fan" active={device.status === "ON"} />
                    ))}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-300">
                  <div className="rounded-2xl border border-white/10 bg-ink-950/40 p-3">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Lights on</p>
                    <p className="mt-1 text-xl font-semibold text-white">{activeLights}</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-ink-950/40 p-3">
                    <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Fans on</p>
                    <p className="mt-1 text-xl font-semibold text-white">{activeFans}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
