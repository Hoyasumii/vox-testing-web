"use client";
import { useEffect, useState } from "react";
import { useSchedulesPolling } from "@/hooks/usePolling";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { Bell, Calendar, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type ScheduleNotification = {
	id: string;
	type: "new" | "cancelled" | "updated";
	title: string;
	message: string;
	timestamp: Date;
	scheduleId?: string;
};

export function RealTimeNotifications() {
	const { user } = useAuth();
	const { push } = useToast();
	const [notifications, setNotifications] = useState<ScheduleNotification[]>([]);
	const [previousSchedulesCount, setPreviousSchedulesCount] = useState<number | null>(null);
	const [showNotifications, setShowNotifications] = useState(false);

	// Polling para detectar mudanças nos agendamentos
	const { data: schedules, error } = useSchedulesPolling();

	useEffect(() => {
		if (!schedules || !user) return;

		const currentCount = schedules.length;

		// Se é a primeira vez carregando, apenas salva a contagem
		if (previousSchedulesCount === null) {
			setPreviousSchedulesCount(currentCount);
			return;
		}

		// Detecta mudanças
		if (currentCount > previousSchedulesCount) {
			const newNotification: ScheduleNotification = {
				id: Date.now().toString(),
				type: "new",
				title: "Nova consulta agendada",
				message: `${user.type === "DOCTOR" ? "Um paciente agendou" : "Você agendou"} uma nova consulta.`,
				timestamp: new Date(),
			};

			setNotifications(prev => [newNotification, ...prev.slice(0, 4)]); // Manter apenas 5 notificações
			
			push({
				type: "success",
				message: newNotification.message,
			});
		} else if (currentCount < previousSchedulesCount) {
			const cancelNotification: ScheduleNotification = {
				id: Date.now().toString(),
				type: "cancelled",
				title: "Consulta cancelada",
				message: "Uma consulta foi cancelada.",
				timestamp: new Date(),
			};

			setNotifications(prev => [cancelNotification, ...prev.slice(0, 4)]);
			
			push({
				type: "error",
				message: cancelNotification.message,
			});
		}

		setPreviousSchedulesCount(currentCount);
	}, [schedules, previousSchedulesCount, push, user]);

	// Notificar sobre erros de conexão
	useEffect(() => {
		if (error) {
			push({
				type: "error",
				message: "Problema na conexão. As informações podem estar desatualizadas.",
			});
		}
	}, [error, push]);

	const clearNotifications = () => {
		setNotifications([]);
	};

	const removeNotification = (id: string) => {
		setNotifications(prev => prev.filter(n => n.id !== id));
	};

	const formatTime = (date: Date) => {
		return date.toLocaleTimeString("pt-BR", {
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const getNotificationIcon = (type: ScheduleNotification["type"]) => {
		switch (type) {
			case "new":
				return <Calendar className="size-4 text-green-600" />;
			case "cancelled":
				return <X className="size-4 text-red-600" />;
			default:
				return <Bell className="size-4 text-blue-600" />;
		}
	};

	const getNotificationBadge = (type: ScheduleNotification["type"]) => {
		switch (type) {
			case "new":
				return <Badge variant="default">Nova</Badge>;
			case "cancelled":
				return <Badge variant="destructive">Cancelada</Badge>;
			default:
				return <Badge variant="secondary">Atualizada</Badge>;
		}
	};

	if (!user || notifications.length === 0) {
		return null;
	}

	return (
		<div className="fixed top-4 right-4 z-50 max-w-sm">
			{!showNotifications && notifications.length > 0 && (
				<Button
					onClick={() => setShowNotifications(true)}
					size="sm"
					className="mb-2 shadow-lg"
				>
					<Bell className="size-4 mr-2" />
					{notifications.length} nova{notifications.length > 1 ? "s" : ""} notificaç{notifications.length > 1 ? "ões" : "ão"}
				</Button>
			)}

			{showNotifications && (
				<Card className="shadow-xl max-h-96 overflow-y-auto">
					<CardHeader className="pb-3">
						<div className="flex items-center justify-between">
							<CardTitle className="text-sm">
								Notificações ({notifications.length})
							</CardTitle>
							<div className="flex gap-1">
								<Button
									onClick={clearNotifications}
									size="sm"
									variant="ghost"
									className="h-6 px-2 text-xs"
								>
									Limpar
								</Button>
								<Button
									onClick={() => setShowNotifications(false)}
									size="sm"
									variant="ghost"
									className="h-6 w-6 p-0"
								>
									<X className="size-3" />
								</Button>
							</div>
						</div>
					</CardHeader>
					<CardContent className="space-y-3 pt-0">
						{notifications.map((notification) => (
							<div
								key={notification.id}
								className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg"
							>
								{getNotificationIcon(notification.type)}
								<div className="flex-1 min-w-0">
									<div className="flex items-center justify-between mb-1">
										<p className="text-sm font-medium truncate">
											{notification.title}
										</p>
										{getNotificationBadge(notification.type)}
									</div>
									<p className="text-xs text-muted-foreground mb-1">
										{notification.message}
									</p>
									<p className="text-xs text-muted-foreground">
										{formatTime(notification.timestamp)}
									</p>
								</div>
								<Button
									onClick={() => removeNotification(notification.id)}
									size="sm"
									variant="ghost"
									className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
								>
									<X className="size-3" />
								</Button>
							</div>
						))}
					</CardContent>
				</Card>
			)}
		</div>
	);
}
