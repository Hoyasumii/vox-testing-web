import axios from "@/utils/axios";
import type { ScheduleResponseDTO } from "@/dtos/schedules/schedule-response.dto";

// Tipo atualizado para criação de agendamento
export type CreateScheduleRequest = {
	availabilityId: string;
	doctorId: string;
	scheduledAt: string; // ISO date string
};

export async function createSchedule(dto: CreateScheduleRequest) {
	const { data } = await axios.post<{
		success: boolean;
		data: {
			id: string;
			status: string;
			availabilityId: string;
			patientId: string;
			doctorId: string;
			scheduledAt: string;
		};
	}>("/schedules", dto);
	return data.data;
}

export async function listMySchedules() {
	const { data } = await axios.get<{
		success: boolean;
		data: ScheduleResponseDTO[];
	}>("/schedules/me");
	return data.data;
}

export async function getScheduleById(id: string) {
	const { data } = await axios.get<{
		success: boolean;
		data: {
			id: string;
			status: string;
			availabilityId: string;
			patientId: string;
			doctorId: string;
			scheduledAt: string;
		};
	}>(`/schedules/${id}`);
	return data.data;
}

export async function listDoctorSchedules(doctorId: string) {
	const { data } = await axios.get<{
		success: boolean;
		data: ScheduleResponseDTO[];
	}>(`/doctors/${doctorId}/schedules`);
	return data.data;
}

export async function cancelSchedule(id: string) {
	const { data } = await axios.put<{
		success: boolean;
		data: boolean;
	}>(`/schedules/${id}/cancel`, {});
	return data.data;
}

export async function completeSchedule(id: string) {
	const { data } = await axios.put<{
		success: boolean;
		data: boolean;
	}>(`/schedules/${id}/complete`, {});
	return data.data;
}

export async function deleteSchedule(id: string) {
	const { data } = await axios.delete<{
		success: boolean;
		data: boolean;
	}>(`/schedules/${id}`);
	return data.data;
}
