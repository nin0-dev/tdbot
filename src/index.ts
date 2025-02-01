import {
	ApplicationCommandTypes,
	ApplicationIntegrationTypes,
	Client,
	InteractionContextTypes,
	InteractionTypes,
	MessageFlags
} from "oceanic.js";
import { readdirSync } from "fs";
import { join } from "path";
import { readdir } from "fs/promises";
import command from "./commands/ping";
import { Command, ComponentInteraction, FormInteraction } from "../utils/types";

export const client = new Client({
	auth: `Bot ${process.env.DISCORD_TOKEN}`,
	allowedMentions: {
		users: false,
		repliedUser: false,
		roles: false,
		everyone: false
	}
});
export const commands: Command[] = [];
export let componentInteractions: ComponentInteraction[] = [];
export let modalInteractions: FormInteraction[] = [];
let ownerID: string;

client.on("ready", async () => {
	console.log(`Logged in as ${client.user.tag}!`);

	ownerID = (await client.rest.applications.getCurrent()).owner!.id;

	const commandFiles = await readdir(join(__dirname, "commands"));

	for (const file of commandFiles) {
		const command = await import(join(__dirname, "commands", file));
		commands.push(command.default);
		if (command.default.components) {
			command.default.components.forEach(
				(component: ComponentInteraction) => {
					componentInteractions.push(component);
				}
			);
		}
		if (command.default.modals) {
			command.default.modals.forEach((modal: FormInteraction) => {
				modalInteractions.push(modal);
			});
		}
	}

	await client.application.bulkEditGlobalCommands(
		commands.map(command => {
			return {
				name: command.name,
				description: command.description,
				type: ApplicationCommandTypes.CHAT_INPUT,
				contexts: [
					InteractionContextTypes.BOT_DM,
					InteractionContextTypes.GUILD,
					InteractionContextTypes.PRIVATE_CHANNEL
				],
				integrationTypes: [
					ApplicationIntegrationTypes.GUILD_INSTALL,
					ApplicationIntegrationTypes.USER_INSTALL
				],
				options: command.args
			};
		})
	);

	console.log(
		`Loaded ${commands.length} commands, ${componentInteractions.length} components`
	);
});

client.on("interactionCreate", async interaction => {
	switch (interaction.type) {
		case InteractionTypes.APPLICATION_COMMAND: {
			switch (interaction.data.type) {
				case ApplicationCommandTypes.CHAT_INPUT: {
					const possibleCommand = commands.find(
						command => command.name === interaction.data.name
					);
					if (!possibleCommand) return;
					if (
						possibleCommand.ownerOnly &&
						interaction.user.id !== ownerID
					) {
						interaction.reply({
							content: ":anger: You can't do this!",
							flags: MessageFlags.EPHEMERAL
						});
						return;
					}

					possibleCommand.execute(
						interaction,
						interaction.data.options
					);
					break;
				}
			}
			break;
		}
		case InteractionTypes.MESSAGE_COMPONENT: {
			const component = componentInteractions.find(component => {
				try {
					if (interaction.data.customID.match(component.id))
						return true;
				} catch {
					return false;
				}
			});
			if (!component) return;
			component.execute(interaction);
			break;
		}
		case InteractionTypes.MODAL_SUBMIT: {
			const modal = modalInteractions.find(modal => {
				try {
					if (interaction.data.customID.match(modal.id)) return true;
				} catch {
					return false;
				}
			});
			if (!modal) return;
			modal.execute(interaction);
			break;
		}
	}
});

client.connect();
