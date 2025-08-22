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
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/contexts/ToastContext";
import { useAuth } from "@/contexts/AuthContext";
import { Calendar, Clock, Plus, Edit, Trash2, Save, X, AlertCircle } from "lucide-react";

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

	const [formData, setFormData] = useState({
		date: "",
		startTime: "",
		endTime: "",
		slotMinutes: 30,
	});

	const loadAvailabilities = async () => {
		if (!user?.id) return;
		
		setLoading(true);
		try {
			const data = await listMyAvailability();
			setItems(data as AvailabilityUI[]);
		} catch {
			push({ message: "Falha ao carregar disponibilidades", type: "error" });
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		const loadData = async () => {
			if (!user?.id) return;
			
			setLoading(true);
			try {
				const data = await listMyAvailability();
				setItems(data as AvailabilityUI[]);
			} catch {
				push({ message: "Falha ao carregar disponibilidades", type: "error" });
			} finally {
				setLoading(false);
			}
		};
		
		loadData();
	}, [push, user?.id]);

	const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		
		const parsed = CreateDoctorAvailabilityDTO.safeParse(formData);
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
			await createAvailability(parsed.data);
			push({ message: "Disponibilidade criada com sucesso", type: "success" });
			
			// Reset form
			setFormData({
				date: "",
				startTime: "",
				endTime: "",
				slotMinutes: 30,
			});
			
			// Reload list
			await loadAvailabilities();
		} catch {
			push({ message: "Erro ao criar disponibilidade", type: "error" });
		} finally {
			setSubmitting(false);
		}
	};

	const handleEdit = (item: AvailabilityUI) => {
		setEditingId(item.id);
		setEditValues({
			startTime: item.startTime,
			endTime: item.endTime,
			slotMinutes: item.slotMinutes,
		});
	};

	const handleCancelEdit = () => {
		setEditingId(null);
		setEditValues({ startTime: "", endTime: "", slotMinutes: 30 });
	};

	const handleSaveEdit = async (itemId: string) => {
		if (!user?.id) {
			push({ message: "Usuário não encontrado", type: "error" });
			return;
		}
		
		try {
			await updateAvailability(itemId, editValues);
			push({ message: "Disponibilidade atualizada", type: "success" });
			setEditingId(null);
			await loadAvailabilities();
		} catch {
			push({ message: "Erro ao atualizar disponibilidade", type: "error" });
		}
	};

	const handleDelete = async (itemId: string) => {
		if (!confirm("Tem certeza que deseja excluir esta disponibilidade?")) {
			return;
		}
		
		if (!user?.id) {
			push({ message: "Usuário não encontrado", type: "error" });
			return;
		}
		
		try {
			await deleteAvailability(itemId);
			push({ message: "Disponibilidade excluída", type: "success" });
			await loadAvailabilities();
		} catch {
			push({ message: "Erro ao excluir disponibilidade", type: "error" });
		}
	};

	const formatDate = (dateString: string) => {
		try {
			const date = new Date(dateString);
			return date.toLocaleDateString("pt-BR", {
				weekday: "long",
				year: "numeric",
				month: "long",
				day: "numeric",
			});
		} catch {
			return dateString;
		}
	};

	const getBookedSlotsCount = (slots: { time: string; available: boolean }[]) => {
		return slots.filter(slot => !slot.available).length;
	};

	const getTotalSlotsCount = (slots: { time: string; available: boolean }[]) => {
		return slots.length;
	};

	// Verifica se o usuário é um médico
	if (user?.type !== "DOCTOR") {
		return (
			<div className="p-6">
				<Card>
					<CardContent className="pt-6">
						<div className="text-center py-8">
							<AlertCircle className="size-12 mx-auto text-muted-foreground mb-4" />
							<h3 className="font-medium mb-2">Acesso Restrito</h3>
							<p className="text-sm text-muted-foreground">
								Esta página é apenas para médicos.
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		);
	}

	return (
		<div className="p-6 space-y-6">
			<div className="flex items-center gap-2">
				<Calendar className="size-6" />
				<h1 className="text-2xl font-bold">Minhas Disponibilidades</h1>
				{loading && (
					<span className="animate-pulse text-sm text-muted-foreground">
						carregando...
					</span>
				)}
			</div>

			{/* Form to Add New Availability */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Plus className="size-5" />
						Adicionar Nova Disponibilidade
					</CardTitle>
				</CardHeader>
				<CardContent>
					<form onSubmit={onSubmit} className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
							<div className="space-y-2">
								<Label htmlFor="date">Data</Label>
								<input
									id="date"
									required
									type="date"
									value={formData.date}
									onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
									className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary/50"
									min={new Date().toISOString().split('T')[0]}
								/>
								{fieldErrors.date && (
									<span className="text-xs text-red-600">{fieldErrors.date}</span>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="startTime">Horário de Início</Label>
								<Input
									id="startTime"
									required
									type="time"
									value={formData.startTime}
									onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
									step={300}
								/>
								{fieldErrors.startTime && (
									<span className="text-xs text-red-600">{fieldErrors.startTime}</span>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="endTime">Horário de Fim</Label>
								<Input
									id="endTime"
									required
									type="time"
									value={formData.endTime}
									onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
									step={300}
								/>
								{fieldErrors.endTime && (
									<span className="text-xs text-red-600">{fieldErrors.endTime}</span>
								)}
							</div>

							<div className="space-y-2">
								<Label htmlFor="slotMinutes">Duração (minutos)</Label>
								<Input
									id="slotMinutes"
									type="number"
									min={5}
									max={240}
									value={formData.slotMinutes}
									onChange={(e) => setFormData(prev => ({ ...prev, slotMinutes: Number(e.target.value) }))}
									placeholder="30"
								/>
								{fieldErrors.slotMinutes && (
									<span className="text-xs text-red-600">{fieldErrors.slotMinutes}</span>
								)}
							</div>
						</div>

						<Button type="submit" disabled={submitting} size="lg">
							{submitting ? "Salvando..." : "Adicionar Disponibilidade"}
						</Button>
					</form>
				</CardContent>
			</Card>

			{/* List of Existing Availabilities */}
			<Card>
				<CardHeader>
					<CardTitle>Disponibilidades Cadastradas</CardTitle>
				</CardHeader>
				<CardContent>
					{items.length === 0 ? (
						<div className="text-center py-8">
							<Clock className="size-12 mx-auto text-muted-foreground mb-4" />
							<h3 className="font-medium mb-2">Nenhuma disponibilidade cadastrada</h3>
							<p className="text-sm text-muted-foreground">
								Adicione sua primeira disponibilidade usando o formulário acima.
							</p>
						</div>
					) : (
						<div className="space-y-4">
							{items.map((item) => {
								const bookedSlots = getBookedSlotsCount(item.slots);
								const totalSlots = getTotalSlotsCount(item.slots);
								const isEditing = editingId === item.id;

								return (
									<div key={item.id} className="border rounded-lg p-4 space-y-3">
										<div className="flex items-center justify-between">
											<div>
												<h3 className="font-medium">{formatDate(item.date)}</h3>
												<div className="flex items-center gap-4 text-sm text-muted-foreground">
													{isEditing ? (
														<div className="flex items-center gap-2">
															<input
																type="time"
																value={editValues.startTime}
																onChange={(e) =>
																	setEditValues(v => ({ ...v, startTime: e.target.value }))
																}
																className="border rounded px-2 py-1 text-xs"
															/>
															<span>até</span>
															<input
																type="time"
																value={editValues.endTime}
																onChange={(e) =>
																	setEditValues(v => ({ ...v, endTime: e.target.value }))
																}
																className="border rounded px-2 py-1 text-xs"
															/>
															<input
																type="number"
																min={5}
																max={240}
																value={editValues.slotMinutes}
																onChange={(e) =>
																	setEditValues(v => ({ ...v, slotMinutes: Number(e.target.value) }))
																}
																className="border rounded px-2 py-1 text-xs w-16"
															/>
															<span>min</span>
														</div>
													) : (
														<>
															<span>{item.startTime} - {item.endTime}</span>
															<span>•</span>
															<span>{item.slotMinutes} min por consulta</span>
															<span>•</span>
															<span>{bookedSlots}/{totalSlots} agendados</span>
														</>
													)}
												</div>
											</div>
											
											<div className="flex items-center gap-2">
												{isEditing ? (
													<>
														<Button
															size="sm"
															variant="default"
															onClick={() => handleSaveEdit(item.id)}
														>
															<Save className="size-4" />
														</Button>
														<Button
															size="sm"
															variant="outline"
															onClick={handleCancelEdit}
														>
															<X className="size-4" />
														</Button>
													</>
												) : (
													<>
														<Button
															size="sm"
															variant="outline"
															onClick={() => handleEdit(item)}
														>
															<Edit className="size-4" />
														</Button>
														<Button
															size="sm"
															variant="destructive"
															onClick={() => handleDelete(item.id)}
														>
															<Trash2 className="size-4" />
														</Button>
													</>
												)}
											</div>
										</div>

										{/* Slots visualization */}
										<div className="space-y-2">
											<h4 className="text-sm font-medium">Horários:</h4>
											<div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
												{item.slots.map((slot) => (
													<div
														key={slot.time}
														className={`px-2 py-1 rounded text-xs text-center border ${
															slot.available
																? "bg-green-50 border-green-200 text-green-800"
																: "bg-red-50 border-red-200 text-red-800"
														}`}
													>
														{slot.time}
													</div>
												))}
											</div>
										</div>
									</div>
								);
							})}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
