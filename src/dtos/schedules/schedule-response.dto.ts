import { z } from "zod";

export const ScheduleResponseDTO = z.object({
	id: z.string(),
	patientId: z.string(),
	doctorId: z.string(),
	availabilityId: z.string(),
	date: z.string(),
	slotTime: z.string(),
	notes: z.string().nullable().optional(),
	createdAt: z.string(),
});

export type ScheduleResponseDTO = z.infer<typeof ScheduleResponseDTO>;
