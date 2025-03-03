import {
	ApplicationCommandOptionTypes,
	ButtonStyles,
	CommandInteraction,
	ComponentTypes,
	Interaction,
	InteractionOptionsWrapper,
	MessageFlags,
	TextInputStyles
} from "oceanic.js";
import { Command, QuestionFlags } from "../../utils/types";
import { getQuestion } from "../utils/getQuestion";
import { getEmoji } from "../utils/emoji";
import { sanitize } from "../utils/sanitize";
import { client, ownerID } from "..";
import { db, psqlClient } from "../utils/database";

export async function sendGameMessage(
	int: CommandInteraction,
	args: InteractionOptionsWrapper,
	data: any
) {
	await int.createFollowup({
		embeds: [
			{
				author: {
					name: int.user.tag,
					iconURL: int.user.avatarURL("png")
				},
				description: `## ${
					data.type === "Truth"
						? ":tea:"
						: data.type === "Dare"
						? ":boom:"
						: ":grey_question:"
				} ${data.type}\n${data.question}`,
				color:
					data.type === "Truth"
						? 0xa5d287
						: data.type === "Dare"
						? 0xfcaa40
						: 0xcbd5dc,
				footer: {
					text: `${data.rating} ~ ${data.id}`
				}
			}
		],
		components: [
			{
				type: ComponentTypes.ACTION_ROW,
				// @ts-ignore
				components: [
					{
						type: ComponentTypes.BUTTON,
						label: "Next",
						style: ButtonStyles.PRIMARY,
						emoji: await getEmoji("next", "object"),
						customID: `next_${args.getString(
							"type",
							true
						)}_${args.getString("rating", true)}`
					}
				].filter(x => {
					return x === undefined ? false : true;
				})
			}
		]
	});
}

const command: Command = {
	name: "it_starts_with",
	description: "Start playing a game with the bot",
	ownerOnly: false,
	trustedOnly: false,
	args: [
		{
			type: ApplicationCommandOptionTypes.STRING,
			name: "type",
			description: "Question types to use",
			required: true,
			choices: [
				{
					name: "Truth",
					value: "truth"
				},
				{
					name: "Dare",
					value: "dare"
				},
				{
					name: "Never have I ever",
					value: "nhie"
				},
				{
					name: "Truth + dare",
					value: "truth+dare"
				},
				{
					name: "Truth + never have I ever",
					value: "truth+nhie"
				},
				{
					name: "Dare + never have I ever",
					value: "dare+nhie"
				},
				{
					name: "All 3",
					value: "truth+dare+nhie"
				}
			]
		},
		{
			type: ApplicationCommandOptionTypes.STRING,
			name: "rating",
			description: "Allowed question ratings",
			required: true,
			choices: [
				{
					name: "PG only",
					value: "pg"
				},
				{
					name: "PG and PG-13",
					value: "pg+pg13"
				},
				{
					name: "PG-13 only",
					value: "pg13"
				},
				{
					name: "🚩 PG-13 and R",
					value: "pg13+r"
				},
				{
					name: "🚩 R only",
					value: "r"
				},
				{
					name: "🚩 All of the above",
					value: "pg+pg13+r"
				}
			]
		}
	],
	execute: async (int, args) => {
		await int.defer();
		const data = await getQuestion(
			args.getString("type", true),
			args.getString("rating", true)
		);
		await sendGameMessage(int, args, data);
	},
	components: [
		{
			id: /^next_/,
			execute: async int => {
				await int.defer();
				const data = await getQuestion(
					int.data.customID.split("_")[1],
					int.data.customID.split("_")[2]
				);
				if (Object.keys(int.authorizingIntegrationOwners)[0] === "0")
					int.message.edit({
						components: []
					});
				await sendGameMessage(
					// @ts-ignore
					int,
					{
						getString(type: string, _required: boolean) {
							if (type === "type")
								return int.data.customID.split("_")[1];
							if (type === "rating")
								return int.data.customID.split("_")[2];
							return "";
						}
					},
					data
				);
			}
		}
	]
};
export default command;
