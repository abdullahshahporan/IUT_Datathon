import { SelectHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/cn";

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(function Select(
  { className, children, ...props },
  ref,
) {
  return (
    <select
      ref={ref}
      className={cn(
        "h-10 rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white focus:border-aurora-400/60 focus:outline-none focus:ring-2 focus:ring-aurora-400/20",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
});
