import { HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type BadgeVariant = "default" | "warning" | "critical" | "success" | "neutral";

const styles: Record<BadgeVariant, string> = {
  default: "bg-aurora-500/20 text-aurora-300 border border-aurora-500/25",
  warning: "bg-ember-500/20 text-amber-200 border border-ember-500/25",
  critical: "bg-rose-500/20 text-rose-200 border border-rose-500/25",
  success: "bg-emerald-500/20 text-emerald-200 border border-emerald-500/25",
  neutral: "bg-white/8 text-slate-200 border border-white/10",
};

export function Badge({ className, variant = "default", ...props }: HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return <span className={cn("inline-flex items-center rounded-full px-3 py-1 text-xs font-medium", styles[variant], className)} {...props} />;
}
