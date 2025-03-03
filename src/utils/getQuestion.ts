import { promises as fs } from "fs";
import path from "path";

const usedQuestions: string[] = [];

async function getLocalQuestion(
	type: "truth" | "dare"
): Promise<{ fileName: string; question: string }> {
	const questionsDir = path.join(__dirname, "../../questions");
	const files = await fs.readdir(questionsDir);
	const allQuestions: { fileName: string; question: string }[] = [];

	for (const file of files) {
		if (file.startsWith(type)) {
			const filePath = path.join(questionsDir, file);
			const fileContent = await fs.readFile(filePath, "utf-8");
			const questions = fileContent.split("\n").filter(Boolean);
			questions.forEach(question => {
				allQuestions.push({ fileName: file, question });
			});
		}
	}

	const randomQuestionObj =
		allQuestions[Math.floor(Math.random() * allQuestions.length)];
	const randomFile = randomQuestionObj.fileName;
	const randomQuestion = randomQuestionObj.question;
	return {
		fileName: randomFile,
		question: randomQuestion
	};
}

export async function getQuestion(
	type: string,
	rating: string,
	alwaysLocal: boolean = false
): Promise<{
	id: string;
	type: string;
	rating: "PG" | "PG-13" | "R" | "Local";
	question: string;
}> {
	if ((Math.random() < 0.7 && type !== "nhie") || alwaysLocal) {
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

	if (usedQuestions.includes(data.id)) {
		return await getQuestion(type, rating, true);
	}

	usedQuestions.push(data.id);

	if (usedQuestions.length > 40) {
		usedQuestions.length = 0;
	}
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
