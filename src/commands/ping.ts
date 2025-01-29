import { Command } from "../../utils/types";

const command: Command = {
	name: "wing",
	description: "See if I am alive",
	ownerOnly: false,
	trustedOnly: false,
	args: undefined,
	execute: async int => {
		int.reply({
			content: "Wong!"
		});
	}
};
export default command;
