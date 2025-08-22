import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import AppointmentsPage from "@/app/dashboard/appointments/page";
import { renderWithProviders, createMockUser } from "./test-utils";

// Mock dos serviços com dados atualizados
vi.mock("@/services/user.service", () => ({
	listDoctors: vi.fn().mockResolvedValue([
		{
			id: "doctor-1",
			name: "Dr. Test",
			email: "doctor@test.com",
			specialty: "Clínico Geral"
		},
	]),
}));

vi.mock("@/services/availability.service", () => ({
	getAvailableSlots: vi.fn().mockResolvedValue([
		{
			availabilityId: "av1",
			doctorId: "doctor-1",
			dayOfWeek: 1,
			startHour: 8,
			endHour: 9,
			availableDate: "2025-08-25T00:00:00Z",
			isAvailable: true,
		},
	]),
}));

vi.mock("@/services/schedule.service", () => ({
	createSchedule: vi.fn().mockResolvedValue({ id: "sc1" }),
}));

describe("AppointmentsPage", () => {
	beforeEach(() => vi.clearAllMocks());

	it("agenda consulta após selecionar médico e slot", async () => {
		// Renderiza como paciente autenticado
		renderWithProviders(<AppointmentsPage />, {
			mockUser: createMockUser('PATIENT')
		});

		// Aguarda carregar a lista de médicos
		await waitFor(() => {
			expect(screen.getByText("Dr. Test")).toBeInTheDocument();
		});

		// Seleciona um médico
		fireEvent.click(screen.getByText("Dr. Test"));

		// Aguarda carregar os slots disponíveis
		await waitFor(() => {
			expect(screen.getByText(/08:00/)).toBeInTheDocument();
		});

		// Seleciona um slot
		const slotButton = screen.getByText(/08:00/).closest("button");
		if (slotButton) {
			fireEvent.click(slotButton);
		}

  // Aguarda aparecer o formulário de confirmação
  await waitFor(() => {
    expect(screen.getByRole("button", { name: "Confirmar Agendamento" })).toBeInTheDocument();
  });

  // Clica no botão de confirmar agendamento
  const confirmButton = screen.getByRole("button", { name: "Confirmar Agendamento" });
  fireEvent.click(confirmButton);		// Verifica se o agendamento foi realizado
		await waitFor(() => {
			expect(screen.getByText(/Consulta agendada/i)).toBeInTheDocument();
		});
	});
});
