"use client";
import { useEffect, useState } from "react";
import {
	listMySchedules,
	cancelSchedule,
	completeSchedule,
} from "@/services/schedule.service";
import type { ScheduleResponseDTO } from "@/dtos/schedules/schedule-response.dto";
import { useToast } from "@/contexts/ToastContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Calendar,
	Clock,
	User,
	FileText,
	CheckCircle,
	XCircle,
	CalendarX,
	Stethoscope,
} from "lucide-react";

type ScheduleUI = {
	id: string;
	date: string;
	slotTime: string;
	doctorId: string;
	doctorName?: string;
	patientId?: string;
	patientName?: string;
	notes?: string | null;
	status?: "SCHEDULED" | "CANCELLED" | "COMPLETED";
};

export default function SchedulesPage() {
	const [schedules, setSchedules] = useState<ScheduleUI[]>([]);
	const [loading, setLoading] = useState(false);
	const { push } = useToast();
	const { user } = useAuth();

	useEffect(() => {
		const loadSchedules = async () => {
			setLoading(true);
			try {
				const data = await listMySchedules();
				setSchedules(
					(data as ScheduleResponseDTO[]).map((d) => ({
						id: d.id,
						date: d.date,
						slotTime: d.slotTime,
						doctorId: d.doctorId,
						doctorName: undefined, // Will be fetched separately if needed
						patientId: d.patientId,
						patientName: undefined, // Will be fetched separately if needed
						notes: d.notes,
						status: "SCHEDULED", // Default status since not in DTO
					})),
				);
			} catch {
				push({ message: "Falha ao carregar consultas", type: "error" });
			} finally {
				setLoading(false);
			}
		};

		loadSchedules();
	}, [push]);

	const handleCancel = async (scheduleId: string) => {
		if (!confirm("Tem certeza que deseja cancelar esta consulta?")) {
			return;
		}

		try {
			await cancelSchedule(scheduleId);
			setSchedules((prev) =>
				prev.map((s) =>
					s.id === scheduleId ? { ...s, status: "CANCELLED" } : s,
				),
			);
			push({ message: "Consulta cancelada com sucesso", type: "success" });
		} catch {
			push({ message: "Falha ao cancelar consulta", type: "error" });
		}
	};

	const handleComplete = async (scheduleId: string) => {
		if (!confirm("Confirmar que esta consulta foi realizada?")) {
			return;
		}

		try {
			await completeSchedule(scheduleId);
			setSchedules((prev) =>
				prev.map((s) =>
					s.id === scheduleId ? { ...s, status: "COMPLETED" } : s,
				),
			);
			push({ message: "Consulta marcada como concluída", type: "success" });
		} catch {
			push({ message: "Falha ao concluir consulta", type: "error" });
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

	const formatTime = (timeString: string) => {
		try {
			const [hours, minutes] = timeString.split(":");
			return `${hours}:${minutes}`;
		} catch {
			return timeString;
		}
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "SCHEDULED":
				return <Badge variant="default">Agendada</Badge>;
			case "COMPLETED":
				return <Badge variant="secondary">Concluída</Badge>;
			case "CANCELLED":
				return <Badge variant="destructive">Cancelada</Badge>;
			default:
				return <Badge variant="outline">Agendada</Badge>;
		}
	};

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "SCHEDULED":
				return <Calendar className="size-4 text-blue-600" />;
			case "COMPLETED":
				return <CheckCircle className="size-4 text-green-600" />;
			case "CANCELLED":
				return <XCircle className="size-4 text-red-600" />;
			default:
				return <Calendar className="size-4 text-blue-600" />;
		}
	};

	const filterSchedulesByStatus = (status: string) => {
		if (status === "all") return schedules;
		return schedules.filter((s) => (s.status || "SCHEDULED") === status);
	};

	const upcomingSchedules = filterSchedulesByStatus("SCHEDULED");
	const completedSchedules = filterSchedulesByStatus("COMPLETED");
	const cancelledSchedules = filterSchedulesByStatus("CANCELLED");

	const renderScheduleCard = (schedule: ScheduleUI) => (
		<Card key={schedule.id} className="mb-4">
			<CardContent className="pt-4">
				<div className="flex items-start justify-between mb-3">
					<div className="flex items-center gap-2">
						{getStatusIcon(schedule.status || "SCHEDULED")}
						<div>
							<h3 className="font-medium">{formatDate(schedule.date)}</h3>
							<div className="flex items-center gap-2 text-sm text-muted-foreground">
								<Clock className="size-3" />
								{formatTime(schedule.slotTime)}
							</div>
						</div>
					</div>
					{getStatusBadge(schedule.status || "SCHEDULED")}
				</div>

				<div className="space-y-2 mb-4">
					{user?.type === "PATIENT" && schedule.doctorName && (
						<div className="flex items-center gap-2 text-sm">
							<Stethoscope className="size-4" />
							<span>Dr(a). {schedule.doctorName}</span>
						</div>
					)}

					{user?.type === "DOCTOR" && schedule.patientName && (
						<div className="flex items-center gap-2 text-sm">
							<User className="size-4" />
							<span>{schedule.patientName}</span>
						</div>
					)}

					{schedule.notes && (
						<div className="flex items-start gap-2 text-sm">
							<FileText className="size-4 mt-0.5" />
							<span className="text-muted-foreground">{schedule.notes}</span>
						</div>
					)}
				</div>

				{schedule.status === "SCHEDULED" && (
					<div className="flex gap-2">
						<Button
							size="sm"
							variant="outline"
							onClick={() => handleCancel(schedule.id)}
							disabled={loading}
						>
							<CalendarX className="size-4 mr-1" />
							Cancelar
						</Button>

						{user?.type === "DOCTOR" && (
							<Button
								size="sm"
								variant="default"
								onClick={() => handleComplete(schedule.id)}
								disabled={loading}
							>
								<CheckCircle className="size-4 mr-1" />
								Concluir
							</Button>
						)}
					</div>
				)}
			</CardContent>
		</Card>
	);

	if (loading) {
		return (
			<div className="p-6 space-y-6">
				<div className="flex items-center gap-2">
					<Calendar className="size-6" />
					<h1 className="text-2xl font-bold">Minhas Consultas</h1>
					<span className="animate-pulse text-sm text-muted-foreground">
						carregando...
					</span>
				</div>
				<div className="space-y-4">
					{[1, 2, 3].map((i) => (
						<Card key={i}>
							<CardContent className="pt-4">
								<div className="animate-pulse space-y-3">
									<div className="h-4 bg-muted rounded w-1/3"></div>
									<div className="h-3 bg-muted rounded w-1/4"></div>
									<div className="h-3 bg-muted rounded w-1/2"></div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>
		);
	}

	return (
		<div className="p-6 space-y-6">
			<div className="flex items-center gap-2">
				<Calendar className="size-6" />
				<h1 className="text-2xl font-bold">Minhas Consultas</h1>
			</div>

			<Tabs defaultValue="upcoming" className="space-y-4">
				<TabsList className="grid w-full grid-cols-3">
					<TabsTrigger value="upcoming">
						Agendadas ({upcomingSchedules.length})
					</TabsTrigger>
					<TabsTrigger value="completed">
						Concluídas ({completedSchedules.length})
					</TabsTrigger>
					<TabsTrigger value="cancelled">
						Canceladas ({cancelledSchedules.length})
					</TabsTrigger>
				</TabsList>

				<TabsContent value="upcoming" className="space-y-4">
					{upcomingSchedules.length === 0 ? (
						<Card>
							<CardContent className="pt-6">
								<div className="text-center py-8">
									<Calendar className="size-12 mx-auto text-muted-foreground mb-4" />
									<h3 className="font-medium mb-2">
										Nenhuma consulta agendada
									</h3>
									<p className="text-sm text-muted-foreground">
										Suas próximas consultas aparecerão aqui.
									</p>
								</div>
							</CardContent>
						</Card>
					) : (
						<div>{upcomingSchedules.map(renderScheduleCard)}</div>
					)}
				</TabsContent>

				<TabsContent value="completed" className="space-y-4">
					{completedSchedules.length === 0 ? (
						<Card>
							<CardContent className="pt-6">
								<div className="text-center py-8">
									<CheckCircle className="size-12 mx-auto text-muted-foreground mb-4" />
									<h3 className="font-medium mb-2">
										Nenhuma consulta concluída
									</h3>
									<p className="text-sm text-muted-foreground">
										Consultas concluídas aparecerão aqui.
									</p>
								</div>
							</CardContent>
						</Card>
					) : (
						<div>{completedSchedules.map(renderScheduleCard)}</div>
					)}
				</TabsContent>

				<TabsContent value="cancelled" className="space-y-4">
					{cancelledSchedules.length === 0 ? (
						<Card>
							<CardContent className="pt-6">
								<div className="text-center py-8">
									<CalendarX className="size-12 mx-auto text-muted-foreground mb-4" />
									<h3 className="font-medium mb-2">
										Nenhuma consulta cancelada
									</h3>
									<p className="text-sm text-muted-foreground">
										Consultas canceladas aparecerão aqui.
									</p>
								</div>
							</CardContent>
						</Card>
					) : (
						<div>{cancelledSchedules.map(renderScheduleCard)}</div>
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}
