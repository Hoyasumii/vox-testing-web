import { z } from "zod";

export const UserPasswordDTO = z
	.string()
	.min(7, "A senha deve ter no mínimo 7 caracteres.")
	.refine((password) => /[A-Z]/.test(password), {
		message: "A senha deve conter pelo menos uma letra maiúscula.",
	})
	.refine((password) => /[a-z]/.test(password), {
		message: "A senha deve conter pelo menos uma letra minúscula.",
	})
	.refine((password) => /[-!@#$%^&*(),.?":{}|<>]/.test(password), {
		message: "A senha deve conter pelo menos um caractere especial.",
	})
	.describe("Senha do usuário que deve conter no mínimo 7 caracteres, incluindo ao menos uma letra maiúscula, uma minúscula e um caractere especial");

export type UserPasswordDTO = z.infer<typeof UserPasswordDTO>;
