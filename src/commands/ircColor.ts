import { ApplicationCommandOptionTypes } from "oceanic.js";
import { Command } from "../../utils/types";
import chroma from "chroma-js";
import { createCanvas } from "canvas";
import { hash as h64 } from "@intrnl/xxhash64";

const command: Command = {
	name: "irc_color",
	localisedNames: {
		"en-GB": "irc_colour"
	},
	localisedDescriptions: {
		"en-GB": "Find yours/someone's colour in the vencord IRCColours plugin"
	},
	description: "Find yours/someone's color in the vencord IRCColors plugin",
	execute(int, args) {
		int.defer();
		const userID = (args.getUser("username") || int.user).id;
		const color = chroma.hsl(Number(h64(userID) % 360n), 1, 0.7);
		const colorImage = createCanvas(100, 100);
		(() => {
			const ctx = colorImage.getContext("2d");
			ctx.fillStyle = color.hex();
			ctx.fillRect(0, 0, 100, 100);
		})();

		int.createFollowup({
			embeds: [
				{
					description: `<@${userID}>'s IRC color: \`${color.hex()}\``,
					color: color.num(),
					image: {
						url: "attachment://color.png"
					}
				}
			],
			files: [
				{
					name: "color.png",
					contents: colorImage.toBuffer()
				}
			]
		});
	},
	args: [
		{
			name: "username",
			type: ApplicationCommandOptionTypes.USER,
			description: "The user to get the color of",
			required: false
		}
	]
};
export default command;
