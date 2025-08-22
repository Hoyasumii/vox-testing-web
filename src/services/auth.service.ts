import axios from "@/utils/axios";
import type { AuthenticateUserDTO } from "@/dtos/users/authenticate-user.dto";
import type { UserAuthResponseDTO } from "@/dtos/users/user-auth-response.dto";

export async function authenticate(payload: AuthenticateUserDTO) {
	const { data } = await axios.post<{
		success: boolean;
		data: UserAuthResponseDTO;
	}>("/auth", payload);
	return data.data;
}
