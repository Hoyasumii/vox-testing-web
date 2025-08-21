export function stringifyZodError(content: object): string {
	let message = "Erros:";

	Object.entries(content).forEach(([key, value]) => {
		message += `\n\t- ${key}`;

		if (Array.isArray(value)) {
			message += `\n\t\t- ${value.join("\n\t- ")}`;
		}
	});

	return message;
}
