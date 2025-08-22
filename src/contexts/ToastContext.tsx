"use client";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";

type Toast = {
	id: string;
	message: string;
	type?: "success" | "error" | "info";
};
type ToastContextType = {
	toasts: Toast[];
	push: (t: Omit<Toast, "id">) => void;
	remove: (id: string) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
	const [toasts, setToasts] = useState<Toast[]>([]);

	const push = useCallback((t: Omit<Toast, "id">) => {
		const toast: Toast = { id: crypto.randomUUID(), ...t };
		setToasts((p) => [...p, toast]);
		setTimeout(() => {
			setToasts((p) => p.filter((x) => x.id !== toast.id));
		}, 5000);
	}, []);

	const remove = useCallback(
		(id: string) => setToasts((p) => p.filter((x) => x.id !== id)),
		[],
	);

	// Listener de erros HTTP globais
	useEffect(() => {
		function onHttpError(e: Event) {
			const detail = (e as CustomEvent).detail as
				| { message?: string }
				| undefined;
			if (detail?.message) {
				push({ message: detail.message, type: "error" });
			}
		}
		window.addEventListener("http-error", onHttpError as EventListener);
		return () =>
			window.removeEventListener("http-error", onHttpError as EventListener);
	}, [push]);

	return (
		<ToastContext.Provider value={{ toasts, push, remove }}>
			{children}
			<div className="fixed bottom-4 right-4 flex flex-col gap-2 z-50">
				{toasts.map((t) => (
					<div
						key={t.id}
						className={`rounded-md px-4 py-2 text-sm shadow-md border bg-background ${t.type === "error" ? "border-red-500" : t.type === "success" ? "border-green-500" : "border-muted"}`}
					>
						{t.message}
					</div>
				))}
			</div>
		</ToastContext.Provider>
	);
}

export function useToast() {
	const ctx = useContext(ToastContext);
	if (!ctx) throw new Error("useToast deve ser usado dentro de ToastProvider");
	return ctx;
}
