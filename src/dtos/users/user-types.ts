import { z } from "zod";

export const UserType = z.enum(["DOCTOR", "PATIENT"]).describe("Tipo de usuário no sistema: médico ou paciente");

export type UserType = z.infer<typeof UserType>;
