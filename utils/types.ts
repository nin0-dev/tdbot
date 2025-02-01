import {
	ApplicationCommandOptionsWithValue,
	CommandInteraction,
	Interaction,
	InteractionOptionsWrapper,
	ModalSubmitInteraction
} from "oceanic.js";
import { ComponentInteraction as OceanicComponentInteraction } from "oceanic.js";

export type ComponentInteraction = {
	id: RegExp;
	execute: (int: OceanicComponentInteraction) => void;
};
export type FormInteraction = {
	id: RegExp;
	execute: (int: ModalSubmitInteraction) => void;
};

export type Command = {
	name: string;
	description: string;
	ownerOnly?: boolean | undefined;
	trustedOnly?: boolean | undefined;
	args?: ApplicationCommandOptionsWithValue[] | undefined;
	execute: (int: CommandInteraction, args: InteractionOptionsWrapper) => void;
	components?: ComponentInteraction[] | undefined;
	modals?: FormInteraction[] | undefined;
};
