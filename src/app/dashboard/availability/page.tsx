"use client";

import { useContext, useEffect, useState, useCallback } from "react";
import { AuthContext } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { availabilityService } from "@/services/availability.service";
import type { DoctorAvailabilityResponseDTO } from "@/dtos/availability";
import type { CreateDoctorAvailabilityDTO } from "@/dtos/availability";
import { DashboardHeader } from "@/components/dashboard-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Badge } from "@/components/ui/badge";
import { Clock, Plus, Edit, Trash2, Save, X, Calendar } from "lucide-react";

// Função para garantir formato HH:00
const formatTimeToHour = (time: string): string => {
	if (!time) return "";
	const [hours] = time.split(":");
	return `${hours.padStart(2, "0")}:00`;
};

// Função para formatar data para exibição
const formatDateForDisplay = (date: string): string => {
	try {
		const dateObj = new Date(date + "T00:00:00");
		return dateObj.toLocaleDateString("pt-BR", {
			weekday: "long",
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	} catch {
		return date;
	}
};

// Função para obter data de hoje no formato YYYY-MM-DD
const getTodayDate = (): string => {
	const today = new Date();
	return today.toISOString().split("T")[0];
};

export default function AvailabilityPage() {
	const { user } = useContext(AuthContext);
	const { push: showToast } = useToast();

	const [availabilities, setAvailabilities] = useState<
		DoctorAvailabilityResponseDTO[]
	>([]);
	const [isLoading, setIsLoading] = useState(true);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);

	// Form states
	const [selectedDate, setSelectedDate] = useState(getTodayDate());
	const [startTime, setStartTime] = useState("");
	const [endTime, setEndTime] = useState("");
	const [slotMinutes, setSlotMinutes] = useState(60); // 1 hora por slot

	// Edit form states
	const [editStartTime, setEditStartTime] = useState("");
	const [editEndTime, setEditEndTime] = useState("");

	const loadAvailabilities = useCallback(async () => {
		try {
			setIsLoading(true);
			const response = await availabilityService.listMyAvailability();
			setAvailabilities(response);
		} catch (error) {
			console.error("Erro ao carregar disponibilidades:", error);
			showToast({
				message: "Erro ao carregar disponibilidades",
				type: "error",
			});
		} finally {
			setIsLoading(false);
		}
	}, [showToast]);

	useEffect(() => {
		loadAvailabilities();
	}, [loadAvailabilities]);

	const validateForm = (): boolean => {
		if (!selectedDate) {
			showToast({ message: "Por favor, selecione uma data", type: "error" });
			return false;
		}
		if (!startTime) {
			showToast({
				message: "Por favor, informe o horário de início",
				type: "error",
			});
			return false;
		}
		if (!endTime) {
			showToast({
				message: "Por favor, informe o horário de fim",
				type: "error",
			});
			return false;
		}
		if (startTime >= endTime) {
			showToast({
				message: "O horário de início deve ser menor que o horário de fim",
				type: "error",
			});
			return false;
		}

		// Verificar se a data não é no passado
		const selectedDateObj = new Date(selectedDate + "T00:00:00");
		const today = new Date();
		today.setHours(0, 0, 0, 0);

		if (selectedDateObj < today) {
			showToast({
				message: "Não é possível criar disponibilidade para datas passadas",
				type: "error",
			});
			return false;
		}

		return true;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (!validateForm()) return;

		try {
			setIsSubmitting(true);

			const formattedStartTime = formatTimeToHour(startTime);
			const formattedEndTime = formatTimeToHour(endTime);

			const data: CreateDoctorAvailabilityDTO = {
				date: selectedDate,
				startTime: formattedStartTime,
				endTime: formattedEndTime,
				slotMinutes,
			};

			// Debug logs
			console.log("User ID:", user?.id);
			console.log("User Type:", user?.type);
			console.log("Creating availability with data:", data);

			await availabilityService.createAvailability(data);

			showToast({
				message: "Disponibilidade criada com sucesso!",
				type: "success",
			});

			// Reset form
			setSelectedDate(getTodayDate());
			setStartTime("");
			setEndTime("");

			// Reload data
			await loadAvailabilities();
		} catch (error) {
			console.error("Erro ao criar disponibilidade:", error);
			const message =
				(error as { response?: { data?: { message?: string } } })?.response
					?.data?.message || "Erro ao criar disponibilidade";
			showToast({ message, type: "error" });
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleEdit = (availability: DoctorAvailabilityResponseDTO) => {
		setEditingId(availability.id);
		setEditStartTime(availability.startTime);
		setEditEndTime(availability.endTime);
	};

	const handleSaveEdit = async (id: string) => {
		if (!editStartTime || !editEndTime) {
			showToast({
				message: "Por favor, preencha todos os campos",
				type: "error",
			});
			return;
		}

		if (editStartTime >= editEndTime) {
			showToast({
				message: "O horário de início deve ser menor que o horário de fim",
				type: "error",
			});
			return;
		}

		try {
			const formattedStartTime = formatTimeToHour(editStartTime);
			const formattedEndTime = formatTimeToHour(editEndTime);

			await availabilityService.updateAvailability(id, {
				startTime: formattedStartTime,
				endTime: formattedEndTime,
			});

			showToast({
				message: "Disponibilidade atualizada com sucesso!",
				type: "success",
			});
			setEditingId(null);
			await loadAvailabilities();
		} catch (error) {
			console.error("Erro ao atualizar disponibilidade:", error);
			const message =
				(error as { response?: { data?: { message?: string } } })?.response
					?.data?.message || "Erro ao atualizar disponibilidade";
			showToast({ message, type: "error" });
		}
	};

	const handleCancelEdit = () => {
		setEditingId(null);
		setEditStartTime("");
		setEditEndTime("");
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Tem certeza que deseja excluir esta disponibilidade?")) {
			return;
		}

		try {
			await availabilityService.deleteAvailability(id);
			showToast({
				message: "Disponibilidade excluída com sucesso!",
				type: "success",
			});
			await loadAvailabilities();
		} catch (error) {
			console.error("Erro ao excluir disponibilidade:", error);
			const message =
				(error as { response?: { data?: { message?: string } } })?.response
					?.data?.message || "Erro ao excluir disponibilidade";
			showToast({ message, type: "error" });
		}
	};

	// Agrupar disponibilidades por data
	const groupedAvailabilities = availabilities.reduce(
		(acc, item) => {
			if (!acc[item.date]) {
				acc[item.date] = [];
			}
			acc[item.date].push(item);
			return acc;
		},
		{} as Record<string, DoctorAvailabilityResponseDTO[]>,
	);

	// Ordenar datas
	const sortedDates = Object.keys(groupedAvailabilities).sort();

	if (isLoading) {
		return (
			<div className="min-h-screen bg-gray-50">
				<div className="flex items-center justify-center h-96">
					<LoadingSpinner />
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gray-50">
			<div className="max-w-6xl mx-auto p-6 space-y-6">
				<div className="flex items-center gap-3">
					<Clock className="h-8 w-8 text-blue-600" />
					<h1 className="text-3xl font-bold text-gray-900">
						Gerenciar Disponibilidade
					</h1>
				</div>

				{/* Formulário de Criação */}
				<Card className="shadow-sm border-0 bg-white">
					<CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
						<CardTitle className="flex items-center gap-2 text-blue-900">
							<Plus className="h-5 w-5" />
							Adicionar Nova Disponibilidade
						</CardTitle>
					</CardHeader>
					<CardContent className="p-6">
						<form onSubmit={handleSubmit} className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
								<div>
									<Label
										htmlFor="date"
										className="text-sm font-medium text-gray-700"
									>
										Data
									</Label>
									<Input
										id="date"
										type="date"
										value={selectedDate}
										min={getTodayDate()}
										onChange={(e) => setSelectedDate(e.target.value)}
										className="mt-1"
										required
									/>
								</div>

								<div>
									<Label
										htmlFor="startTime"
										className="text-sm font-medium text-gray-700"
									>
										Horário de Início
									</Label>
									<Input
										id="startTime"
										type="time"
										step="3600"
										value={startTime}
										onChange={(e) => setStartTime(e.target.value)}
										className="mt-1"
										required
									/>
								</div>

								<div>
									<Label
										htmlFor="endTime"
										className="text-sm font-medium text-gray-700"
									>
										Horário de Fim
									</Label>
									<Input
										id="endTime"
										type="time"
										step="3600"
										value={endTime}
										onChange={(e) => setEndTime(e.target.value)}
										className="mt-1"
										required
									/>
								</div>

								<div>
									<Label
										htmlFor="slotMinutes"
										className="text-sm font-medium text-gray-700"
									>
										Duração dos Slots (min)
									</Label>
									<select
										id="slotMinutes"
										value={slotMinutes}
										onChange={(e) => setSlotMinutes(Number(e.target.value))}
										className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
									>
										<option value={30}>30 minutos</option>
										<option value={60}>1 hora</option>
										<option value={90}>1h 30min</option>
										<option value={120}>2 horas</option>
									</select>
								</div>
							</div>

							<div className="flex justify-end">
								<Button
									type="submit"
									disabled={isSubmitting}
									className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
								>
									{isSubmitting ? (
										<>
											<LoadingSpinner size={16} />
											<span className="ml-2">Criando...</span>
										</>
									) : (
										<>
											<Plus className="h-4 w-4 mr-2" />
											Adicionar Disponibilidade
										</>
									)}
								</Button>
							</div>
						</form>
					</CardContent>
				</Card>

				{/* Lista de Disponibilidades */}
				<Card className="shadow-sm border-0 bg-white">
					<CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
						<CardTitle className="text-green-900">
							Minhas Disponibilidades ({availabilities.length})
						</CardTitle>
					</CardHeader>
					<CardContent className="p-6">
						{availabilities.length === 0 ? (
							<div className="text-center py-12">
								<Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
								<p className="text-gray-500 text-lg">
									Nenhuma disponibilidade cadastrada ainda.
								</p>
								<p className="text-gray-400 text-sm mt-2">
									Use o formulário acima para adicionar sua primeira
									disponibilidade.
								</p>
							</div>
						) : (
							<div className="space-y-6">
								{sortedDates.map((date) => {
									const dateAvailabilities = groupedAvailabilities[date] || [];

									return (
										<div key={date} className="space-y-3">
											<h3 className="text-lg font-semibold text-gray-900 border-b pb-2 flex items-center gap-2">
												<Calendar className="h-5 w-5 text-blue-600" />
												{formatDateForDisplay(date)}
											</h3>
											<div className="grid gap-3">
												{dateAvailabilities.map((availability) => (
													<div
														key={availability.id}
														className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border"
													>
														<div className="flex items-center gap-4">
															<Badge
																variant="outline"
																className="bg-blue-50 text-blue-700 border-blue-200"
															>
																{availability.slotMinutes}min
															</Badge>

															{editingId === availability.id ? (
																<div className="flex items-center gap-2">
																	<Input
																		type="time"
																		step="3600"
																		value={editStartTime}
																		onChange={(e) =>
																			setEditStartTime(e.target.value)
																		}
																		className="w-24"
																	/>
																	<span className="text-gray-500">às</span>
																	<Input
																		type="time"
																		step="3600"
																		value={editEndTime}
																		onChange={(e) =>
																			setEditEndTime(e.target.value)
																		}
																		className="w-24"
																	/>
																</div>
															) : (
																<span className="text-sm font-medium text-gray-700">
																	{availability.startTime} às{" "}
																	{availability.endTime}
																</span>
															)}

															<Badge variant="secondary" className="text-xs">
																{
																	availability.slots.filter((s) => s.available)
																		.length
																}{" "}
																slots livres
															</Badge>
														</div>

														<div className="flex items-center gap-2">
															{editingId === availability.id ? (
																<>
																	<Button
																		size="sm"
																		onClick={() =>
																			handleSaveEdit(availability.id)
																		}
																		className="bg-green-600 hover:bg-green-700 text-white"
																	>
																		<Save className="h-4 w-4" />
																	</Button>
																	<Button
																		size="sm"
																		variant="outline"
																		onClick={handleCancelEdit}
																	>
																		<X className="h-4 w-4" />
																	</Button>
																</>
															) : (
																<>
																	<Button
																		size="sm"
																		variant="outline"
																		onClick={() => handleEdit(availability)}
																	>
																		<Edit className="h-4 w-4" />
																	</Button>
																	<Button
																		size="sm"
																		variant="outline"
																		onClick={() =>
																			handleDelete(availability.id)
																		}
																		className="text-red-600 hover:text-red-700 hover:bg-red-50"
																	>
																		<Trash2 className="h-4 w-4" />
																	</Button>
																</>
															)}
														</div>
													</div>
												))}
											</div>
										</div>
									);
								})}
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
