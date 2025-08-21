import { z } from "zod";
import { UserType } from "./user-types";
import { UserPasswordDTO } from "./user-password.dto";

export const CreateUserDTO = z
	.object({
		name: z
			.string()
			.min(1, "Nome é obrigatório")
			.describe("Nome completo do usuário"),
		email: z
			.email("Email deve ter um formato válido")
			.describe("Endereço de email único do usuário"),
		password: UserPasswordDTO,
		type: UserType.optional().default("PATIENT"),
	})
	.describe("Dados necessários para criar um novo usuário no sistema");

export type CreateUserDTO = z.infer<typeof CreateUserDTO>;
