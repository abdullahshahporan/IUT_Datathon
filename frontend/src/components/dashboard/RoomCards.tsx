import { motion } from "framer-motion";
import { Zap, Fan } from "lucide-react";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { RoomSummary } from "smart-office-shared";
import { formatWatts } from "@/lib/format";

export function RoomCards({ rooms }: { rooms: RoomSummary[] }) {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {rooms.map((room, index) => (
        <motion.div
          key={room.id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.08, duration: 0.35 }}
        >
          <Card className="h-full">
            <div className="flex items-start justify-between gap-4">
              <div>
                <CardDescription>{room.name}</CardDescription>
                <CardTitle className="mt-2 text-2xl">{formatWatts(room.powerWatts)}</CardTitle>
              </div>
              <Badge variant={room.devicesOn === 0 ? "neutral" : room.devicesOn === room.totalDevices ? "success" : "warning"}>{room.quickStatus}</Badge>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4 text-sm text-slate-300">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="flex items-center gap-2 text-slate-400"><Fan className="h-4 w-4" />Devices ON</p>
                <p className="mt-2 text-xl font-semibold text-white">{room.devicesOn}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="flex items-center gap-2 text-slate-400"><Zap className="h-4 w-4" />Total devices</p>
                <p className="mt-2 text-xl font-semibold text-white">{room.totalDevices}</p>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
