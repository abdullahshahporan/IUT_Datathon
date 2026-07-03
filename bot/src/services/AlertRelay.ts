import { Client, TextChannel } from "discord.js";
import { io, Socket } from "socket.io-client";
import { env } from "../config/env";
import { AlertRecord } from "smart-office-shared";
import { formatAlertSummary } from "../utils/format";

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
      if (!channel) {
        console.log(`[alert:new] ${formatAlertSummary(alert)}`);
        return;
      }

      await channel.send(this.formatAlertMessage(alert));
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

  private formatAlertMessage(alert: AlertRecord): string {
    const severityEmoji = alert.severity === "critical" ? "🚨" : alert.severity === "warning" ? "⚠️" : "ℹ️";
    const deviceLine = alert.deviceName ? `Device: ${alert.deviceName}\n` : "";

    return [
      `${severityEmoji} ${alert.roomName} alert`,
      alert.title,
      alert.message,
      deviceLine ? deviceLine.trimEnd() : "",
      `Generated at: <t:${Math.floor(new Date(alert.generatedAt).getTime() / 1000)}:R>`,
    ]
      .filter(Boolean)
      .join("\n");
  }
}
