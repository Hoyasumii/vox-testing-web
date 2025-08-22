"use client";
import { useEffect, useState } from "react";
import {
	listMySchedules,
	cancelSchedule,
	completeSchedule,
} from "@/services/schedule.service";
import type { ScheduleResponseDTO } from "@/dtos/schedules/schedule-response.dto";
import { useToast } from "@/contexts/ToastContext";

type ScheduleUI = {
	id: string;
	date: string;
	slotTime: string;
	doctorId: string;
	notes?: string | null;
	status?: "SCHEDULED" | "CANCELLED" | "COMPLETED";
};

export default function SchedulesPage() {
	const [schedules, setSchedules] = useState<ScheduleUI[]>([]);
	const [loading, setLoading] = useState(false);
	const { push } = useToast();

	useEffect(() => {
		(async () => {
			setLoading(true);
			try {
				const data = await listMySchedules();
				setSchedules(
					(data as ScheduleResponseDTO[]).map((d) => ({
						id: d.id,
						date: d.date,
						slotTime: d.slotTime,
						doctorId: d.doctorId,
						notes: d.notes,
					})),
				);
			} catch {
				push({ message: "Falha ao carregar consultas", type: "error" });
			} finally {
				setLoading(false);
			}
		})();
	}, [push]);

	return (
		<div className="p-6 space-y-4" aria-busy={loading} aria-live="polite">
			<h1 className="text-xl font-semibold flex items-center gap-2">
				Minhas Consultas{" "}
				{loading && (
					<span className="text-xs text-muted-foreground animate-pulse">
						carregando...
					</span>
				)}
			</h1>
			<ul className="space-y-2">
				{schedules.map((s) => (
					<li
						key={s.id}
						className="border rounded p-3 text-sm flex flex-col gap-1"
					>
						<div className="flex items-center gap-2">
							<strong>{s.date}</strong> às {s.slotTime}
							<span
								className={`text-[10px] px-1.5 py-0.5 rounded border ${s.status === "CANCELLED" ? "opacity-70" : ""}`}
							>
								{!s.status || s.status === "SCHEDULED"
									? "Agendada"
									: s.status === "CANCELLED"
										? "Cancelada"
										: "Concluída"}
							</span>
						</div>
						{s.notes && <div className="text-muted-foreground">{s.notes}</div>}
						<div className="flex gap-2 pt-1">
							<button
								type="button"
								disabled={
									loading ||
									s.status === "CANCELLED" ||
									s.status === "COMPLETED"
								}
								onClick={async () => {
									try {
										await cancelSchedule(s.id);
										setSchedules((prev) =>
											prev.map((p) =>
												p.id === s.id ? { ...p, status: "CANCELLED" } : p,
											),
										);
										push({ message: "Consulta cancelada", type: "success" });
									} catch {
										push({ message: "Falha ao cancelar", type: "error" });
									}
								}}
								className="text-xs px-2 py-0.5 border rounded"
							>
								Cancelar
							</button>
							<button
								type="button"
								disabled={
									loading ||
									s.status === "CANCELLED" ||
									s.status === "COMPLETED"
								}
								onClick={async () => {
									try {
										await completeSchedule(s.id);
										setSchedules((prev) =>
											prev.map((p) =>
												p.id === s.id ? { ...p, status: "COMPLETED" } : p,
											),
										);
										push({ message: "Consulta concluída", type: "success" });
									} catch {
										push({ message: "Falha ao concluir", type: "error" });
									}
								}}
								className="text-xs px-2 py-0.5 border rounded"
							>
								Concluir
							</button>
						</div>
					</li>
				))}
				{!loading && schedules.length === 0 && (
					<li className="text-sm text-muted-foreground">Nenhuma consulta.</li>
				)}
				{loading && (
					<li className="text-sm text-muted-foreground animate-pulse">
						Carregando...
					</li>
				)}
			</ul>
		</div>
	);
}
