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
					},
					data.type === "Truth"
						? {
								type: ComponentTypes.BUTTON,
								label: "Answer",
								style: ButtonStyles.SECONDARY,
								emoji: await getEmoji("answer", "object"),
								customID: `answer`
						  }
						: undefined
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
			id: /^answer$/,
			execute: async int => {
				if (int.message?.embeds[0].fields) {
					const answers = int.message.embeds[0].fields![0].value;
					if (
						answers.includes(`-# ${int.user.tag}`) &&
						int.channelID !== "1333952480123551744"
					) {
						await int.reply({
							content: ":anger: You already answered this!",
							flags: MessageFlags.EPHEMERAL
						});
						return;
					}

					if (answers.length + 100 > 1024) {
						var newMaxLength = 1024 - answers.length;
					}
				}
				int.createModal({
					title: "Answer",
					customID: "answer",
					components: [
						{
							type: ComponentTypes.ACTION_ROW,
							components: [
								{
									type: ComponentTypes.TEXT_INPUT,
									label: "Your answer",
									required: true,
									customID: "field",
									style: TextInputStyles.PARAGRAPH,
									// @ts-expect-error
									maxLength: newMaxLength ?? 1024
								}
							]
						}
					]
				});
			}
		},
		{
			id: /^next_/,
			execute: async int => {
				await int.defer();
				const data = await getQuestion(
					int.data.customID.split("_")[1],
					int.data.customID.split("_")[2]
				);
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
	],
	modals: [
		{
			id: /^answer$/,
			execute: async int => {
				if (!int.message) return;
				if (!int.message.embeds[0].fields) {
					const originalEmbed = int.message.embeds[0];
					originalEmbed.fields = [
						{
							name: "Answers",
							value: `> -# ${int.user.tag}\n> ${sanitize(
								int.data.components.getTextInput("field", true)
							).replaceAll("\n", "\n> ")}`
						}
					];
					await int.editParent({
						embeds: [originalEmbed]
					});
				} else {
					const originalEmbed = int.message.embeds[0];
					if (
						originalEmbed.fields![0].value.length +
							int.data.components.getTextInput("field", true)
								.length +
							100 >
						1024
					) {
						const originalButtons = int.message.components;
						originalButtons[0].components[1].disabled = true;
						await int.editParent({
							components: originalButtons
						});
						await int.createFollowup({
							content: ":anger: Answer is too long!",
							flags: MessageFlags.EPHEMERAL
						});
						return;
					}
					originalEmbed.fields = [
						{
							name: "Answers",
							value:
								originalEmbed.fields![0].value +
								`\n> -# ${int.user.tag}\n> ${sanitize(
									int.data.components.getTextInput(
										"field",
										true
									)
								).replaceAll("\n", "\n> ")}`
						}
					];
					await int.editParent({
						embeds: [originalEmbed]
					});
				}
			}
		}
	]
};
export default command;
