import { z } from "zod";

export const CreateScheduleDTO = z.object({
	availabilityId: z.string().uuid("ID de disponibilidade inválido"),
	doctorId: z.string().uuid("ID do médico inválido"),
	scheduledAt: z.string().datetime("Data e hora inválidas"),
});

export type CreateScheduleDTO = z.infer<typeof CreateScheduleDTO>;
