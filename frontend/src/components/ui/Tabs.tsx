import { ButtonHTMLAttributes, HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export function Tabs({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex gap-2 rounded-2xl bg-white/5 p-1", className)} {...props} />;
}

export function TabButton({ className, active, ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { active?: boolean }) {
  return (
    <button
      className={cn(
        "rounded-xl px-4 py-2 text-sm transition-all",
        active ? "bg-white text-slate-950 shadow-lg" : "text-slate-300 hover:bg-white/8 hover:text-white",
        className,
      )}
      {...props}
    />
  );
}
