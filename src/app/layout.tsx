import "./globals.css";
import { twMerge } from "tailwind-merge";
import { GeistSans } from "geist/font/sans";

type Props = {
	children: React.ReactNode;
};

export default function Layout({ children }: Props) {
	return (
		<html lang="en">
			<body
				className={twMerge(
					GeistSans.className,
					"antialiased min-h-svh flex flex-col",
				)}
			>
				{children}
			</body>
		</html>
	);
}
