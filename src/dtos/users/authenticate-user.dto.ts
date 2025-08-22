import { z } from "zod";

export const AuthenticateUserDTO = z.object({
	email: z.string().email(),
	password: z.string().min(1),
});

export type AuthenticateUserDTO = z.infer<typeof AuthenticateUserDTO>;
