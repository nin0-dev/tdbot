export function sanitize(input: string) {
	return input
		.replaceAll("*", "\\*")
		.replaceAll("#", "\\#")
		.replaceAll("@", "\\@")
		.replaceAll("_", "\\_");
}
