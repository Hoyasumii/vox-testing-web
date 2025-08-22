# iDoctor - Sistema de Agendamento Médico

Um sistema completo de agendamento médico que conecta pacientes e médicos de forma simples e eficiente.

## 🌟 Funcionalidades

### Para Pacientes
- ✅ **Cadastro e Autenticação**: Criação de conta com email e senha
- ✅ **Lista de Médicos**: Visualização de médicos disponíveis
- ✅ **Agendamento Intuitivo**: Interface moderna para agendar consultas
- ✅ **Filtros por Data**: Busca de horários por data específica
- ✅ **Gerenciamento de Consultas**: Visualização e cancelamento de consultas
- ✅ **Observações**: Adição de notas nas consultas (ex: sintomas, exames)

### Para Médicos
- ✅ **Gestão de Disponibilidade**: Criação e edição de horários disponíveis
- ✅ **Visualização de Slots**: Interface visual dos horários livres/ocupados
- ✅ **Gerenciamento de Consultas**: Visualização de pacientes agendados
- ✅ **Conclusão de Consultas**: Marcação de consultas como concluídas
- ✅ **Dashboard Personalizado**: Interface específica para médicos

### Funcionalidades Gerais
- ✅ **Interface Responsiva**: Funciona perfeitamente em desktop e mobile
- ✅ **Tema Claro/Escuro**: Alternância entre temas
- ✅ **Notificações Toast**: Feedback visual para ações do usuário
- ✅ **Estados de Loading**: Indicadores visuais durante carregamento
- ✅ **Controle de Acesso**: Páginas específicas por tipo de usuário
- ✅ **Validação de Dados**: Validação robusta com Zod

## 🚀 Tecnologias Utilizadas

### Frontend
- **Next.js 15** - Framework React para produção
- **React 19** - Biblioteca para interface de usuário
- **TypeScript** - Tipagem estática
- **Tailwind CSS 4** - Framework CSS utilitário
- **Radix UI** - Componentes acessíveis
- **Lucide React** - Ícones modernos
- **Zod** - Validação de schemas
- **Axios** - Cliente HTTP

### Desenvolvimento
- **Biome** - Linting e formatação
- **Vitest** - Testes unitários
- **Testing Library** - Testes de componentes
- **PNPM** - Gerenciador de pacotes

## 📁 Estrutura do Projeto

```
src/
├── app/                    # App Router do Next.js
│   ├── page.tsx           # Página de login/registro
│   ├── layout.tsx         # Layout raiz
│   └── dashboard/         # Área logada
│       ├── page.tsx       # Dashboard principal
│       ├── layout.tsx     # Layout do dashboard
│       ├── appointments/  # Agendamento de consultas
│       ├── availability/  # Gestão de disponibilidade (médicos)
│       └── schedules/     # Visualização de consultas
├── components/            # Componentes reutilizáveis
│   ├── ui/               # Componentes de interface
│   ├── doctor-list.tsx   # Lista de médicos
│   ├── availability-calendar.tsx # Calendário de horários
│   └── dashboard-header.tsx # Header do dashboard
├── contexts/             # Contextos React
│   ├── AuthContext.tsx   # Autenticação
│   ├── ThemeContext.tsx  # Tema
│   └── ToastContext.tsx  # Notificações
├── services/            # Serviços de API
├── dtos/               # Tipos e validações
├── hooks/              # Hooks customizados
├── utils/              # Utilitários
└── tests/              # Testes
```

## 🎨 Melhorias de UX/UI Implementadas

### 1. **Interface de Agendamento Renovada**
- Layout em duas colunas para melhor organização
- Lista visual de médicos com informações relevantes
- Calendário interativo para seleção de horários
- Confirmação clara do agendamento com resumo

### 2. **Gestão de Disponibilidade Aprimorada**
- Formulário intuitivo para criar horários
- Visualização em grid dos slots de tempo
- Edição inline de disponibilidades
- Indicadores visuais de horários livres/ocupados

### 3. **Dashboard Inteligente**
- Cards informativos com ações rápidas
- Interface diferenciada para médicos e pacientes
- Estatísticas e status da conta
- Navegação intuitiva

### 4. **Página de Consultas Organizada**
- Separação por abas (Agendadas/Concluídas/Canceladas)
- Cards visuais para cada consulta
- Ações contextuais (cancelar/concluir)
- Informações detalhadas de cada agendamento

### 5. **Login/Registro Modernizado**
- Design mais atrativo e profissional
- Seção de features destacadas
- Formulários validados
- Feedback visual aprimorado

## 🔧 Configuração e Instalação

### Pré-requisitos
- Node.js 18+ 
- PNPM (recomendado) ou NPM

### Instalação

1. **Clone o repositório**
```bash
git clone <repository-url>
cd vox-testing-web
```

2. **Instale as dependências**
```bash
pnpm install
```

3. **Configure as variáveis de ambiente**
```bash
# Crie um arquivo .env.local
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/api
```

4. **Execute o projeto**
```bash
# Desenvolvimento
pnpm dev

# Produção
pnpm build
pnpm start
```

## 🧪 Testes

```bash
# Executar todos os testes
pnpm test

# Executar testes em modo watch
pnpm test:watch

# Executar testes uma vez
pnpm test:run
```

## 📝 Scripts Disponíveis

```bash
pnpm dev          # Inicia o servidor de desenvolvimento
pnpm build        # Gera build de produção
pnpm start        # Inicia servidor de produção
pnpm test         # Executa testes em modo watch
pnpm test:run     # Executa testes uma vez
pnpm lint         # Executa linting
pnpm format       # Formata código
pnpm typecheck    # Verifica tipos TypeScript
pnpm check        # Executa typecheck + lint + tests
```

## 🔒 Segurança

- **Autenticação JWT**: Tokens seguros para autenticação
- **Validação de dados**: Schemas Zod para validação robusta
- **Controle de acesso**: Rotas protegidas por tipo de usuário
- **Sanitização**: Prevenção contra XSS e outros ataques

## 📱 Responsividade

O sistema foi desenvolvido com design responsivo, funcionando perfeitamente em:
- 📱 **Mobile** (320px+)
- 📱 **Tablet** (768px+)
- 💻 **Desktop** (1024px+)
- 🖥️ **Large Desktop** (1440px+)

## 🎯 Próximas Funcionalidades

- [ ] Notificações em tempo real (WebSocket)
- [ ] Sistema de avaliações médico/paciente
- [ ] Histórico médico do paciente
- [ ] Integração com calendário
- [ ] Lembretes por email/SMS
- [ ] Chat entre médico e paciente
- [ ] Relatórios e estatísticas

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença ISC. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

Desenvolvido para o desafio técnico da Vox Tecnologia.

---

**iDoctor** - Conectando saúde e tecnologia! 🏥💻
