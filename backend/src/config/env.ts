import dotenv from "dotenv";

dotenv.config();

function parseNumber(value: string | undefined, fallback: number): number {
  if (value === undefined) {
    return fallback;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const env = {
  port: parseNumber(process.env.PORT, 4000),
  corsOrigin: process.env.CORS_ORIGIN ?? "http://localhost:5173",
  simulatorMinIntervalMs: parseNumber(process.env.SIMULATOR_MIN_INTERVAL_MS, 3000),
  simulatorMaxIntervalMs: parseNumber(process.env.SIMULATOR_MAX_INTERVAL_MS, 6000),
  simulatorInitialDelayMs: parseNumber(process.env.SIMULATOR_INITIAL_DELAY_MS, 1000),
  nodeEnv: process.env.NODE_ENV ?? "development",
};

if (env.simulatorMaxIntervalMs < env.simulatorMinIntervalMs) {
  throw new Error("SIMULATOR_MAX_INTERVAL_MS must be greater than or equal to SIMULATOR_MIN_INTERVAL_MS");
}
