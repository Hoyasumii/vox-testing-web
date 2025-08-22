import { describe, it, expect, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import React from "react";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { render } from "@testing-library/react";
import { ToastProvider } from "@/contexts/ToastContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

vi.mock("@/utils/axios", () => {
	return {
		default: {
			post: vi.fn().mockResolvedValue({
				data: {
					success: true,
					data: {
						token: "jwt-test-token",
						user: {
							id: "1",
							name: "John",
							email: "j@e.com",
							type: "PATIENT",
						},
					},
				},
			}),
			get: vi.fn().mockResolvedValue({
				data: {
					success: true,
					data: {
						id: "1",
						name: "John",
						email: "j@e.com",
						type: "PATIENT",
					},
				},
			}),
			defaults: { headers: { common: {} } },
		},
	};
});

function TestConsumer() {
	const { signIn, user, token } = useAuth();
	
	React.useEffect(() => {
		signIn({ email: "j@e.com", password: "x" });
	}, [signIn]);
	
	return <div>{token && user ? user.name : "loading"}</div>;
}

describe("AuthContext", () => {
	it("signIn populates user/token", async () => {
		render(
			<ThemeProvider>
				<ToastProvider>
					<AuthProvider>
						<TestConsumer />
					</AuthProvider>
				</ToastProvider>
			</ThemeProvider>
		);
		
		await waitFor(() => {
			const el = screen.getByText("John");
			expect(el).toBeInTheDocument();
		}, { timeout: 3000 });
	});
});
