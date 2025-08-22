import { describe, it, expect, vi, beforeEach } from "vitest";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithProviders } from "./test-utils";
import { AvailableSlotsSelector } from "@/components/available-slots-selector";

// Mock dos serviços - devem ser criados antes de qualquer import que os usa
vi.mock("@/services/availability.service", () => ({
	getAvailableSlots: vi.fn(),
}));

// Import do mock após sua criação
import { getAvailableSlots } from "@/services/availability.service";

const mockSlots = [
	{
		availabilityId: "av1",
		doctorId: "doctor1",
		dayOfWeek: 1,
		startHour: 9,
		endHour: 17,
		availableDate: "2025-08-25T00:00:00Z",
		isAvailable: true,
	},
	{
		availabilityId: "av2", 
		doctorId: "doctor1",
		dayOfWeek: 2,
		startHour: 14,
		endHour: 18,
		availableDate: "2025-08-26T00:00:00Z",
		isAvailable: true,
	},
];

describe("AvailableSlotsSelector", () => {
	const mockOnSelectSlot = vi.fn();

	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(getAvailableSlots).mockResolvedValue(mockSlots);
	});

	it("mostra mensagem quando nenhum médico está selecionado", () => {
		renderWithProviders(
			<AvailableSlotsSelector
				onSelectSlot={mockOnSelectSlot}
				selectedSlot={null}
			/>
		);

		expect(screen.getByText("Selecione um médico")).toBeInTheDocument();
	});

	it("carrega e exibe slots disponíveis quando médico é selecionado", async () => {
		renderWithProviders(
			<AvailableSlotsSelector
				selectedDoctorId="doctor1"
				onSelectSlot={mockOnSelectSlot}
				selectedSlot={null}
			/>
		);

		// Aguarda o carregamento dos slots
		await waitFor(() => {
			expect(screen.getByText(/Horários Disponíveis/)).toBeInTheDocument();
		});

		// Verifica se os slots foram carregados
		await waitFor(() => {
			expect(screen.getByText("09:00 - 17:00")).toBeInTheDocument();
			expect(screen.getByText("14:00 - 18:00")).toBeInTheDocument();
		});
	});

	it("permite filtrar por data", async () => {
		renderWithProviders(
			<AvailableSlotsSelector
				selectedDoctorId="doctor1"
				onSelectSlot={mockOnSelectSlot}
				selectedSlot={null}
			/>
		);

		// Encontra o campo de data
		const dateInput = screen.getByLabelText(/Data específica/);
		fireEvent.change(dateInput, { target: { value: "2025-08-25" } });

		// Aguarda carregar o estado inicial
		await waitFor(() => {
			expect(screen.getByText("09:00 - 17:00")).toBeInTheDocument();
		});

		// Clica no botão de buscar (pode estar como "Buscando..." devido ao loading)
		const searchButton = screen.getByRole("button", { name: /Buscar|Buscando/ });
		fireEvent.click(searchButton);

		// Aguarda a conclusão da busca
		await waitFor(() => {
			expect(getAvailableSlots).toHaveBeenCalledWith(
				expect.objectContaining({
					date: "2025-08-25",
					doctorId: "doctor1"
				})
			);
		});
	});

	it("chama onSelectSlot quando um slot é selecionado", async () => {
		renderWithProviders(
			<AvailableSlotsSelector
				selectedDoctorId="doctor1"
				onSelectSlot={mockOnSelectSlot}
				selectedSlot={null}
			/>
		);

		// Aguarda o carregamento dos slots
		await waitFor(() => {
			expect(screen.getByText("09:00 - 17:00")).toBeInTheDocument();
		});

		// Clica no primeiro slot
		const slotButton = screen.getByText("09:00 - 17:00").closest("button");
		if (slotButton) {
			fireEvent.click(slotButton);
		}

		// Verifica se a função callback foi chamada
		expect(mockOnSelectSlot).toHaveBeenCalledWith({
			availabilityId: "av1",
			doctorId: "doctor1",
			dayOfWeek: 1,
			startHour: 9,
			endHour: 17,
			availableDate: "2025-08-25T00:00:00Z",
			isAvailable: true,
		});
	});

	it("destaca o slot selecionado", async () => {
		const selectedSlot = {
			availabilityId: "av1",
			doctorId: "doctor1",
			dayOfWeek: 1,
			startHour: 9,
			endHour: 17,
			availableDate: "2025-08-25T00:00:00Z",
			isAvailable: true,
		};

		renderWithProviders(
			<AvailableSlotsSelector
				selectedDoctorId="doctor1"
				onSelectSlot={mockOnSelectSlot}
				selectedSlot={selectedSlot}
			/>
		);

		// Aguarda o carregamento
		await waitFor(() => {
			const slotButton = screen.getByText("09:00 - 17:00").closest("button");
			expect(slotButton).toHaveClass("border-primary");
		});
	});
});
