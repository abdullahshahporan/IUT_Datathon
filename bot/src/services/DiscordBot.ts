import { Client, GatewayIntentBits, Partials } from "discord.js";
import { env } from "../config/env";
import { BackendApi } from "./BackendApi";
import { CommandHandler } from "./CommandHandler";
import { AlertRelay } from "./AlertRelay";

export class DiscordBot {
  private readonly client: Client;

  private readonly api = new BackendApi();

  private readonly commandHandler: CommandHandler;

  private readonly alertRelay: AlertRelay;

  constructor() {
    this.client = new Client({
      intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent],
      partials: [Partials.Channel],
    });

    this.commandHandler = new CommandHandler(this.client, this.api);
    this.alertRelay = new AlertRelay(this.client);
  }

  async start(): Promise<void> {
    if (!env.discordToken) {
      throw new Error("DISCORD_BOT_TOKEN is required");
    }

    this.client.once("clientReady", (readyClient) => {
      console.log(`Discord bot ready as ${readyClient.user.tag}`);
      this.alertRelay.start();
    });

    this.client.on("messageCreate", async (message) => {
      await this.commandHandler.handleMessage(message);
    });

    await this.client.login(env.discordToken);
  }

  async stop(): Promise<void> {
    this.alertRelay.stop();
    await this.client.destroy();
  }
}
