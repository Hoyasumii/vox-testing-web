import axios from "axios";

const instance = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_URL,
});

// Log de ajuda em dev
if (typeof window !== "undefined" && process.env.NODE_ENV !== "production") {
	// eslint-disable-next-line no-console
	console.log("[HTTP] baseURL:", instance.defaults.baseURL);
}

// Por padrão, NÃO redireciona automaticamente em 401.
// Para reativar o redirecionamento, defina NEXT_PUBLIC_DISABLE_401_REDIRECT="false".
const disable401Redirect =
	typeof window !== "undefined"
		? process.env.NEXT_PUBLIC_DISABLE_401_REDIRECT !== "false"
		: true;

// Intercepta respostas 401 para derrubar a sessão no cliente
instance.interceptors.response.use(
	(res) => res,
	(error) => {
		const status = error?.response?.status;
		if (typeof window !== "undefined" && status === 401) {
			try {
				localStorage.removeItem("access-token");
				localStorage.removeItem("user");
			} catch {}
			// Emite toast com a mensagem do backend
			const message =
				error?.response?.data?.error ||
				error?.response?.data?.message ||
				"Sessão expirada, faça login novamente.";
			try {
				window.dispatchEvent(
					new CustomEvent("http-error", { detail: { message } }),
				);
			} catch {}
			// Redireciona apenas se não estiver desabilitado
			if (!disable401Redirect) {
				try {
					if (window.location.pathname !== "/") {
						window.location.replace("/");
					}
				} catch {}
			}
		}
		// Toaster global leve para erros não-401
		if (typeof window !== "undefined" && status && status !== 401) {
			const message =
				error?.response?.data?.error ||
				error?.response?.data?.message ||
				"Erro ao processar sua requisição.";
			// Emite um CustomEvent que o ToastProvider escuta
			try {
				window.dispatchEvent(
					new CustomEvent("http-error", { detail: { message } }),
				);
			} catch {}
		}
		return Promise.reject(error);
	},
);

export default instance;
