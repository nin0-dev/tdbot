import { client } from "..";

const emojiCache = new Map<string, string>();

export async function getEmoji(
	emoji: string,
	type: "markdown" | "react" | "object"
): Promise<any> {
	if (emojiCache.has(emoji)) {
		const fetchedEmojiID = emojiCache.get(emoji);
		switch (type) {
			case "markdown":
				return `<:${emoji}:${fetchedEmojiID}>`;
			case "react":
				return `${emoji}:${fetchedEmojiID}`;
			case "object":
				return {
					name: emoji,
					id: fetchedEmojiID
				};
		}
	}

	const fetchedEmoji = (await client.application.getEmojis()).items.filter(
		e => e.name === emoji
	)[0];
	emojiCache.set(emoji, fetchedEmoji.id);

	switch (type) {
		case "markdown":
			return `<:${emoji}:${fetchedEmoji.id}>`;
		case "react":
			return `${emoji}:${fetchedEmoji.id}`;
		case "object":
			return {
				name: emoji,
				id: fetchedEmoji.id
			};
	}
}
