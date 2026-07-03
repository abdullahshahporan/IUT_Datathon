import { Client, Message } from "discord.js";
import { BackendApi } from "./BackendApi";
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
    const opening = "Here’s the current office snapshot:";
    await message.reply(`${opening}\n${formatOfficeStatus(rooms)}`);
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

    const friendly = room.devicesOn === 0 ? "Everything looks calm." : room.devicesOn === room.totalDevices ? "Everything is running." : "A few devices are active.";
    await message.reply(`${formatRoomSummary(room)} ${friendly}`);
  }

  private async respondWithUsage(message: Message): Promise<void> {
    const usage = await this.api.getUsage();
    await message.reply(`The office is using ${formatUsageSummary(usage)}`);
  }

  private async respondWithAlerts(message: Message): Promise<void> {
    const alerts = await this.api.getAlertPayloads();

    if (alerts.length === 0) {
      await message.reply("No active alerts right now. The office is behaving itself.");
      return;
    }

    const lines = alerts.slice(0, 5).map((alert) => `• ${alert.roomName}: ${alert.title}`);
    const suffix = alerts.length > 5 ? `\nAnd ${alerts.length - 5} more.` : "";
    await message.reply(`Here are the active alerts I’m watching:\n${lines.join("\n")}${suffix}`);
  }
}
