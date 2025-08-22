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
import { useState, type FormEvent, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { axios, getFormData } from "@/utils";
import { CreateUserDTO } from "@/dtos/users";
import { formatZodError } from "@/utils/format-zod-error";
import { stringifyZodError } from "@/utils/stringify-zod-error";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";
import { AuthenticateUserDTO } from "@/dtos/users/authenticate-user.dto";

export default function Page() {
	const [seePassword, setSeePassword] = useState<boolean>();
	const router = useRouter();
	const { signIn, token, loading } = useAuth();
	const { push } = useToast();

	useEffect(() => {
		if (!loading && token) {
			router.replace("/dashboard");
		}
	}, [token, loading, router]);

	const registerUser = async (event: FormEvent<HTMLFormElement>) => {
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

		const { data, error } = CreateUserDTO.safeParse(content);

		if (error) {
			push({
				type: "error",
				message: stringifyZodError(formatZodError(error)),
			});
			event.currentTarget.reset();
			return;
		}

		try {
			await axios.post<{ success: boolean; data: string }>("/auth/new", data);
			// autenticar e redirecionar
			await signIn({ email, password });
			push({ type: "success", message: "Conta criada! Bem-vindo(a)." });
			router.push("/dashboard");
		} catch {
			push({
				type: "error",
				message: "Não foi possível criar essa nova conta",
			});
			event.currentTarget.reset();
		}
	};

	const accessUser = async (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const { email, password } = getFormData<{
			email: string;
			password: string;
		}>(event);
		const parsed = AuthenticateUserDTO.safeParse({ email, password });
		if (!parsed.success) {
			push({ message: "Credenciais inválidas", type: "error" });
			return;
		}
		try {
			await signIn(parsed.data);
			push({ message: "Bem-vindo!", type: "success" });
			router.push("/dashboard");
		} catch {
			push({ message: "Falha ao autenticar", type: "error" });
		}
	};

	if (loading) {
		return (
			<main className="flex items-center justify-center h-screen">
				<span className="text-sm text-muted-foreground">
					Verificando sessão...
				</span>
			</main>
		);
	}

	return (
		<>
			<header className="px-4 py-3 flex gap-2 items-center border-b bg-background/80 backdrop-blur">
				<Stethoscope className="size-6 text-primary" />
				<h1 className="font-bold select-none text-xl">iDoctor</h1>
			</header>

			<main className="flex-1 flex flex-col items-center justify-center py-8 px-4">
				<div className="w-full max-w-md space-y-6">
					{/* Hero Section */}
					<div className="text-center space-y-4 mb-8">
						<div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
							<Stethoscope className="size-8 text-primary" />
						</div>
						<h2 className="text-3xl font-bold">
							Sistema de Agendamento Médico
						</h2>
						<p className="text-muted-foreground">
							Conectamos pacientes e médicos de forma simples e eficiente
						</p>
					</div>

					<Card className="shadow-lg">
						<Tabs defaultValue="access" className="relative">
							<TabsList className="grid w-full grid-cols-2">
								<TabsTrigger value="access">Entrar</TabsTrigger>
								<TabsTrigger value="register">Criar Conta</TabsTrigger>
							</TabsList>

							<CardContent className="pt-4">
								<TabsContent value="access" className="space-y-4">
									<CardHeader className="px-0">
										<CardTitle>Entre na sua conta</CardTitle>
										<CardDescription>
											Acesse sua conta para gerenciar consultas médicas
										</CardDescription>
									</CardHeader>
									<form onSubmit={accessUser} className="space-y-4">
										<div className="space-y-2">
											<Label htmlFor="access-email">Email</Label>
											<Input
												name="email"
												id="access-email"
												type="email"
												placeholder="seu@email.com"
												required
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="access-password">Senha</Label>
											<div className="flex gap-2">
												<Input
													name="password"
													type={seePassword ? "text" : "password"}
													id="access-password"
													placeholder="••••••••"
													required
												/>
												<Button
													variant="outline"
													type="button"
													size="icon"
													onClick={() => setSeePassword(!seePassword)}
												>
													{seePassword ? (
														<EyeClosed className="size-4" />
													) : (
														<Eye className="size-4" />
													)}
												</Button>
											</div>
										</div>
										<Button type="submit" className="w-full" size="lg">
											Entrar
										</Button>
									</form>
								</TabsContent>

								<TabsContent value="register" className="space-y-4">
									<CardHeader className="px-0">
										<CardTitle>Crie sua conta</CardTitle>
										<CardDescription>
											Cadastre-se para começar a agendar consultas
										</CardDescription>
									</CardHeader>
									<form onSubmit={registerUser} className="space-y-4">
										<div className="space-y-2">
											<Label htmlFor="name">Nome completo</Label>
											<Input
												name="name"
												id="name"
												placeholder="Seu nome completo"
												required
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="email">Email</Label>
											<Input
												name="email"
												id="email"
												type="email"
												placeholder="seu@email.com"
												required
											/>
										</div>
										<div className="space-y-2">
											<Label htmlFor="password">Senha</Label>
											<div className="flex gap-2">
												<Input
													name="password"
													type={seePassword ? "text" : "password"}
													id="password"
													placeholder="••••••••"
													minLength={6}
													required
												/>
												<Button
													variant="outline"
													type="button"
													size="icon"
													onClick={() => setSeePassword(!seePassword)}
												>
													{seePassword ? (
														<EyeClosed className="size-4" />
													) : (
														<Eye className="size-4" />
													)}
												</Button>
											</div>
										</div>
										<div className="flex items-center space-x-2 pt-2">
											<Checkbox name="is-doctor" />
											<Label className="cursor-pointer text-sm">
												Sou um médico
											</Label>
										</div>
										<Button type="submit" className="w-full" size="lg">
											Criar Conta
										</Button>
									</form>
								</TabsContent>
							</CardContent>
						</Tabs>
					</Card>

					{/* Features Section */}
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
						<div className="text-center space-y-2">
							<div className="mx-auto w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
								<Stethoscope className="size-5 text-blue-600" />
							</div>
							<h3 className="font-medium">Para Médicos</h3>
							<p className="text-xs text-muted-foreground">
								Gerencie seus horários e consultas
							</p>
						</div>
						<div className="text-center space-y-2">
							<div className="mx-auto w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
								<Eye className="size-5 text-green-600" />
							</div>
							<h3 className="font-medium">Para Pacientes</h3>
							<p className="text-xs text-muted-foreground">
								Agende consultas facilmente
							</p>
						</div>
						<div className="text-center space-y-2">
							<div className="mx-auto w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
								<EyeClosed className="size-5 text-purple-600" />
							</div>
							<h3 className="font-medium">Seguro</h3>
							<p className="text-xs text-muted-foreground">
								Seus dados estão protegidos
							</p>
						</div>
					</div>
				</div>
			</main>
		</>
	);
}
