import { z } from "zod";

// Disponibilidade de um médico para um dia específico com blocos de horário
export const CreateDoctorAvailabilityDTO = z
	.object({
		date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Data inválida (YYYY-MM-DD)"),
		startTime: z
			.string()
			.regex(/^\d{2}:[0-5]\d$/, "Horário inicial inválido (HH:MM)"),
		endTime: z
			.string()
			.regex(/^\d{2}:[0-5]\d$/, "Horário final inválido (HH:MM)"),
		slotMinutes: z.number().int().min(5).max(240).default(30),
	})
	.refine(
		({ startTime, endTime }) => {
			// compara como minutos totais
			const toMinutes = (t: string) =>
				parseInt(t.slice(0, 2), 10) * 60 + parseInt(t.slice(3, 5), 10);
			return toMinutes(endTime) > toMinutes(startTime);
		},
		{ message: "endTime deve ser maior que startTime", path: ["endTime"] },
	);

export type CreateDoctorAvailabilityDTO = z.infer<
	typeof CreateDoctorAvailabilityDTO
>;
