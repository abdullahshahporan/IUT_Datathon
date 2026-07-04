import { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { ActivitySquare, BarChart3, BellRing, LayoutDashboard, MoonStar, SatelliteDish } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/cn";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/alerts", label: "Alerts", icon: BellRing },
  { to: "/statistics", label: "Statistics", icon: BarChart3 },
];

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen overflow-hidden text-white">
      <div className="pointer-events-none fixed inset-0 soft-grid opacity-30" />
      <div className="pointer-events-none fixed inset-0 bg-office-grid opacity-[0.14]" />
      <div className="pointer-events-none fixed inset-0 bg-aurora-radial" />

      <div className="relative mx-auto flex min-h-screen max-w-[1800px] gap-6 p-4 lg:p-6">
        <aside className="glass-panel hidden w-80 flex-col justify-between rounded-[2rem] p-5 xl:flex">
          <div>
            <div className="mb-8 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-aurora-500/20 text-aurora-300 shadow-[0_0_30px_rgba(20,184,166,0.25)]">
                <SatelliteDish className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.35em] text-slate-400">Smart Office</p>
                <h1 className="font-display text-xl font-semibold">Monitoring System</h1>
              </div>
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition-all duration-300 border",
                        isActive 
                          ? "bg-gradient-to-r from-aurora-500/20 to-aurora-600/10 text-aurora-300 border-aurora-500/30 shadow-[0_0_24px_rgba(20,184,166,0.12)] font-medium" 
                          : "text-slate-300 hover:bg-white/5 hover:text-white border-transparent",
                      )
                    }
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <motion.div
            className="rounded-[1.75rem] border border-white/10 bg-white/5 p-4"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="mb-3 flex items-center gap-2 text-aurora-300">
              <MoonStar className="h-4 w-4" />
              <span className="text-xs uppercase tracking-[0.25em]">Live Environment</span>
            </div>
            <p className="text-sm leading-6 text-slate-300">
              Devices update every few seconds. Alerts, charts, and the floor plan all reflect the same live source of truth.
            </p>
          </motion.div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col gap-6">
          <header className="glass-panel flex flex-col gap-4 rounded-[2rem] px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-slate-400">Connected office telemetry</p>
              <h2 className="mt-1 font-display text-2xl font-semibold text-white lg:text-3xl">Smart Office Control Center</h2>
            </div>
            <div className="flex items-center gap-3 text-sm text-slate-300">
              <div className="flex items-center gap-2 rounded-full border border-aurora-500/25 bg-aurora-500/15 px-4 py-2 text-aurora-200">
                <ActivitySquare className="h-4 w-4 animate-pulse" />
                Live backend sync
              </div>
            </div>
          </header>

          <div className="xl:hidden">
            <nav className="glass-panel flex flex-wrap gap-2 rounded-[1.5rem] p-3">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        "flex flex-1 items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm transition-all duration-300 border",
                        isActive 
                          ? "bg-gradient-to-r from-aurora-500/20 to-aurora-600/10 text-aurora-300 border-aurora-500/30 shadow-[0_0_20px_rgba(20,184,166,0.1)] font-medium" 
                          : "bg-white/5 text-slate-300 border-transparent",
                      )
                    }
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          <div className="min-h-0 flex-1">{children}</div>
        </main>
      </div>
    </div>
  );
}
