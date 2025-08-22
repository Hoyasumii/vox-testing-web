import "./globals.css";
import { twMerge } from "tailwind-merge";
import { GeistSans } from "geist/font/sans";
import { AuthProvider } from "@/contexts/AuthContext";
import { ToastProvider } from "@/contexts/ToastContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

type Props = {
	children: React.ReactNode;
};

export default function Layout({ children }: Props) {
	return (
		<html lang="en">
			<body
				className={twMerge(
					GeistSans.className,
					"antialiased min-h-svh flex flex-col bg-background text-foreground transition-colors",
				)}
			>
				<ToastProvider>
					<AuthProvider>
						<ThemeProvider>{children}</ThemeProvider>
					</AuthProvider>
				</ToastProvider>
			</body>
		</html>
	);
}
