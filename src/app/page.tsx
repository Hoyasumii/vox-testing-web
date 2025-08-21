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
import { useState } from "react";

export default function Page() {
	const [seePassword, setSeePassword] = useState<boolean>();

	return (
		<>
			<header className="px-4 py-2 bg-slate-50/10 border-b border-slate-100 flex gap-2 items-center">
				<Stethoscope className="text-emerald-400" />
				<h1 className="font-bold text-emerald-700">iDoctor</h1>
			</header>
			<main className="flex-1 flex flex-col items-center justify-center">
				<Card className="shadow-sm rounded-lg p-4 w-5/12 flex flex-col gap-4">
					<Tabs defaultValue="access" className="relative">
						<TabsList className="self-end absolute top-0">
							<TabsTrigger value="access">Acesse sua Conta</TabsTrigger>
							<TabsTrigger value="register">Registre-se</TabsTrigger>
						</TabsList>
						<CardContent>
							<TabsContent value="access" className="flex flex-col gap-4">
								<CardHeader>
									<CardTitle>Acesse a sua conta</CardTitle>
									<CardDescription>
										Use a sua conta para agendar consultas médicas!
									</CardDescription>
								</CardHeader>
								<CardContent className="flex flex-col gap-2 *:ps-2">
									<Label htmlFor="email">Email</Label>
									<Input
										name="email"
										id="email"
										placeholder="account@email.com"
									/>
									<Label htmlFor="password">Senha</Label>
									<div className="flex gap-2">
										<Input
											name="email"
											type={seePassword ? "text" : "password"}
											id="password"
											placeholder="*******"
										/>
										<Button variant="outline" onClick={() => {
											setSeePassword(!seePassword);
										}}>
											{seePassword ? <EyeClosed/> : <Eye/>}
										</Button>
									</div>
									<Button className="mt-4">Acessar</Button>
								</CardContent>
							</TabsContent>
							<TabsContent value="register">
								Change your password here.
							</TabsContent>
						</CardContent>
					</Tabs>
				</Card>
			</main>
		</>
	);
}
