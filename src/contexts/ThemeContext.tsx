"use client";
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from "react";

type Theme = "light" | "dark";
interface ThemeCtx {
	theme: Theme;
	toggle: () => void;
	setTheme: (t: Theme) => void;
}

const ThemeContext = createContext<ThemeCtx | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
	const [theme, setThemeState] = useState<Theme>("light");

	useEffect(() => {
		const stored = localStorage.getItem("theme");
		if (stored === "dark" || stored === "light") {
			setThemeState(stored);
			document.documentElement.dataset.theme = stored;
		} else {
			const prefersDark = window.matchMedia(
				"(prefers-color-scheme: dark)",
			).matches;
			const initial = prefersDark ? "dark" : "light";
			setThemeState(initial);
			document.documentElement.dataset.theme = initial;
		}
	}, []);

	const setTheme = useCallback((t: Theme) => {
		setThemeState(t);
		document.documentElement.dataset.theme = t;
		localStorage.setItem("theme", t);
	}, []);

	const toggle = useCallback(() => {
		setTheme(theme === "light" ? "dark" : "light");
	}, [theme, setTheme]);

	return (
		<ThemeContext.Provider value={{ theme, toggle, setTheme }}>
			{children}
		</ThemeContext.Provider>
	);
}

export function useTheme() {
	const ctx = useContext(ThemeContext);
	if (!ctx) throw new Error("useTheme deve ser usado dentro de ThemeProvider");
	return ctx;
}
