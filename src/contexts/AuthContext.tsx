"use client";

import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from "react";
import axios from "@/utils/axios";
import type { AuthenticateUserDTO } from "@/dtos/users/authenticate-user.dto";
import type { UserResponseDTO } from "@/dtos/users/user-response.dto";
import { useToast } from "./ToastContext";

const isDev = process.env.NODE_ENV !== "production";
const logDev = (...args: unknown[]) => {
	if (isDev) {
		// eslint-disable-next-line no-console
		console.log("[Auth]", ...args);
	}
};

type AuthContextType = {
	user: UserResponseDTO | null;
	token: string | null;
	loading: boolean;
	signIn: (payload: AuthenticateUserDTO) => Promise<void>;
	signOut: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export { AuthContext };

export function AuthProvider({ children }: { children: React.ReactNode }) {
	const [user, setUser] = useState<UserResponseDTO | null>(null);
	const [token, setToken] = useState<string | null>(null);
	const [loading, setLoading] = useState(true);
	const { push } = useToast();
	const signingInRef = useRef(false);

	useEffect(() => {
		const stored = localStorage.getItem("access-token");
		if (stored) {
			logDev("Token encontrado no localStorage (len)", stored.length);
			setToken(stored);
			axios.defaults.headers.common.Authorization = `Bearer ${stored}`;
			// Hidrata o usuário salvo para evitar UI vazia até o /users/me
			const rawUser = localStorage.getItem("user");
			if (rawUser) {
				try {
					const parsed = JSON.parse(rawUser) as UserResponseDTO;
					setUser(parsed);
					logDev("Usuário reidratado do localStorage", {
						id: parsed.id,
						type: parsed.type,
					});
				} catch {}
			}
			// Libera a UI imediatamente e busca o perfil em segundo plano
			setLoading(false);
			(async () => {
				try {
					const resp = await axios.get<{
						success: boolean;
						data?: UserResponseDTO;
						error?: string;
					}>("/users/me");
					if (!resp.data?.success || !resp.data?.data) {
						push({
							type: "error",
							message: resp.data?.error || "Sessão inválida",
						});
						throw new Error(resp.data?.error || "Sessão inválida");
					}
					setUser(resp.data.data);
					logDev("/users/me OK", {
						id: resp.data.data.id,
						type: resp.data.data.type,
					});
					try {
						localStorage.setItem("user", JSON.stringify(resp.data.data));
					} catch {}
				} catch (err: unknown) {
					if (err instanceof Error) {
						push({ type: "error", message: err.message });
					}
					logDev("/users/me FAIL", err);
					// token inválido
					localStorage.removeItem("access-token");
					localStorage.removeItem("user");
					setToken(null);
				}
			})();
		} else {
			logDev("Sem token no localStorage");
			setLoading(false);
		}
	}, [push]);

	const signIn = useCallback(
		async (payload: AuthenticateUserDTO) => {
			if (signingInRef.current) {
				logDev("signIn ignorado: já em andamento");
				return;
			}
			signingInRef.current = true;
			logDev("POST /auth", { email: payload.email });
			try {
				const resp = await axios.post<{
					success: boolean;
					data?: string; // A API retorna apenas o token
					error?: string;
				}>("/auth", payload);
				if (!resp.data?.success || !resp.data?.data) {
					logDev("/auth FAIL", resp.data);
					const msg = resp.data?.error || "Falha na autenticação";
					push({ type: "error", message: msg });
					throw new Error(msg);
				}
				const token = resp.data.data;
				logDev("/auth OK", {
					tokenLen: token.length,
				});
				localStorage.setItem("access-token", token);
				axios.defaults.headers.common.Authorization = `Bearer ${token}`;
				setToken(token);
				
				// Buscar dados do usuário após login
				try {
					const userResp = await axios.get<{
						success: boolean;
						data?: UserResponseDTO;
						error?: string;
					}>("/users/me");
					if (userResp.data?.success && userResp.data?.data) {
						setUser(userResp.data.data);
						localStorage.setItem("user", JSON.stringify(userResp.data.data));
						logDev("/users/me OK", {
							id: userResp.data.data.id,
							type: userResp.data.data.type,
						});
					}
				} catch (userErr) {
					logDev("/users/me FAIL após login", userErr);
				}
				
				try {
					localStorage.setItem("user", JSON.stringify(user));
				} catch {}
			} catch (err: unknown) {
				const anyErr = err as {
					response?: { data?: { error?: string; message?: string } };
				};
				const backendMsg =
					anyErr?.response?.data?.error || anyErr?.response?.data?.message;
				if (backendMsg) {
					push({ type: "error", message: backendMsg });
				}
				throw err;
			} finally {
				signingInRef.current = false;
			}
		},
		[push, user],
	);

	const signOut = useCallback(() => {
		logDev("signOut");
		localStorage.removeItem("access-token");
		localStorage.removeItem("user");
		setToken(null);
		setUser(null);
		delete axios.defaults.headers.common.Authorization;
	}, []);

	return (
		<AuthContext.Provider value={{ user, token, loading, signIn, signOut }}>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const ctx = useContext(AuthContext);
	if (!ctx) throw new Error("useAuth deve ser usado dentro de AuthProvider");
	return ctx;
}
