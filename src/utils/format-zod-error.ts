import z from "zod";
import type { $ZodError } from "zod/v4/core/errors.cjs";

export function formatZodError(error: $ZodError) {
	const treeifiedError: {
		errors: string[];
		properties: Record<string, { errors: Array<string> }>;
	} = z.treeifyError(error) as {
		errors: string[];
		properties: Record<string, { errors: Array<string> }>;
	};

	return Object.fromEntries(
		Object.entries(treeifiedError.properties).map(([key, value]) => {
			return [key, value.errors];
		}),
	);
}
