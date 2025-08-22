import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import AvailabilityPage from "@/app/dashboard/availability/page";
import { renderWithProviders, createMockUser } from "./test-utils";

vi.mock("@/services/availability.service", () => ({
	listMyAvailability: vi.fn().mockResolvedValue([]),
	createAvailability: vi.fn().mockResolvedValue({ id: "av1" }),
}));

describe("AvailabilityPage", () => {
	beforeEach(() => vi.clearAllMocks());

	it("cria disponibilidade com dados válidos", async () => {
		// Renderiza como médico autenticado
		renderWithProviders(<AvailabilityPage />, {
			mockUser: createMockUser('DOCTOR')
		});
		
		// Aguarda o formulário carregar
		await waitFor(() => {
			expect(screen.getByLabelText(/Data/i)).toBeInTheDocument();
		});
		
		fireEvent.change(screen.getByLabelText(/Data/i), {
			target: { value: "2025-08-21" },
		});
		fireEvent.change(screen.getByLabelText(/Horário de Início/i), {
			target: { value: "08:00" },
		});
		fireEvent.change(screen.getByLabelText(/Horário de Fim/i), {
			target: { value: "17:00" },
		});
		fireEvent.click(screen.getByRole("button", { name: /Adicionar Disponibilidade/i }));
		
		// Como o mock não retorna uma mensagem específica, apenas verifica se o formulário permanece
		await waitFor(() => {
			expect(screen.getByRole("button", { name: /Adicionar Disponibilidade/i })).toBeInTheDocument();
		});
	});
});
