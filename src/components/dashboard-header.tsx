"use client";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Stethoscope, LogOut, Sun, Moon } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export function DashboardHeader() {
	const { user, signOut } = useAuth();
	const { theme, toggle } = useTheme();
	return (
		<header className="w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="mx-auto max-w-5xl flex items-center justify-between px-4 py-3 gap-4">
				<Link
					href="/dashboard"
					className="flex items-center gap-2 font-semibold"
				>
					<Stethoscope className="size-5" />
					<span>iDoctor</span>
				</Link>
				<nav className="flex items-center gap-3 text-sm">
					{user?.type === "DOCTOR" && (
						<Link href="/dashboard/availability" className="hover:underline">
							Disponibilidades
						</Link>
					)}
					<Link href="/dashboard/appointments" className="hover:underline">
						Agendar
					</Link>
					<Link href="/dashboard/schedules" className="hover:underline">
						Consultas
					</Link>
				</nav>
				<div className="flex items-center gap-3">
					<Button
						variant="ghost"
						size="icon"
						aria-label="Alternar tema"
						onClick={toggle}
						className="h-8 w-8"
					>
						{theme === "dark" ? (
							<Sun className="size-4" />
						) : (
							<Moon className="size-4" />
						)}
					</Button>
					<span className="text-sm text-muted-foreground hidden sm:inline">
						{user?.name}
					</span>
					<Button
						variant="outline"
						size="sm"
						onClick={signOut}
						className="gap-1"
					>
						<LogOut className="size-4" />
						Sair
					</Button>
				</div>
			</div>
		</header>
	);
}
