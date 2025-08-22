"use client";
import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, CheckCircle } from "lucide-react";
import { getAvailableSlots, type AvailableSlot } from "@/services/availability.service";

type ConflictCheckerProps = {
	selectedSlot: AvailableSlot | null;
	doctorId?: string;
};

export function ConflictChecker({ selectedSlot, doctorId }: ConflictCheckerProps) {
	const [checking, setChecking] = useState(false);
	const [hasConflict, setHasConflict] = useState(false);
	const [conflictMessage, setConflictMessage] = useState("");

	useEffect(() => {
		if (!selectedSlot || !doctorId) {
			setHasConflict(false);
			setConflictMessage("");
			return;
		}

		const checkConflicts = async () => {
			setChecking(true);
			try {
				// Verificar se o slot ainda está disponível
				const slots = await getAvailableSlots({
					doctorId,
					date: selectedSlot.availableDate,
				});

				const slotStillAvailable = slots.some(
					slot => 
						slot.availabilityId === selectedSlot.availabilityId &&
						slot.availableDate === selectedSlot.availableDate
				);

				if (!slotStillAvailable) {
					setHasConflict(true);
					setConflictMessage("Este horário não está mais disponível. Por favor, selecione outro horário.");
				} else {
					setHasConflict(false);
					setConflictMessage("Horário disponível para agendamento.");
				}
			} catch (error) {
				console.error("Erro ao verificar conflitos:", error);
				setHasConflict(true);
				setConflictMessage("Não foi possível verificar a disponibilidade do horário.");
			} finally {
				setChecking(false);
			}
		};

		// Verificar conflitos após um pequeno delay para evitar muitas requisições
		const timeoutId = setTimeout(checkConflicts, 1000);
		return () => clearTimeout(timeoutId);
	}, [selectedSlot, doctorId]);

	if (!selectedSlot) {
		return null;
	}

	if (checking) {
		return (
			<Alert>
				<AlertTriangle className="size-4" />
				<AlertDescription>
					Verificando disponibilidade do horário...
				</AlertDescription>
			</Alert>
		);
	}

	if (hasConflict) {
		return (
			<Alert variant="destructive">
				<AlertTriangle className="size-4" />
				<AlertDescription>
					{conflictMessage}
				</AlertDescription>
			</Alert>
		);
	}

	return (
		<Alert className="border-green-200 bg-green-50">
			<CheckCircle className="size-4 text-green-600" />
			<AlertDescription className="text-green-700">
				{conflictMessage}
			</AlertDescription>
		</Alert>
	);
}
