import { motion } from "framer-motion";
import { Card, CardDescription, CardTitle } from "@/components/ui/Card";

export function MetricCard({
  label,
  value,
  delta,
  accent,
}: {
  label: string;
  value: string;
  delta: string;
  accent: string;
}) {
  return (
    <motion.div whileHover={{ y: -4, scale: 1.01 }} transition={{ type: "spring", stiffness: 220, damping: 18 }}>
      <Card className="relative overflow-hidden">
        <div className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${accent} opacity-20`} />
        <div className="relative">
          <CardDescription>{label}</CardDescription>
          <CardTitle className="mt-2 text-3xl">{value}</CardTitle>
          <p className="mt-3 text-sm text-slate-300">{delta}</p>
        </div>
      </Card>
    </motion.div>
  );
}
