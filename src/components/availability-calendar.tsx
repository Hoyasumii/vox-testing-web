"use client";
import { Clock, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type TimeSlot = {
	time: string;
	available: boolean;
};

type DoctorAvailability = {
	id: string;
	date: string;
	slots: TimeSlot[];
};

type AvailabilityCalendarProps = {
	availability: DoctorAvailability[];
	selectedSlot?: {
		availabilityId: string;
		time: string;
	} | null;
	onSelectSlot: (availabilityId: string, time: string) => void;
	loading?: boolean;
	doctorName?: string;
};

export function AvailabilityCalendar({
	availability,
	selectedSlot,
	onSelectSlot,
	loading = false,
	doctorName,
}: AvailabilityCalendarProps) {
	if (loading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Calendar className="size-5" />
						Horários Disponíveis
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						{[1, 2, 3].map((i) => (
							<div key={i} className="animate-pulse">
								<div className="h-6 bg-muted rounded mb-2"></div>
								<div className="grid grid-cols-4 gap-2">
									{[1, 2, 3, 4].map((j) => (
										<div key={j} className="h-10 bg-muted rounded"></div>
									))}
								</div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		);
	}

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

	const formatTime = (timeString: string) => {
		try {
			const [hours, minutes] = timeString.split(":");
			return `${hours}:${minutes}`;
		} catch {
			return timeString;
		}
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Calendar className="size-5" />
					Horários Disponíveis
					{doctorName && (
						<span className="text-sm font-normal text-muted-foreground">
							• Dr(a). {doctorName}
						</span>
					)}
				</CardTitle>
			</CardHeader>
			<CardContent>
				{availability.length === 0 ? (
					<div className="text-center py-8">
						<Clock className="size-12 mx-auto text-muted-foreground mb-4" />
						<p className="text-muted-foreground">
							Nenhum horário disponível encontrado.
						</p>
						<p className="text-sm text-muted-foreground mt-2">
							Tente selecionar outro médico ou período.
						</p>
					</div>
				) : (
					<div className="space-y-6">
						{availability.map((dayAvailability) => {
							const availableSlots = dayAvailability.slots.filter(
								(slot) => slot.available,
							);

							if (availableSlots.length === 0) {
								return null;
							}

							return (
								<div key={dayAvailability.id} className="space-y-3">
									<div className="flex items-center gap-2 text-sm font-medium">
										<Calendar className="size-4" />
										{formatDate(dayAvailability.date)}
									</div>
									<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
										{availableSlots.map((slot) => {
											const isSelected =
												selectedSlot?.availabilityId === dayAvailability.id &&
												selectedSlot?.time === slot.time;

											return (
												<button
													key={slot.time}
													type="button"
													onClick={() =>
														onSelectSlot(dayAvailability.id, slot.time)
													}
													className={`p-3 rounded-lg border text-sm font-medium transition-all hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary/50 ${
														isSelected
															? "bg-primary text-primary-foreground border-primary shadow-md"
															: "bg-background hover:bg-muted border-border"
													}`}
													aria-pressed={isSelected}
												>
													<div className="flex items-center justify-center gap-1">
														<Clock className="size-3" />
														{formatTime(slot.time)}
													</div>
												</button>
											);
										})}
									</div>
								</div>
							);
						})}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
