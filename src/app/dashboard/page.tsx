"use client";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
	CalendarDays,
	Clock,
	Stethoscope,
	User,
	Plus,
	Calendar,
} from "lucide-react";

export default function DashboardHome() {
	const { user } = useAuth();

	const isDoctor = user?.type === "DOCTOR";
	const welcomeText = isDoctor
		? `Bem-vindo(a), Dr(a). ${user?.name}`
		: `Bem-vindo(a), ${user?.name}`;

	return (
		<div className="p-6 space-y-6">
			<div className="flex items-center gap-3">
				<div className="p-2 bg-primary/10 rounded-lg">
					{isDoctor ? (
						<Stethoscope className="size-6 text-primary" />
					) : (
						<User className="size-6 text-primary" />
					)}
				</div>
				<div>
					<h1 className="text-2xl font-bold">Dashboard</h1>
					<p className="text-muted-foreground">{welcomeText}</p>
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{/* Actions for Doctors */}
				{isDoctor && (
					<Card className="hover:shadow-md transition-shadow">
						<CardHeader>
							<CardTitle className="flex items-center gap-2">
								<Clock className="size-5" />
								Minhas Disponibilidades
							</CardTitle>
						</CardHeader>
						<CardContent>
							<p className="text-sm text-muted-foreground mb-4">
								Gerencie seus horários disponíveis para consultas
							</p>
							<Button asChild className="w-full">
								<Link href="/dashboard/availability">
									<Plus className="size-4 mr-2" />
									Gerenciar Horários
								</Link>
							</Button>
						</CardContent>
					</Card>
				)}

				{/* Common Actions */}
				<Card className="hover:shadow-md transition-shadow">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<CalendarDays className="size-5" />
							{isDoctor ? "Consultas Agendadas" : "Agendar Consulta"}
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground mb-4">
							{isDoctor
								? "Visualize pacientes que agendaram consultas com você"
								: "Encontre médicos disponíveis e agende sua consulta"}
						</p>
						<Button asChild className="w-full">
							<Link href="/dashboard/appointments">
								<Calendar className="size-4 mr-2" />
								{isDoctor ? "Ver Agendamentos" : "Agendar Consulta"}
							</Link>
						</Button>
					</CardContent>
				</Card>

				<Card className="hover:shadow-md transition-shadow">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Calendar className="size-5" />
							Minhas Consultas
						</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm text-muted-foreground mb-4">
							{isDoctor
								? "Gerencie suas consultas marcadas"
								: "Visualize e gerencie suas consultas"}
						</p>
						<Button asChild className="w-full" variant="outline">
							<Link href="/dashboard/schedules">Ver Consultas</Link>
						</Button>
					</CardContent>
				</Card>

				{/* Quick Stats Cards */}
				<Card className="hover:shadow-md transition-shadow">
					<CardHeader>
						<CardTitle className="flex items-center gap-2">
							<Stethoscope className="size-5" />
							Status da Conta
						</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="space-y-3">
							<div className="flex justify-between items-center">
								<span className="text-sm">Tipo de usuário:</span>
								<span className="text-sm font-medium">
									{isDoctor ? "Médico" : "Paciente"}
								</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-sm">Email:</span>
								<span className="text-sm font-medium text-muted-foreground">
									{user?.email}
								</span>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Quick Actions Section */}
			<Card>
				<CardHeader>
					<CardTitle>Ações Rápidas</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="flex flex-wrap gap-2">
						{isDoctor && (
							<Button asChild size="sm" variant="outline">
								<Link href="/dashboard/availability">
									<Plus className="size-4 mr-1" />
									Nova Disponibilidade
								</Link>
							</Button>
						)}
						<Button asChild size="sm" variant="outline">
							<Link href="/dashboard/appointments">
								<CalendarDays className="size-4 mr-1" />
								{isDoctor ? "Ver Agendamentos" : "Nova Consulta"}
							</Link>
						</Button>
						<Button asChild size="sm" variant="outline">
							<Link href="/dashboard/schedules">
								<Calendar className="size-4 mr-1" />
								Minhas Consultas
							</Link>
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
