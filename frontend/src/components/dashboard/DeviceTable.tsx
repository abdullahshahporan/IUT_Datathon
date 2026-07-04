import { useMemo, useState } from "react";
import { ArrowUpDown, Search, Fan, Lightbulb } from "lucide-react";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { DeviceRecord } from "smart-office-shared";
import { formatDateTime, formatRelative, formatWatts } from "@/lib/format";
import { cn } from "@/lib/cn";

type SortKey = "roomName" | "name" | "status" | "powerDrawWatts" | "lastChangedAt";

interface DeviceTableProps {
  devices: DeviceRecord[];
  onToggleDevice?: (deviceId: string) => void;
}

export function DeviceTable({ devices, onToggleDevice }: DeviceTableProps) {
  const [query, setQuery] = useState("");
  const [room, setRoom] = useState("all");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [sortKey, setSortKey] = useState<SortKey>("roomName");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const rooms = useMemo(() => Array.from(new Set(devices.map((device) => device.roomName))), [devices]);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();

    return [...devices]
      .filter((device) => {
        const haystack = `${device.name} ${device.roomName} ${device.type} ${device.status}`.toLowerCase();
        const passesQuery = !normalized || haystack.includes(normalized);
        const passesRoom = room === "all" || device.roomName === room;
        const passesType = type === "all" || device.type === type;
        const passesStatus = status === "all" || device.status === status;

        return passesQuery && passesRoom && passesType && passesStatus;
      })
      .sort((left, right) => {
        const direction = sortDirection === "asc" ? 1 : -1;
        const leftValue = left[sortKey];
        const rightValue = right[sortKey];

        if (typeof leftValue === "number" && typeof rightValue === "number") {
          return (leftValue - rightValue) * direction;
        }

        return String(leftValue).localeCompare(String(rightValue)) * direction;
      });
  }, [devices, query, room, sortDirection, sortKey, status, type]);

  return (
    <Card>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <CardTitle>Device Table</CardTitle>
          <CardDescription>Search, filter, and sort every simulated device in real time.</CardDescription>
        </div>

        <div className="grid gap-3 md:grid-cols-4 lg:w-[760px]">
          <label className="relative md:col-span-2">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input className="pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search device, room, status..." />
          </label>
          <Select value={room} onChange={(event) => setRoom(event.target.value)}>
            <option value="all">All rooms</option>
            {rooms.map((roomName) => (
              <option key={roomName} value={roomName}>{roomName}</option>
            ))}
          </Select>
          <Select value={type} onChange={(event) => setType(event.target.value)}>
            <option value="all">All types</option>
            <option value="fan">Fans</option>
            <option value="light">Lights</option>
          </Select>
          <Select value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="all">All statuses</option>
            <option value="ON">ON</option>
            <option value="OFF">OFF</option>
          </Select>
        </div>
      </div>

      <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-white/10">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-white/10 text-sm">
            <thead className="bg-white/5 text-slate-300">
              <tr>
                {[
                  ["roomName", "Room"],
                  ["name", "Device"],
                  ["status", "Status"],
                  ["powerDrawWatts", "Power"],
                  ["lastChangedAt", "Last Changed"],
                ].map(([key, label]) => (
                  <th key={key} className="px-4 py-3 text-left font-medium">
                    <button
                      className="inline-flex items-center gap-2 transition hover:text-white"
                      onClick={() => {
                        const nextDirection = sortKey === key && sortDirection === "asc" ? "desc" : "asc";
                        setSortKey(key as SortKey);
                        setSortDirection(nextDirection);
                      }}
                    >
                      {label}
                      <ArrowUpDown className="h-3.5 w-3.5" />
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 bg-ink-900/30 text-slate-200">
              {filtered.map((device) => (
                <tr key={device.id} className="hover:bg-white/5 transition-colors duration-150">
                  <td className="px-4 py-3 text-slate-300 font-medium">{device.roomName}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-xl border transition-all duration-300",
                        device.status === "ON"
                          ? device.type === "fan"
                            ? "border-aurora-400/25 bg-aurora-500/15 text-aurora-300 shadow-[0_0_12px_rgba(20,184,166,0.15)]"
                            : "border-ember-400/25 bg-ember-500/15 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.15)]"
                          : "border-white/5 bg-white/5 text-slate-500"
                      )}>
                        {device.type === "fan" ? (
                          <Fan className={cn("h-4 w-4", device.status === "ON" ? "animate-spinSlow" : "")} />
                        ) : (
                          <Lightbulb className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{device.name}</p>
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-500 font-medium">{device.type}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => onToggleDevice?.(device.id)}
                      disabled={!onToggleDevice}
                      className={cn(
                        "transition hover:scale-105 active:scale-95 disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-aurora-500/50 rounded-full",
                        onToggleDevice ? "cursor-pointer" : ""
                      )}
                      title={onToggleDevice ? `Click to turn ${device.status === "ON" ? "OFF" : "ON"}` : undefined}
                    >
                      <Badge variant={device.status === "ON" ? "success" : "neutral"}>{device.status}</Badge>
                    </button>
                  </td>
                  <td className="px-4 py-3 font-medium">{formatWatts(device.powerDrawWatts)}</td>
                  <td className="px-4 py-3 text-slate-300">
                    <div>{formatDateTime(device.lastChangedAt)}</div>
                    <div className="text-xs text-slate-500">{formatRelative(device.lastChangedAt)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}
