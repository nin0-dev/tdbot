import {
	ApplicationCommandOptionsWithValue,
	CommandInteraction,
	Interaction,
	InteractionOptionsWrapper
} from "oceanic.js";

export type Command = {
	name: string;
	description: string;
	ownerOnly: boolean;
	trustedOnly: boolean;
	args: ApplicationCommandOptionsWithValue[] | undefined;
	execute: (int: CommandInteraction, args: InteractionOptionsWrapper) => void;
};
