"use client";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/contexts/ToastContext";
import { DoctorList } from "@/components/doctor-list";
import { AvailableSlotsSelector } from "@/components/available-slots-selector";
import { ConflictChecker } from "@/components/conflict-checker";
import { CalendarDays, FileText, UserCheck } from "lucide-react";
import { createSchedule, type CreateScheduleRequest } from "@/services/schedule.service";
import type { AvailableSlot } from "@/services/availability.service";

export default function AppointmentsPage() {
	const [selectedDoctor, setSelectedDoctor] = useState<{
		id: string;
		name: string;
	} | null>(null);
	const [selectedSlot, setSelectedSlot] = useState<AvailableSlot | null>(null);
	const [notes, setNotes] = useState("");
	const [booking, setBooking] = useState(false);
	const { push } = useToast();

	const handleDoctorSelect = (doctorId: string, doctorName: string) => {
		setSelectedDoctor({ id: doctorId, name: doctorName });
		setSelectedSlot(null);
	};

	const handleSlotSelect = (slot: AvailableSlot) => {
		setSelectedSlot(slot);
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

		try {
			setBooking(true);
			
			// Criar o agendamento com os dados do slot selecionado
			const scheduleData: CreateScheduleRequest = {
				availabilityId: selectedSlot.availabilityId,
				doctorId: selectedDoctor.id,
				scheduledAt: selectedSlot.availableDate,
			};

			await createSchedule(scheduleData);

			push({
				message: `Consulta agendada com Dr(a). ${selectedDoctor.name}!`,
				type: "success",
			});

			// Reset form
			setSelectedSlot(null);
			setNotes("");
		} catch (error) {
			console.error("Erro ao agendar consulta:", error);
			push({ message: "Não foi possível agendar a consulta. Verifique se o horário ainda está disponível.", type: "error" });
		} finally {
			setBooking(false);
		}
	};

	const formatSlotInfo = () => {
		if (!selectedSlot || !selectedDoctor) return "";

		try {
			const date = new Date(selectedSlot.availableDate);
			const dateStr = date.toLocaleDateString("pt-BR", {
				weekday: "long",
				year: "numeric",
				month: "long",
				day: "numeric",
			});

			const timeStr = `${selectedSlot.startHour.toString().padStart(2, '0')}:00 - ${selectedSlot.endHour.toString().padStart(2, '0')}:00`;

			return `${dateStr}, ${timeStr}`;
		} catch {
			return `${selectedSlot.availableDate}`;
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
				</div>

				{/* Right Column - Slots and Booking */}
				<div className="space-y-6">
					<AvailableSlotsSelector
						selectedDoctorId={selectedDoctor?.id}
						onSelectSlot={handleSlotSelect}
						selectedSlot={selectedSlot}
					/>

					{/* Conflict Checker */}
					{selectedSlot && selectedDoctor && (
						<ConflictChecker
							selectedSlot={selectedSlot}
							doctorId={selectedDoctor.id}
						/>
					)}

					{/* Booking Confirmation */}
					{selectedSlot && selectedDoctor && (
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
										<h3 className="font-medium mb-2">
											Detalhes do Agendamento:
										</h3>
										<p className="text-sm">
											<strong>Médico:</strong> Dr(a). {selectedDoctor.name}
										</p>
										<p className="text-sm">
											<strong>Data e Horário:</strong> {formatSlotInfo()}
										</p>
									</div>

									<div className="space-y-2">
										<Label
											htmlFor="notes"
											className="flex items-center gap-2"
										>
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
				</div>
			</div>
		</div>
	);
}
