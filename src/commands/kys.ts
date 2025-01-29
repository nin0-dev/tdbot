import { ApplicationCommandOptionTypes } from "oceanic.js";
import { Command } from "../../utils/types";

const command: Command = {
	name: "kys",
	description: "requested by vending.machine",
	ownerOnly: false,
	trustedOnly: true,
	args: [
		{
			type: ApplicationCommandOptionTypes.USER,
			name: "target",
			description: "person to target",
			required: true
		}
	],
	execute: async (int, options) => {
		int.reply({
			content: `${options.getUser("target", true).mention} kys`,
			allowedMentions: {
				users: true
			}
		});
	}
};
export default command;
