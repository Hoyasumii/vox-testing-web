import { z } from "zod";
import { UserType } from "./user-types";

export const UserAuthResponseDTO = z.object({
	token: z.string(),
	user: z.object({
		id: z.string(),
		name: z.string(),
		email: z.string().email(),
		type: UserType,
	}),
});

export type UserAuthResponseDTO = z.infer<typeof UserAuthResponseDTO>;
