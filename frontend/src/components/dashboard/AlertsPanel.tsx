import { Bell, BellOff, Trash2 } from "lucide-react";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { AlertRecord } from "smart-office-shared";
import { formatDateTime, formatRelative } from "@/lib/format";
import { Button } from "@/components/ui/Button";

const severityVariant = {
  info: "default",
  warning: "warning",
  critical: "critical",
} as const;

export function AlertsPanel({
  alerts,
  onDismiss,
}: {
  alerts: AlertRecord[];
  onDismiss?: (alertId: string) => void;
}) {
  return (
    <Card>
      <div className="flex items-start justify-between gap-4">
        <div>
          <CardTitle>Alerts Panel</CardTitle>
          <CardDescription>Office conditions that require attention or were recently generated.</CardDescription>
        </div>
        <Badge variant={alerts.length === 0 ? "neutral" : "warning"}>{alerts.length} active</Badge>
      </div>

      <div className="mt-4 space-y-3">
        {alerts.length === 0 ? (
          <div className="rounded-[1.5rem] border border-dashed border-white/10 bg-white/5 p-6 text-center text-slate-300">
            <BellOff className="mx-auto h-8 w-8 text-slate-500" />
            <p className="mt-3 font-medium text-white">No active alerts</p>
            <p className="mt-1 text-sm text-slate-400">The office is behaving normally right now.</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <div key={alert.id} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={severityVariant[alert.severity]}>{alert.severity.toUpperCase()}</Badge>
                    <span className="text-xs uppercase tracking-[0.28em] text-slate-500">{alert.roomName}</span>
                  </div>
                  <h4 className="text-lg font-semibold text-white">{alert.title}</h4>
                  <p className="max-w-3xl text-sm leading-6 text-slate-300">{alert.message}</p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    <span>{formatDateTime(alert.generatedAt)}</span>
                    <span>{formatRelative(alert.generatedAt)}</span>
                  </div>
                </div>

                {onDismiss ? (
                  <Button variant="secondary" size="sm" onClick={() => onDismiss(alert.id)}>
                    <Trash2 className="h-4 w-4" />
                    Dismiss
                  </Button>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
