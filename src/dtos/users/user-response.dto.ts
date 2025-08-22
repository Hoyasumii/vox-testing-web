import { z } from "zod";
import { UserType } from "./user-types";

export const UserResponseDTO = z.object({
	id: z.string(),
	name: z.string(),
	email: z.string().email(),
	type: UserType,
});

export type UserResponseDTO = z.infer<typeof UserResponseDTO>;
