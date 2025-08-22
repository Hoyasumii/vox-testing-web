"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { DashboardHeader } from "@/components/dashboard-header";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { RealTimeNotifications } from "@/components/real-time-notifications";

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const { loading, token } = useAuth();
	const router = useRouter();

	useEffect(() => {
		if (loading) return;
		// Evita bounce: se o token ainda não chegou no contexto, mas já existe no localStorage,
		// aguardamos a hidratação ao invés de redirecionar para "/".
		const stored =
			typeof window !== "undefined"
				? window.localStorage.getItem("access-token")
				: null;
		if (!token && !stored) {
			router.replace("/");
		}
	}, [loading, token, router]);

	// Mostra spinner apenas enquanto o AuthContext está carregando a sessão
	if (loading) {
		return (
			<div className="flex flex-col min-h-svh items-center justify-center gap-4">
				<LoadingSpinner />
				<p className="text-sm text-muted-foreground">Carregando sessão...</p>
			</div>
		);
	}

	return (
		<div className="flex flex-col min-h-svh">
			<DashboardHeader />
			<main className="flex-1 container mx-auto w-full max-w-5xl">
				{children}
			</main>
			<RealTimeNotifications />
		</div>
	);
}
