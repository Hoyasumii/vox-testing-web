import { useEffect, useState, useCallback } from "react";

type UsePollingProps<T> = {
	fetchData: () => Promise<T>;
	interval?: number; // em millisegundos
	dependencies?: unknown[];
	enabled?: boolean;
};

export function usePolling<T>({
	fetchData,
	interval = 30000, // 30 segundos por padrão
	dependencies = [],
	enabled = true,
}: UsePollingProps<T>) {
	const [data, setData] = useState<T | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	const refresh = useCallback(async () => {
		if (!enabled) return;
		
		try {
			setLoading(true);
			setError(null);
			const result = await fetchData();
			setData(result);
		} catch (err) {
			setError(err instanceof Error ? err : new Error("Erro desconhecido"));
		} finally {
			setLoading(false);
		}
	}, [fetchData, enabled]);

	useEffect(() => {
		if (!enabled) return;

		// Buscar dados imediatamente
		refresh();

		// Configurar polling
		const intervalId = setInterval(refresh, interval);

		return () => clearInterval(intervalId);
	}, [refresh, interval, enabled, ...dependencies]);

	return {
		data,
		loading,
		error,
		refresh,
	};
}

// Hook específico para atualização de disponibilidades
export function useAvailabilityPolling(doctorId?: string, filters: Record<string, unknown> = {}) {
	return usePolling({
		fetchData: async () => {
			if (!doctorId) return [];
			
			// Importação dinâmica para evitar problemas de SSR
			const { getAvailableSlots } = await import("@/services/availability.service");
			return getAvailableSlots({ doctorId, ...filters });
		},
		dependencies: [doctorId, JSON.stringify(filters)],
		enabled: !!doctorId,
		interval: 15000, // 15 segundos para disponibilidades
	});
}

// Hook específico para atualização de agendamentos
export function useSchedulesPolling() {
	return usePolling({
		fetchData: async () => {
			const { listMySchedules } = await import("@/services/schedule.service");
			return listMySchedules();
		},
		interval: 30000, // 30 segundos para agendamentos
	});
}
