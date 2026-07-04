import { Client, TextChannel } from "discord.js";
import { io, Socket } from "socket.io-client";
import { env } from "../config/env";
import { AlertRecord } from "smart-office-shared";
import { formatAlertSummary } from "../utils/format";
import { formatResponse } from "./LlmFormatter";

type RelayEvents = {
  "alert:new": (alert: AlertRecord) => void;
};

export class AlertRelay {
  private socket: Socket<RelayEvents> | null = null;

  constructor(private readonly client: Client) {}

  start(): void {
    if (this.socket) {
      return;
    }

    this.socket = io(env.backendSocketUrl, {
      transports: ["websocket", "polling"],
      autoConnect: true,
    });

    this.socket.on("alert:new", async (alert) => {
      const channel = await this.resolveAlertChannel();
      const message = await this.buildAlertMessage(alert);

      if (!channel) {
        console.log(`[alert:new] ${formatAlertSummary(alert)}`);
        return;
      }

      await channel.send(message);
    });
  }

  stop(): void {
    this.socket?.disconnect();
    this.socket = null;
  }

  private async resolveAlertChannel(): Promise<TextChannel | null> {
    if (env.alertChannelId) {
      const channel = await this.client.channels.fetch(env.alertChannelId);
      if (channel && channel.isTextBased()) {
        return channel as TextChannel;
      }
    }

    const firstGuild = this.client.guilds.cache.first();
    if (!firstGuild) {
      return null;
    }

    const channel = firstGuild.systemChannel ?? firstGuild.channels.cache.find((entry) => entry.isTextBased()) ?? null;
    return channel && channel.isTextBased() ? (channel as TextChannel) : null;
  }

  private async buildAlertMessage(alert: AlertRecord): Promise<string> {
    const severityEmoji = alert.severity === "critical" ? "🚨" : alert.severity === "warning" ? "⚠️" : "ℹ️";
    const timestamp = `<t:${Math.floor(new Date(alert.generatedAt).getTime() / 1000)}:R>`;

    const rawFallback = [
      `${severityEmoji} **${alert.roomName}** — ${alert.title}`,
      alert.message,
      alert.deviceName ? `Device: ${alert.deviceName}` : "",
      `Triggered: ${timestamp}`,
    ]
      .filter(Boolean)
      .join("\n");

    const friendly = await formatResponse(
      "alert",
      {
        severity: alert.severity,
        room: alert.roomName,
        title: alert.title,
        message: alert.message,
        device: alert.deviceName ?? null,
      },
      alert.message,
    );

    return `${severityEmoji} ${friendly}\n${timestamp}`;
  }
}
