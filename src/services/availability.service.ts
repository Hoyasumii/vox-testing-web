import axios from "@/utils/axios";
import type { CreateDoctorAvailabilityDTO } from "@/dtos/availability/create-doctor-availability.dto";
import type { DoctorAvailabilityResponseDTO } from "@/dtos/availability/doctor-availability-response.dto";

// Tipos para os slots disponíveis
export type AvailableSlot = {
	availabilityId: string;
	doctorId: string;
	dayOfWeek: number;
	startHour: number;
	endHour: number;
	availableDate: string;
	isAvailable: boolean;
};

export async function createAvailability(dto: CreateDoctorAvailabilityDTO & { doctorId: string }) {
	const { data } = await axios.post<{
		success: boolean;
		data: boolean;
	}>(`/doctors/${dto.doctorId}/availability`, dto);
	return data.data;
}

export async function listMyAvailability(doctorId: string) {
	const { data } = await axios.get<{
		success: boolean;
		data: DoctorAvailabilityResponseDTO[];
	}>(`/doctors/${doctorId}/availability`);
	return data.data;
}

export async function listDoctorAvailability(doctorId: string, date?: string) {
	const params = date ? { date } : {};
	const { data } = await axios.get<{
		success: boolean;
		data: DoctorAvailabilityResponseDTO[];
	}>(`/doctors/${doctorId}/availability`, { params });
	return data.data;
}

export async function updateAvailability(
	doctorId: string,
	availabilityId: string,
	partial: Partial<Omit<CreateDoctorAvailabilityDTO, 'doctorId'>>,
) {
	const { data } = await axios.put<{
		success: boolean;
		data: boolean;
	}>(`/doctors/${doctorId}/availability/${availabilityId}`, partial);
	return data.data;
}

export async function deleteAvailability(doctorId: string, availabilityId: string) {
	const { data } = await axios.delete<{ 
		success: boolean;
		data: boolean;
	}>(`/doctors/${doctorId}/availability/${availabilityId}`);
	return data.data;
}

export async function deleteAllDoctorAvailability(doctorId: string) {
	const { data } = await axios.delete<{ 
		success: boolean;
		data: number;
	}>(`/doctors/${doctorId}/availability`);
	return data.data;
}

// Nova função para buscar slots disponíveis
export async function getAvailableSlots(filters: {
	doctorId?: string;
	date?: string;
	startDate?: string;
	endDate?: string;
} = {}) {
	const { data } = await axios.get<{
		success: boolean;
		data: AvailableSlot[];
	}>('/availability/slots', { params: filters });
	return data.data;
}
