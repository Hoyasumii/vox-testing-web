# Checklist de Requisitos

## Autenticação
- [x] Registro de usuário (médico / paciente)
- [x] Login e persistência de token
- [x] Proteção de rotas dashboard

## Disponibilidades (Médico)
- [x] Criar disponibilidade (data, início, fim, duração)
- [x] Listar minhas disponibilidades
- [x] Editar disponibilidade (inline)
- [x] Remover disponibilidade

## Agendamentos / Consultas
- [x] Listar disponibilidades de um médico
- [x] Filtrar por data
- [x] Agendar consulta (seleção de slot)
- [x] Notas opcionais no agendamento
- [x] Listar minhas consultas
- [x] Cancelar consulta (optimistic UI – requer endpoint real)
- [x] Concluir consulta (optimistic UI – requer endpoint real)

## UI / UX
- [x] Componentização base (botões, inputs, layout)
- [x] Estados de loading/submitting
- [x] Toast feedback
- [x] Acessibilidade básica (aria-live, aria-busy, labels)
- [x] Tema escuro
- [ ] Layout totalmente responsivo validado

## Validação
- [x] DTOs com Zod
- [x] Regras de horário (início < fim)
- [ ] Mensagens específicas exibidas por campo (genérico hoje)

## Testes
- [x] Teste AuthContext
- [x] Teste criação de disponibilidade
- [x] Teste fluxo de agendamento
- [ ] Teste listagem e ações de consulta

## Documentação
- [x] README inicial
- [x] Checklist
- [ ] Arquitetura detalhada

## Outras Melhorias Futuras
- Cache de dados (SWR/React Query)
- Tratamento centralizado de erros HTTP
- Refresh token / expiração
- Paginação / busca avançada

