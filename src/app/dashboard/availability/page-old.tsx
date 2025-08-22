"use client";
import { useEffect, useState, type FormEvent } from "react";
import { CreateDoctorAvailabilityDTO } from "@/dtos/availability/create-doctor-availability.dto";
import {
	listMyAvailability,
	createAvailability,
	updateAvailability,
	deleteAvailability,
} from "@/services/availability.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/contexts/ToastContext";
import { useAuth } from "@/contexts/AuthContext";

type AvailabilityUI = {
	id: string;
	date: string;
	startTime: string;
	endTime: string;
	slotMinutes: number;
	slots: { time: string; available: boolean }[];
};

export default function AvailabilityPage() {
	const [items, setItems] = useState<AvailabilityUI[]>([]);
	const [loading, setLoading] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const { push } = useToast();
	const { user } = useAuth();
	const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
	const [editingId, setEditingId] = useState<string | null>(null);
	const [editValues, setEditValues] = useState<{
		startTime: string;
		endTime: string;
		slotMinutes: number;
	}>({ startTime: "", endTime: "", slotMinutes: 30 });

	useEffect(() => {
		(async () => {
			if (!user?.id) return;
			
			setLoading(true);
			try {
				const data = await listMyAvailability(user.id);
				setItems(data as AvailabilityUI[]);
			} catch {
				push({ message: "Falha ao carregar disponibilidades", type: "error" });
			} finally {
				setLoading(false);
			}
		})();
	}, [push, user?.id]);

	const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const fd = new FormData(e.currentTarget);
		const payload = {
			date: fd.get("date") as string,
			startTime: fd.get("startTime") as string,
			endTime: fd.get("endTime") as string,
			slotMinutes: Number(fd.get("slotMinutes")) || 30,
		};
		const parsed = CreateDoctorAvailabilityDTO.safeParse(payload);
		if (!parsed.success) {
			const errs: Record<string, string> = {};
			for (const issue of parsed.error.issues) {
				const key = issue.path.join(".") || "root";
				errs[key] = issue.message;
			}
			setFieldErrors(errs);
			push({ message: "Dados inválidos", type: "error" });
			return;
		}
		setFieldErrors({});
		if (!user?.id) {
			push({ message: "Usuário não encontrado", type: "error" });
			return;
		}
		
		try {
			setSubmitting(true);
			await createAvailability({ ...parsed.data, doctorId: user.id });
			push({ message: "Disponibilidade criada", type: "success" });
			e.currentTarget.reset();
			// recarrega lista
			try {
				const data = await listMyAvailability(user.id);
				setItems(data as AvailabilityUI[]);
			} catch {
				/* ignore */
			}
		} catch {
			push({ message: "Erro ao criar disponibilidade", type: "error" });
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="p-6 space-y-6" aria-busy={loading} aria-live="polite">
			<h1 className="text-xl font-semibold flex items-center gap-2">
				<span>Minhas Disponibilidades</span>
				{loading && (
					<span className="animate-pulse text-xs text-muted-foreground">
						carregando...
					</span>
				)}
			</h1>
			<form
				onSubmit={onSubmit}
				className="grid gap-2 sm:grid-cols-5 items-end"
				aria-describedby="availability-form-help"
			>
				<div className="flex flex-col gap-1">
					<label htmlFor="date">Data</label>
					<input
						id="date"
						required
						type="date"
						name="date"
						className="border rounded px-2 py-1"
					/>
					{fieldErrors.date && (
						<span className="text-xs text-red-600">{fieldErrors.date}</span>
					)}
				</div>
				<div className="flex flex-col gap-1">
					<label htmlFor="startTime">Início</label>
					<Input
						id="startTime"
						required
						name="startTime"
						type="time"
						step={300}
						placeholder="08:00"
					/>
					{fieldErrors.startTime && (
						<span className="text-xs text-red-600">
							{fieldErrors.startTime}
						</span>
					)}
				</div>
				<div className="flex flex-col gap-1">
					<label htmlFor="endTime">Fim</label>
					<Input
						id="endTime"
						required
						name="endTime"
						type="time"
						step={300}
						placeholder="12:00"
					/>
					{fieldErrors.endTime && (
						<span className="text-xs text-red-600">{fieldErrors.endTime}</span>
					)}
				</div>
				<div className="flex flex-col gap-1">
					<label htmlFor="slotMinutes">Duração (min)</label>
					<Input
						id="slotMinutes"
						name="slotMinutes"
						type="number"
						min={5}
						max={240}
						placeholder="30"
					/>
					{fieldErrors.slotMinutes && (
						<span className="text-xs text-red-600">
							{fieldErrors.slotMinutes}
						</span>
					)}
				</div>
				<Button type="submit" disabled={submitting}>
					{submitting ? "Salvando..." : "Adicionar"}
				</Button>
			</form>
			<p id="availability-form-help" className="sr-only">
				Defina um intervalo de início e fim para gerar slots.
			</p>
			<ul className="space-y-2">
				{items.map((a) => (
					<li
						key={a.id}
						className="border rounded p-3 text-sm flex flex-col gap-2"
					>
						<div className="flex flex-wrap items-center gap-2 justify-between">
							<div>
								<strong>{a.date}</strong>{" "}
								{editingId === a.id ? (
									<span className="inline-flex gap-2">
										<input
											aria-label="Início"
											type="time"
											value={editValues.startTime}
											onChange={(e) =>
												setEditValues((v) => ({
													...v,
													startTime: e.target.value,
												}))
											}
											className="border rounded px-1 py-0.5 text-xs"
										/>
										<input
											aria-label="Fim"
											type="time"
											value={editValues.endTime}
											onChange={(e) =>
												setEditValues((v) => ({
													...v,
													endTime: e.target.value,
												}))
											}
											className="border rounded px-1 py-0.5 text-xs"
										/>
										<input
											aria-label="Duração"
											type="number"
											min={5}
											max={240}
											value={editValues.slotMinutes}
											onChange={(e) =>
												setEditValues((v) => ({
													...v,
													slotMinutes: Number(e.target.value),
												}))
											}
											className="border rounded px-1 py-0.5 w-16 text-xs"
										/>
									</span>
								) : (
									<span>
										{a.startTime} - {a.endTime} ({a.slotMinutes}m)
									</span>
								)}
							</div>
							<div className="flex gap-2">
								{editingId === a.id ? (
									<>
										<button
											type="button"
											className="text-xs px-2 py-0.5 border rounded"
											onClick={async () => {
												if (!user?.id) {
													push({ message: "Usuário não encontrado", type: "error" });
													return;
												}
												
												try {
													await updateAvailability(user.id, a.id, editValues);
													setItems((prev) =>
														prev.map((p) =>
															p.id === a.id ? { ...p, ...editValues } : p,
														),
													);
													push({ message: "Atualizado", type: "success" });
													setEditingId(null);
												} catch {
													push({ message: "Erro ao atualizar", type: "error" });
												}
											}}
										>
											{"Salvar"}
										</button>
										<button
											type="button"
											className="text-xs px-2 py-0.5 border rounded"
											onClick={() => {
												setEditingId(null);
											}}
										>
											{"Cancelar"}
										</button>
									</>
								) : (
									<>
										<button
											type="button"
											className="text-xs px-2 py-0.5 border rounded"
											onClick={() => {
												setEditingId(a.id);
												setEditValues({
													startTime: a.startTime,
													endTime: a.endTime,
													slotMinutes: a.slotMinutes,
												});
											}}
										>
											Editar
										</button>
										<button
											type="button"
											className="text-xs px-2 py-0.5 border rounded"
											onClick={async () => {
												if (!confirm("Remover disponibilidade?")) return;
												if (!user?.id) {
													push({ message: "Usuário não encontrado", type: "error" });
													return;
												}
												
												try {
													await deleteAvailability(user.id, a.id);
													setItems((prev) => prev.filter((p) => p.id !== a.id));
													push({ message: "Removido", type: "success" });
												} catch {
													push({ message: "Erro ao remover", type: "error" });
												}
											}}
										>
											Remover
										</button>
									</>
								)}
							</div>
						</div>
						<div className="flex flex-wrap gap-1">
							{a.slots?.map((s) => (
								<span
									key={s.time}
									className={`px-2 py-0.5 rounded text-xs border ${s.available ? "bg-green-100" : "bg-red-100"}`}
								>
									{s.time}
								</span>
							))}
						</div>
					</li>
				))}
				{!loading && items.length === 0 && (
					<li className="text-sm text-muted-foreground">
						Nenhuma disponibilidade cadastrada.
					</li>
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
