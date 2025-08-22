"use client";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stethoscope, User } from "lucide-react";
import { listDoctors, type Doctor } from "@/services/user.service";
import { Button } from "@/components/ui/button";

type DoctorListProps = {
	onSelectDoctor: (doctorId: string, doctorName: string) => void;
	selectedDoctorId?: string;
};

export function DoctorList({
	onSelectDoctor,
	selectedDoctorId,
}: DoctorListProps) {
	const [doctors, setDoctors] = useState<Doctor[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const loadDoctors = async () => {
			try {
				setLoading(true);
				setError(null);
				const doctorList = await listDoctors();
				setDoctors(doctorList);
			} catch (err) {
				setError("Erro ao carregar lista de médicos");
				console.error("Erro ao carregar médicos:", err);
			} finally {
				setLoading(false);
			}
		};

		loadDoctors();
	}, []);

	if (loading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Stethoscope className="size-5" />
						Médicos Disponíveis
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-3">
						{[1, 2, 3].map((i) => (
							<div key={i} className="animate-pulse">
								<div className="h-16 bg-muted rounded-lg"></div>
							</div>
						))}
					</div>
				</CardContent>
			</Card>
		);
	}

	if (error) {
		return (
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Stethoscope className="size-5" />
						Médicos Disponíveis
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-center py-4">
						<p className="text-sm text-muted-foreground mb-3">{error}</p>
						<Button 
							variant="outline" 
							size="sm" 
							onClick={() => window.location.reload()}
						>
							Tentar Novamente
						</Button>
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card>
			<CardHeader>
				<CardTitle className="flex items-center gap-2">
					<Stethoscope className="size-5" />
					Médicos Disponíveis
				</CardTitle>
			</CardHeader>
			<CardContent>
				{doctors.length === 0 ? (
					<div className="text-center py-8">
						<User className="size-12 mx-auto text-muted-foreground mb-4" />
						<h3 className="font-medium mb-2">Nenhum médico encontrado</h3>
						<p className="text-sm text-muted-foreground">
							Não há médicos disponíveis no momento.
						</p>
					</div>
				) : (
					<div className="space-y-3">
						{doctors.map((doctor) => (
							<button
								key={doctor.id}
								type="button"
								className={`w-full p-3 border rounded-lg transition-colors hover:bg-muted/50 text-left ${
									selectedDoctorId === doctor.id
										? "border-primary bg-primary/10"
										: "border-border"
								}`}
								onClick={() => onSelectDoctor(doctor.id, doctor.name)}
							>
								<div className="flex items-center justify-between">
									<div>
										<h3 className="font-medium">{doctor.name}</h3>
										<p className="text-sm text-muted-foreground">
											{doctor.email}
										</p>
									</div>
									<div className="flex items-center gap-2 text-xs text-muted-foreground">
										<Stethoscope className="size-3" />
										<span>Médico</span>
									</div>
								</div>
							</button>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
