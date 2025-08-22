# Arquitetura

## Visão Geral
- Next.js (App Router) como framework de UI
- Contextos: Auth, Toast, Theme
- DTOs em Zod para validação de entrada/saída
- Services em `src/services` encapsulam axios
- Páginas por feature dentro de `src/app/dashboard/*`

## Fluxo de Autenticação
1. `AuthContext` busca token do localStorage no boot e valida em `/users/me`.
2. `signIn` chama `/auth`, define header Authorization global e persiste token.
3. `dashboard/layout.tsx` protege rota (se necessário) e mostra loading.

## Disponibilidades
- DTO: `CreateDoctorAvailabilityDTO` (valida data, start/end e intervalo)
- Service: `create/listMy/listDoctor/update/delete`
- UI: criação + listagem, edição inline e remoção, feedback via toasts

## Agendamentos
- DTOs: `CreateScheduleDTO`, `ScheduleResponseDTO`
- Service: `create/listMy/listDoctor/cancel/complete`
- UI: busca por médico/data, seleção de slot, notas opcionais, listagem, cancelar/concluir

## Feedback & Acessibilidade
- `ToastContext` para mensagens
- Estados de loading e submitting
- aria-live/aria-busy e labels associados

## Testes
- Vitest + RTL
- Testes de AuthContext, criação/edição/remoção de disponibilidade, fluxo de agendamento

## Estilos e Tema
- TailwindCSS v4 com variáveis CSS para cores
- Dark mode via `ThemeContext` e `data-theme` no document

## Pastas
```
src/
  app/
    dashboard/
  components/
  contexts/
  dtos/
  services/
  tests/
```
