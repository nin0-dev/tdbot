import { psqlClient } from "./database";

export async function getQuestion(
	type: string,
	rating: string
): Promise<{
	id: string;
	type: "Truth" | "Dare" | "NHIE";
	rating: "PG" | "PG-13" | "R";
	question: string;
}> {
	const selectedType = type.split("+");

	const questionRatings = rating
		.split("+")
		.map(r => `rating=${r}`)
		.join("&");
	const questionType =
		selectedType[Math.floor(Math.random() * selectedType.length)];

	const data: any = await (
		await fetch(
			`https://api.truthordarebot.xyz/v1/${questionType}?${questionRatings}`
		)
	).json();

	const query = await psqlClient.query(
		"SELECT * FROM questionflags WHERE id=$1",
		[data.id]
	);
	if (query.rowCount) return getQuestion(type, rating);

	return {
		// @ts-ignore
		id: data.id,
		type: (t => {
			if (t === "truth") return "Truth";
			if (t === "dare") return "Dare";
			if (t === "nhie") return "NHIE";
		})(questionType)!,
		rating: (r => {
			if (r === "PG13") return "PG-13";
			return r;
			// @ts-ignore
		})(data.rating)!,
		// @ts-ignore
		question: data.question
	};
}
