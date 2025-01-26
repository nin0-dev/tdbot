import { Command } from "../../utils/types";

const command: Command = {
	name: "ping",
	description: "See if I am alive",
	ownerOnly: false,
	trustedOnly: false,
	args: undefined,
	execute: async int => {
		int.reply({
			content: "Pong!"
		});
	}
};
export default command;
