# iDoctor Frontend

Aplicação Next.js para gerenciamento de disponibilidades médicas e agendamento de consultas.

## Tecnologias
- Next.js (App Router)
- React 19
- TypeScript
- TailwindCSS v4
- Zod para validação
- Axios para HTTP
- Vitest + Testing Library

## Funcionalidades
- Registro e login (paciente ou médico)
- Persistência de sessão via token
- Criação e listagem de disponibilidades (médico)
- Busca de disponibilidades por médico/data (paciente)
- Agendamento de consulta com notas opcionais
- Listagem de consultas com ações de cancelar / concluir (otimistas)
- Toasts de feedback e estados de carregamento

## Executar
```bash
pnpm install
pnpm start:dev
```

Crie um arquivo `.env.local` se necessário com as variáveis:
```
# URL base da API (necessário para autenticação funcionar)
NEXT_PUBLIC_API_BASE_URL=http://localhost:3333

# (Opcional) Redirecionamento automático para "/" em respostas 401
# Por padrão o redirect está DESATIVADO para facilitar a depuração (você verá um toast).
# Para reativar o redirect, defina explicitamente como "false":
# NEXT_PUBLIC_DISABLE_401_REDIRECT=false
```

Após alterar variáveis de ambiente, reinicie o dev server.

Em desenvolvimento, o console do navegador exibirá logs auxiliares:
- `[HTTP] baseURL:` confirma a URL configurada do axios
- `[Auth]` eventos de `/auth` e `/users/me` com dados mínimos para depuração

## Testes
```bash
pnpm test --run
```

## Estrutura principal
```
src/
	app/
	contexts/
	dtos/
	services/
	tests/
```

## Próximas melhorias sugeridas
- Máscaras e componentes de tempo mais ricos
- Paginação / caching de listas
- Melhorar testes de integração (fluxos completos)
- Tema escuro com toggle no header

