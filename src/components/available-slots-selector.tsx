"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Search, AlertCircle } from "lucide-react";
import { getAvailableSlots, type AvailableSlot } from "@/services/availability.service";

type AvailableSlotsSelectorProps = {
	selectedDoctorId?: string;
	onSelectSlot: (slot: AvailableSlot) => void;
	selectedSlot?: AvailableSlot | null;
};

export function AvailableSlotsSelector({
	selectedDoctorId,
	onSelectSlot,
	selectedSlot,
}: AvailableSlotsSelectorProps) {
	const [slots, setSlots] = useState<AvailableSlot[]>([]);
	const [loading, setLoading] = useState(false);
	const [filters, setFilters] = useState({
		date: "",
		startDate: "",
		endDate: "",
	});

	const loadSlots = async () => {
		if (!selectedDoctorId) {
			setSlots([]);
			return;
		}

		setLoading(true);
		try {
			const filterParams = {
				doctorId: selectedDoctorId,
				...filters,
			};
			
			// Remove filtros vazios
			Object.keys(filterParams).forEach(key => {
				if (!filterParams[key as keyof typeof filterParams]) {
					delete filterParams[key as keyof typeof filterParams];
				}
			});

			const availableSlots = await getAvailableSlots(filterParams);
			setSlots(availableSlots.filter(slot => slot.isAvailable));
		} catch (error) {
			console.error("Erro ao buscar slots:", error);
			setSlots([]);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadSlots();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedDoctorId]);

	const handleSearch = () => {
		loadSlots();
	};

	const formatDate = (dateString: string) => {
		try {
			const date = new Date(dateString);
			return date.toLocaleDateString("pt-BR", {
				weekday: "short",
				day: "2-digit",
				month: "2-digit",
			});
		} catch {
			return dateString;
		}
	};

	const formatTimeRange = (startHour: number, endHour: number) => {
		return `${startHour.toString().padStart(2, '0')}:00 - ${endHour.toString().padStart(2, '0')}:00`;
	};

	const getDayName = (dayOfWeek: number) => {
		const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
		return days[dayOfWeek];
	};

	if (!selectedDoctorId) {
		return (
			<Card>
				<CardContent className="pt-6">
					<div className="text-center py-8">
						<Calendar className="size-12 mx-auto text-muted-foreground mb-4" />
						<h3 className="font-medium mb-2">Selecione um médico</h3>
						<p className="text-sm text-muted-foreground">
							Escolha um médico para visualizar os horários disponíveis
						</p>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-4">
			{/* Filtros de busca */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Search className="size-5" />
						Filtrar Horários
					</CardTitle>
				</CardHeader>
				<CardContent className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
						<div className="space-y-2">
							<Label htmlFor="date-filter">Data específica</Label>
							<Input
								id="date-filter"
								type="date"
								value={filters.date}
								onChange={(e) => setFilters(prev => ({ ...prev, date: e.target.value }))}
								min={new Date().toISOString().split("T")[0]}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="start-date-filter">Data inicial</Label>
							<Input
								id="start-date-filter"
								type="date"
								value={filters.startDate}
								onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
								min={new Date().toISOString().split("T")[0]}
							/>
						</div>
						<div className="space-y-2">
							<Label htmlFor="end-date-filter">Data final</Label>
							<Input
								id="end-date-filter"
								type="date"
								value={filters.endDate}
								onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
								min={filters.startDate || new Date().toISOString().split("T")[0]}
							/>
						</div>
					</div>
					<Button onClick={handleSearch} disabled={loading} className="w-full">
						<Search className="size-4 mr-2" />
						{loading ? "Buscando..." : "Buscar Horários"}
					</Button>
				</CardContent>
			</Card>

			{/* Lista de slots disponíveis */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Clock className="size-5" />
						Horários Disponíveis
					</CardTitle>
				</CardHeader>
				<CardContent>
					{loading ? (
						<div className="space-y-3">
							{[1, 2, 3].map((i) => (
								<div key={i} className="animate-pulse">
									<div className="h-16 bg-muted rounded-lg"></div>
								</div>
							))}
						</div>
					) : slots.length === 0 ? (
						<div className="text-center py-8">
							<AlertCircle className="size-12 mx-auto text-muted-foreground mb-4" />
							<h3 className="font-medium mb-2">Nenhum horário disponível</h3>
							<p className="text-sm text-muted-foreground">
								Não há horários disponíveis para os filtros selecionados.
								Tente ajustar os filtros ou selecionar outro médico.
							</p>
						</div>
					) : (
						<div className="space-y-3">
							{slots.map((slot) => (
								<button
									key={`${slot.availabilityId}-${slot.availableDate}`}
									type="button"
									className={`w-full p-4 border rounded-lg transition-colors hover:bg-muted/50 text-left ${
										selectedSlot?.availabilityId === slot.availabilityId &&
										selectedSlot?.availableDate === slot.availableDate
											? "border-primary bg-primary/10"
											: "border-border"
									}`}
									onClick={() => onSelectSlot(slot)}
								>
									<div className="flex items-center justify-between">
										<div className="space-y-1">
											<div className="flex items-center gap-2">
												<span className="font-medium">
													{formatDate(slot.availableDate)}
												</span>
												<Badge variant="outline">
													{getDayName(slot.dayOfWeek)}
												</Badge>
											</div>
											<div className="flex items-center gap-2 text-sm text-muted-foreground">
												<Clock className="size-3" />
												<span>{formatTimeRange(slot.startHour, slot.endHour)}</span>
											</div>
										</div>
										<div className="text-right">
											<Badge variant="default">Disponível</Badge>
										</div>
									</div>
								</button>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
