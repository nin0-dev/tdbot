import { promises as fs } from "fs";
import path from "path";

async function getLocalQuestion(
	type: "truth" | "dare"
): Promise<{ fileName: string; question: string }> {
	const questionsDir = path.join(__dirname, "../../questions");
	const files = await fs.readdir(questionsDir);
	const filteredFiles = files.filter(file => file.startsWith(type));
	const randomFile =
		filteredFiles[Math.floor(Math.random() * filteredFiles.length)];
	const filePath = path.join(questionsDir, randomFile);
	const fileContent = await fs.readFile(filePath, "utf-8");
	const questions = fileContent.split("\n").filter(Boolean);
	const randomQuestion =
		questions[Math.floor(Math.random() * questions.length)];
	return {
		fileName: randomFile,
		question: randomQuestion
	};
}

export async function getQuestion(
	type: string,
	rating: string
): Promise<{
	id: string;
	type: string;
	rating: "PG" | "PG-13" | "R" | "Local";
	question: string;
}> {
	if (Math.random() < 0.7 && type !== "nhie") {
		const localQuestion = await getLocalQuestion(
			type === "truth" ? "truth" : "dare"
		);
		if (localQuestion) {
			return {
				type: type === "truth" ? "Truth" : "Dare",
				rating: "Local",
				id: localQuestion.fileName,
				question: localQuestion.question
			};
		}
	}
	const selectedType = type.split("+");

	const questionRatings = rating
		.split("+")
		.map(r => `rating=${r}`)
		.join("&");
	const questionType =
		selectedType[Math.floor(Math.random() * selectedType.length)];

	const data: any = await(
		await fetch(
			`https://api.truthordarebot.xyz/v1/${questionType}?${questionRatings}`
		)
	).json();
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
