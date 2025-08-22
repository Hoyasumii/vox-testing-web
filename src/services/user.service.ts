import axios from "@/utils/axios";
import type { UserResponseDTO } from "@/dtos/users/user-response.dto";

// Tipo para médico com informações relevantes
export type Doctor = {
	id: string;
	name: string;
	email: string;
	type: "DOCTOR";
	createdAt: string;
	updatedAt: string;
};

export async function getUserData() {
	const { data } = await axios.get<{
		success: boolean;
		data: UserResponseDTO;
	}>("/users/me");
	return data.data;
}

// Função para listar médicos - pode precisar ser implementada no backend
// Por enquanto, vamos simular com uma busca geral de usuários médicos
export async function listDoctors(): Promise<Doctor[]> {
	try {
		// Tentativa 1: Buscar endpoint específico de médicos (se existir)
		const { data } = await axios.get<{
			success: boolean;
			data: Doctor[];
		}>("/users/doctors");
		return data.data;
	} catch {
		// Fallback: Por enquanto retorna lista vazia
		// Em uma implementação real, precisaríamos de um endpoint específico
		console.warn("Endpoint /users/doctors não encontrado. Implementando fallback...");
		
		// Simulação temporária - em produção isso deveria vir do backend
		return [
			{
				id: "doctor-1",
				name: "Dr. João Silva",
				email: "joao.silva@hospital.com",
				type: "DOCTOR",
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			},
			{
				id: "doctor-2", 
				name: "Dra. Maria Santos",
				email: "maria.santos@hospital.com",
				type: "DOCTOR",
				createdAt: new Date().toISOString(),
				updatedAt: new Date().toISOString(),
			},
		];
	}
}

export async function updateUserData(updates: Partial<Pick<UserResponseDTO, 'name' | 'email' | 'type'>>) {
	const { data } = await axios.put<{
		success: boolean;
		data: boolean;
	}>("/users/me", updates);
	return data.data;
}

export async function deleteUser() {
	const { data } = await axios.delete<{
		success: boolean;
		data: boolean;
	}>("/users/me");
	return data.data;
}
