"use client";
import { useEffect, useState, type FormEvent } from "react";
import { listDoctorAvailability } from "@/services/availability.service";
import { createSchedule } from "@/services/schedule.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/contexts/ToastContext";
import { DoctorList } from "@/components/doctor-list";
import { AvailabilityCalendar } from "@/components/availability-calendar";
import { CalendarDays, FileText, UserCheck } from "lucide-react";
import type { DoctorAvailabilityResponseDTO } from "@/dtos/availability/doctor-availability-response.dto";

type DoctorAvailability = DoctorAvailabilityResponseDTO;

export default function AppointmentsPage() {
	const [selectedDoctor, setSelectedDoctor] = useState<{
		id: string;
		name: string;
	} | null>(null);
	const [date, setDate] = useState("");
	const [notes, setNotes] = useState("");
	const [availability, setAvailability] = useState<DoctorAvailability[]>([]);
	const [selectedSlot, setSelectedSlot] = useState<{
		availabilityId: string;
		time: string;
	} | null>(null);
	const [loading, setLoading] = useState(false);
	const [booking, setBooking] = useState(false);
	const { push } = useToast();

	// Buscar horários quando médico ou data mudarem
	useEffect(() => {
		if (!selectedDoctor?.id) {
			setAvailability([]);
			setSelectedSlot(null);
			return;
		}

		const loadAvailability = async () => {
			setLoading(true);
			setSelectedSlot(null);
			try {
				const data = await listDoctorAvailability(selectedDoctor.id, date);
				setAvailability(data);
			} catch {
				push({ message: "Falha ao buscar horários disponíveis", type: "error" });
				setAvailability([]);
			} finally {
				setLoading(false);
			}
		};

		loadAvailability();
	}, [selectedDoctor?.id, date, push]);

	const handleDoctorSelect = (doctorId: string, doctorName: string) => {
		setSelectedDoctor({ id: doctorId, name: doctorName });
		setSelectedSlot(null);
	};

	const handleSlotSelect = (availabilityId: string, time: string) => {
		setSelectedSlot({ availabilityId, time });
	};

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		
		if (!selectedSlot) {
			push({ message: "Selecione um horário disponível", type: "error" });
			return;
		}

		if (!selectedDoctor) {
			push({ message: "Selecione um médico", type: "error" });
			return;
		}

		// Encontrar a data da disponibilidade selecionada
		const availabilityData = availability.find(a => a.id === selectedSlot.availabilityId);
		if (!availabilityData) {
			push({ message: "Dados de disponibilidade não encontrados", type: "error" });
			return;
		}

		// Construir a data/hora ISO
		const [hours, minutes] = selectedSlot.time.split(":");
		const scheduledDate = new Date(availabilityData.date);
		scheduledDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
		const scheduledAt = scheduledDate.toISOString();

		try {
			setBooking(true);
			await createSchedule({
				availabilityId: selectedSlot.availabilityId,
				doctorId: selectedDoctor.id,
				scheduledAt: scheduledAt,
			});
			
			push({ 
				message: `Consulta agendada com Dr(a). ${selectedDoctor.name}!`, 
				type: "success" 
			});
			
			// Reset form
			setSelectedSlot(null);
			setNotes("");
			
			// Reload availability to reflect the new booking
			if (selectedDoctor?.id) {
				const data = await listDoctorAvailability(selectedDoctor.id, date);
				setAvailability(data);
			}
		} catch {
			push({ message: "Não foi possível agendar a consulta", type: "error" });
		} finally {
			setBooking(false);
		}
	};

	const formatDateTime = () => {
		if (!selectedSlot || !selectedDoctor) return "";
		
		const availabilityData = availability.find(a => a.id === selectedSlot.availabilityId);
		if (!availabilityData) return "";
		
		try {
			const date = new Date(availabilityData.date);
			const dateStr = date.toLocaleDateString("pt-BR", {
				weekday: "long",
				year: "numeric",
				month: "long",
				day: "numeric",
			});
			
			const [hours, minutes] = selectedSlot.time.split(":");
			const timeStr = `${hours}:${minutes}`;
			
			return `${dateStr} às ${timeStr}`;
		} catch {
			return `${availabilityData.date} às ${selectedSlot.time}`;
		}
	};

	return (
		<div className="p-6 space-y-6">
			<div className="flex items-center gap-2">
				<CalendarDays className="size-6" />
				<h1 className="text-2xl font-bold">Agendar Consulta</h1>
			</div>
			
			<div className="grid lg:grid-cols-2 gap-6">
				{/* Left Column - Doctor Selection */}
				<div className="space-y-6">
					<DoctorList
						onSelectDoctor={handleDoctorSelect}
						selectedDoctorId={selectedDoctor?.id}
					/>
					
					{/* Date Filter */}
					{selectedDoctor && (
						<Card>
							<CardHeader>
								<CardTitle className="text-lg">Filtrar por Data</CardTitle>
							</CardHeader>
							<CardContent>
								<div className="space-y-2">
									<Label htmlFor="date-filter">
										Data (opcional - deixe em branco para ver todas)
									</Label>
									<Input
										id="date-filter"
										type="date"
										value={date}
										onChange={(e) => setDate(e.target.value)}
										className="w-full"
										min={new Date().toISOString().split('T')[0]}
									/>
								</div>
							</CardContent>
						</Card>
					)}
				</div>

				{/* Right Column - Availability and Booking */}
				<div className="space-y-6">
					{selectedDoctor ? (
						<>
							<AvailabilityCalendar
								availability={availability}
								selectedSlot={selectedSlot}
								onSelectSlot={handleSlotSelect}
								loading={loading}
								doctorName={selectedDoctor.name}
							/>
							
							{/* Booking Confirmation */}
							{selectedSlot && (
								<Card>
									<CardHeader>
										<CardTitle className="flex items-center gap-2">
											<UserCheck className="size-5" />
											Confirmar Agendamento
										</CardTitle>
									</CardHeader>
									<CardContent>
										<form onSubmit={handleSubmit} className="space-y-4">
											<div className="p-4 bg-muted rounded-lg">
												<h3 className="font-medium mb-2">Detalhes do Agendamento:</h3>
												<p className="text-sm">
													<strong>Médico:</strong> Dr(a). {selectedDoctor.name}
												</p>
												<p className="text-sm">
													<strong>Data e Horário:</strong> {formatDateTime()}
												</p>
											</div>
											
											<div className="space-y-2">
												<Label htmlFor="notes" className="flex items-center gap-2">
													<FileText className="size-4" />
													Observações (opcional)
												</Label>
												<Input
													id="notes"
													value={notes}
													onChange={(e) => setNotes(e.target.value)}
													placeholder="Ex: trazer exames anteriores, sintomas específicos..."
													maxLength={500}
												/>
												<p className="text-xs text-muted-foreground">
													{notes.length}/500 caracteres
												</p>
											</div>
											
											<Button 
												type="submit" 
												disabled={booking} 
												className="w-full"
												size="lg"
											>
												{booking ? "Agendando..." : "Confirmar Agendamento"}
											</Button>
										</form>
									</CardContent>
								</Card>
							)}
						</>
					) : (
						<Card>
							<CardContent className="pt-6">
								<div className="text-center py-8">
									<CalendarDays className="size-12 mx-auto text-muted-foreground mb-4" />
									<h3 className="font-medium mb-2">Selecione um médico</h3>
									<p className="text-sm text-muted-foreground">
										Escolha um médico da lista ao lado para visualizar os horários disponíveis
									</p>
								</div>
							</CardContent>
						</Card>
					)}
				</div>
			</div>
		</div>
	);
}
