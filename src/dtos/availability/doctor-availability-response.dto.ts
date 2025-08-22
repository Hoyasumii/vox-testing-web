import { z } from "zod";

export const DoctorAvailabilityResponseDTO = z.object({
	id: z.string(),
	doctorId: z.string(),
	date: z.string(),
	startTime: z.string(),
	endTime: z.string(),
	slotMinutes: z.number(),
	slots: z.array(
		z.object({
			time: z.string(),
			available: z.boolean(),
		}),
	),
});

export type DoctorAvailabilityResponseDTO = z.infer<
	typeof DoctorAvailabilityResponseDTO
>;
