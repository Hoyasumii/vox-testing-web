import type { FormEvent } from "react";

export function getFormData<OutputType = unknown>(
	form: FormEvent<HTMLFormElement>,
): OutputType {
	const formData = new FormData(form.currentTarget);

	return Object.fromEntries(formData.entries()) as OutputType;
}
