import { twMerge } from "tailwind-merge";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

type Props = {
	children: React.ReactNode;
};

export default function Layout({ children }: Props) {
	return (
		<html lang="en">
			<body className={twMerge(GeistSans.className, "antialiased")}>
				{children}
			</body>
		</html>
	);
}
