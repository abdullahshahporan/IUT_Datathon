import { Client, Message } from "discord.js";
import { BackendApi } from "./BackendApi";
import { formatResponse } from "./LlmFormatter";
import { env } from "../config/env";
import { formatOfficeStatus, formatRoomSummary, formatUsageSummary } from "../utils/format";

export class CommandHandler {
  constructor(
    private readonly client: Client,
    private readonly api: BackendApi,
  ) {}

  async handleMessage(message: Message): Promise<void> {
    if (message.author.bot || !message.content.startsWith(env.commandPrefix)) {
      return;
    }

    const [command, ...rest] = message.content.slice(env.commandPrefix.length).trim().split(/\s+/);
    const normalized = command?.toLowerCase() ?? "";

    if (!normalized) {
      return;
    }

    switch (normalized) {
      case "status":
        await this.respondWithStatus(message);
        break;
      case "room":
        await this.respondWithRoom(message, rest[0]?.toLowerCase() ?? "");
        break;
      case "usage":
        await this.respondWithUsage(message);
        break;
      case "alerts":
        await this.respondWithAlerts(message);
        break;
      default:
        await message.reply("I can help with `!status`, `!room drawing`, `!room work1`, `!room work2`, `!usage`, and `!alerts`.");
    }
  }

  private async respondWithStatus(message: Message): Promise<void> {
    const rooms = (await this.api.getRooms()).data;
    const rawText = formatOfficeStatus(rooms);
    const reply = await formatResponse("status", { rooms }, rawText);
    await message.reply(reply);
  }

  private async respondWithRoom(message: Message, roomCode: string): Promise<void> {
    if (!roomCode) {
      await message.reply("Tell me which room you want: `!room drawing`, `!room work1`, or `!room work2`.");
      return;
    }

    const room = await this.api.getRoomByCode(roomCode);
    if (!room) {
      await message.reply("I couldn’t find that room. Try `drawing`, `work1`, or `work2`.");
      return;
    }

    const rawText = formatRoomSummary(room);
    const reply = await formatResponse("room", { room }, rawText);
    await message.reply(reply);
  }

  private async respondWithUsage(message: Message): Promise<void> {
    const usage = await this.api.getUsage();
    const rawText = formatUsageSummary(usage);
    const reply = await formatResponse("usage", { usage }, rawText);
    await message.reply(reply);
  }

  private async respondWithAlerts(message: Message): Promise<void> {
    const alerts = await this.api.getAlertPayloads();

    if (alerts.length === 0) {
      const reply = await formatResponse("alerts", { alerts: [] }, "No active alerts right now. The office is behaving itself.");
      await message.reply(reply);
      return;
    }

    const rawLines = alerts.slice(0, 5).map((alert) => `• ${alert.roomName}: ${alert.title}`);
    const suffix = alerts.length > 5 ? `\nAnd ${alerts.length - 5} more.` : "";
    const rawText = `Active alerts:\n${rawLines.join("\n")}${suffix}`;
    const reply = await formatResponse("alerts", { alerts }, rawText);
    await message.reply(reply);
  }
}
