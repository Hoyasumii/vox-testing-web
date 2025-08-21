"use client";

import { Eye, EyeClosed, Stethoscope } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useState, type FormEvent } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { getFormData } from "@/utils";
import { CreateUserDTO } from "@/dtos/users";
import { formatZodError } from "@/utils/format-zod-error";
import { stringifyZodError } from "@/utils/stringify-zod-error";

export default function Page() {
	const [seePassword, setSeePassword] = useState<boolean>();

	const registerUser = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();

		const preContent = getFormData<{
			email: string;
			"is-doctor"?: "on";
			name: string;
			password: string;
		}>(event);

		const { email, name, password } = preContent;

		const content = {
			email,
			name,
			password,
			type: preContent["is-doctor"] ? "DOCTOR" : "PATIENT",
		};

		const { data, success, error } = CreateUserDTO.safeParse(content);

		if (error) {
			alert(stringifyZodError(formatZodError(error)));

			event.currentTarget.reset();
		}

		if (success) console.log(data);
	};

	const accessUser = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
	}

	return (
		<>
			<header className="px-4 py-2 flex gap-2 items-center">
				<Stethoscope />
				<h1 className="font-bold select-none">iDoctor</h1>
			</header>
			<main className="flex-1 flex flex-col items-center justify-start py-40">
				<Card className="shadow-sm rounded-lg p-4 w-11/12 sm:w-8/12 md:w-7/12 lg:w-5/12 flex flex-col gap-4">
					<Tabs defaultValue="access" className="relative">
						<TabsList className="sm:self-end sm:absolute top-0">
							<TabsTrigger value="access">Acesse sua Conta</TabsTrigger>
							<TabsTrigger value="register">Registre-se</TabsTrigger>
						</TabsList>
						<CardContent>
							<TabsContent value="access" className="flex flex-col gap-4">
								<CardHeader>
									<CardTitle>Acesse a sua conta</CardTitle>
									<CardDescription>
										para agendar consultas médicas.
									</CardDescription>
								</CardHeader>
								<div className="flex flex-col gap-2 ps-2">
									<Label htmlFor="email">Email</Label>
									<Input
										name="email"
										id="email"
										placeholder="account@email.com"
									/>
									<Label htmlFor="password">Senha</Label>
									<div className="flex gap-2">
										<Input
											name="password"
											type={seePassword ? "text" : "password"}
											id="password"
											placeholder="*******"
										/>
										<Button
											variant="outline"
											onClick={() => {
												setSeePassword(!seePassword);
											}}
										>
											{seePassword ? <EyeClosed /> : <Eye />}
										</Button>
									</div>
									<Button className="mt-4">Acessar</Button>
								</div>
							</TabsContent>
							<TabsContent value="register" className="flex flex-col gap-4">
								<CardHeader>
									<CardTitle>Crie a sua conta</CardTitle>
									<CardDescription>
										para poder agendar as suas consultas.
									</CardDescription>
								</CardHeader>
								<form
									onSubmit={registerUser}
									className="flex flex-col gap-2 ps-2"
								>
									<Label htmlFor="name">Nome</Label>
									<Input name="name" id="name" placeholder="John Doe" />
									<Label htmlFor="email">Email</Label>
									<Input
										name="email"
										id="email"
										placeholder="account@email.com"
									/>
									<Label htmlFor="password">Senha</Label>
									<div className="flex gap-2">
										<Input
											name="password"
											type={seePassword ? "text" : "password"}
											id="password"
											placeholder="*******"
										/>
										<Button
											variant="outline"
											onClick={() => {
												setSeePassword(!seePassword);
											}}
										>
											{seePassword ? <EyeClosed /> : <Eye />}
										</Button>
									</div>
									<Label className="cursor-pointer pt-4">
										<Checkbox name="is-doctor" />
										Eu sou um Médico
									</Label>
									<Button type="submit" className="mt-4">
										Criar Conta
									</Button>
								</form>
							</TabsContent>
						</CardContent>
					</Tabs>
				</Card>
			</main>
		</>
	);
}
