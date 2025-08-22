import axios from "@/utils/axios";
import type { CreateDoctorAvailabilityDTO } from "@/dtos/availability/create-doctor-availability.dto";
import type { DoctorAvailabilityResponseDTO } from "@/dtos/availability/doctor-availability-response.dto";

// Types for available slots
export type AvailableSlot = {
	availabilityId: string;
	availableDate: string;
	startTime: string;
	endTime: string;
	doctorId: string;
	doctorName: string;
};

// Service object for easier importing
export const availabilityService = {
	async createAvailability(dto: CreateDoctorAvailabilityDTO) {
		console.log("🚀 Criando disponibilidade");
		console.log("📍 URL:", `/availability`);
		console.log("📦 Dados:", dto);
		
		const { data } = await axios.post<{
			success: boolean;
			data: DoctorAvailabilityResponseDTO;
		}>(`/availability`, dto);
		return data.data;
	},

	async listMyAvailability() {
		console.log("📋 Listando minhas disponibilidades");
		const { data } = await axios.get<{
			success: boolean;
			data: DoctorAvailabilityResponseDTO[];
		}>(`/availability`);
		return data.data;
	},

	async updateAvailability(availabilityId: string, partial: Partial<CreateDoctorAvailabilityDTO>) {
		console.log("✏️ Atualizando disponibilidade:", availabilityId);
		console.log("📦 Dados:", partial);
		
		const { data } = await axios.put<{
			success: boolean;
			data: DoctorAvailabilityResponseDTO;
		}>(`/availability/${availabilityId}`, partial);
		return data.data;
	},

	async deleteAvailability(availabilityId: string) {
		console.log("🗑️ Deletando disponibilidade:", availabilityId);
		
		const { data } = await axios.delete<{ 
			success: boolean;
			data: boolean;
		}>(`/availability/${availabilityId}`);
		return data.data;
	}
};

// Export individual functions for backward compatibility
export async function listDoctorAvailability(doctorId: string, date: string) {
	console.log("📋 Listando disponibilidades do médico:", doctorId, "para a data:", date);
	
	const { data } = await axios.get<{
		success: boolean;
		data: DoctorAvailabilityResponseDTO[];
	}>(`/doctors/${doctorId}/availability?date=${date}`);
	return data.data;
}

export async function getAvailableSlots(filters: { doctorId?: string; date?: string; startDate?: string; endDate?: string } = {}) {
	console.log("🔍 Buscando slots disponíveis com filtros:", filters);
	
	const queryParams = new URLSearchParams();
	if (filters.doctorId) queryParams.append('doctorId', filters.doctorId);
	if (filters.date) queryParams.append('date', filters.date);
	if (filters.startDate) queryParams.append('startDate', filters.startDate);
	if (filters.endDate) queryParams.append('endDate', filters.endDate);
	
	const { data } = await axios.get<{
		success: boolean;
		data: AvailableSlot[];
	}>(`/availability/slots?${queryParams.toString()}`);
	return data.data;
}
