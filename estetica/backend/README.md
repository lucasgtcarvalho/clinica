# 🏥 EstéticaFlow - Backend API

API REST completa para sistema SaaS de gestão de clínicas de estética.

## 🚀 Tecnologias

- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **TypeScript** - Linguagem tipada
- **Prisma** - ORM para PostgreSQL
- **JWT** - Autenticação
- **Bcrypt** - Hash de senhas

## 📋 Pré-requisitos

- Node.js 18+ 
- PostgreSQL 14+
- npm ou yarn

## 🔧 Instalação Local

### 1. Clone o repositório

```bash
git clone <seu-repositorio>
cd backend
```

### 2. Instale as dependências

```bash
npm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/estetica_flow"
JWT_SECRET=seu-secret-aqui
FRONTEND_URL=http://localhost:5173
```

### 4. Execute as migrations do banco de dados

```bash
# Gerar Prisma Client
npm run prisma:generate

# Executar migrations
npm run prisma:migrate

# (Opcional) Popular banco com dados de exemplo
npm run seed
```

### 5. Inicie o servidor

```bash
# Desenvolvimento
npm run dev

# Produção
npm run build
npm start
```

O servidor estará rodando em `http://localhost:3000`

## 📚 Documentação da API

### Autenticação

#### POST /api/v1/auth/register
Registrar nova clínica

**Body:**
```json
{
  "tenantName": "Clínica Estética",
  "tenantSlug": "clinica-estetica",
  "name": "João Silva",
  "email": "joao@clinica.com",
  "password": "senha123"
}
```

#### POST /api/v1/auth/login
Login de usuário

**Body:**
```json
{
  "email": "joao@clinica.com",
  "password": "senha123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "uuid",
    "name": "João Silva",
    "email": "joao@clinica.com",
    "role": "admin",
    "tenant": {
      "id": "uuid",
      "name": "Clínica Estética",
      "slug": "clinica-estetica"
    }
  }
}
```

### Clientes

#### GET /api/v1/clients
Listar todos os clientes

**Headers:**
```
Authorization: Bearer <token>
```

**Query Params:**
- `page` - Número da página (default: 1)
- `limit` - Itens por página (default: 20)
- `search` - Buscar por nome, email ou telefone

#### POST /api/v1/clients
Criar novo cliente

**Body:**
```json
{
  "name": "Maria Santos",
  "cpf": "123.456.789-00",
  "phone": "(11) 98888-7777",
  "email": "maria@email.com",
  "birthDate": "1990-05-15",
  "address": "Rua das Flores, 123",
  "city": "São Paulo",
  "state": "SP",
  "zipCode": "01234-567"
}
```

### Agendamentos

#### GET /api/v1/appointments
Listar agendamentos

**Query Params:**
- `startDate` - Data inicial (ISO 8601)
- `endDate` - Data final (ISO 8601)
- `status` - Filtrar por status
- `clientId` - Filtrar por cliente
- `userId` - Filtrar por profissional

#### POST /api/v1/appointments
Criar novo agendamento

**Body:**
```json
{
  "clientId": "uuid",
  "userId": "uuid",
  "startTime": "2024-01-15T10:00:00Z",
  "endTime": "2024-01-15T11:00:00Z",
  "services": [
    {
      "serviceId": "uuid",
      "duration": 60,
      "price": 150.00
    }
  ],
  "notes": "Cliente prefere sala 2"
}
```

#### PATCH /api/v1/appointments/:id/status
Atualizar status do agendamento

**Body:**
```json
{
  "status": "confirmed"
}
```

Valores possíveis: `scheduled`, `confirmed`, `in_progress`, `completed`, `cancelled`

### Serviços

#### GET /api/v1/services
Listar serviços

#### POST /api/v1/services
Criar novo serviço

**Body:**
```json
{
  "name": "Limpeza de Pele",
  "description": "Limpeza profunda com extração",
  "duration": 60,
  "price": 150.00,
  "category": "Facial"
}
```

### Pacotes

#### GET /api/v1/packages
Listar pacotes

#### POST /api/v1/packages
Criar novo pacote

**Body:**
```json
{
  "name": "Pacote 10 Sessões Depilação",
  "description": "10 sessões de depilação a laser",
  "sessions": 10,
  "price": 1200.00,
  "discount": 300.00,
  "validityDays": 180,
  "services": [
    {
      "serviceId": "uuid",
      "quantity": 10
    }
  ]
}
```

### Financeiro

#### GET /api/v1/financials
Listar lançamentos financeiros

**Query Params:**
- `startDate` - Data inicial
- `endDate` - Data final
- `type` - income ou expense
- `status` - pending, paid, cancelled

#### POST /api/v1/financials
Criar lançamento financeiro

**Body:**
```json
{
  "clientId": "uuid",
  "appointmentId": "uuid",
  "type": "income",
  "category": "service",
  "description": "Pagamento de atendimento",
  "amount": 150.00,
  "paymentMethod": "pix",
  "paymentStatus": "paid",
  "dueDate": "2024-01-15T10:00:00Z",
  "paidAt": "2024-01-15T10:30:00Z"
}
```

### Dashboard

#### GET /api/v1/dashboard/metrics
Obter métricas do dashboard

**Query Params:**
- `period` - today, week, month, year

**Response:**
```json
{
  "totalClients": 150,
  "appointmentsToday": 8,
  "revenueToday": 1200.00,
  "averageDuration": 75,
  "monthlyRevenue": [
    { "month": "Jan", "value": 15000 },
    { "month": "Fev", "value": 18000 }
  ],
  "popularServices": [
    { "name": "Limpeza de Pele", "count": 45, "percentage": 30 }
  ],
  "upcomingAppointments": [],
  "pendingPayments": 3500.00
}
```

## 🗂️ Estrutura de Pastas

```
backend/
├── prisma/
│   ├── schema.prisma          # Schema do banco de dados
│   └── migrations/            # Migrations
├── src/
│   ├── controllers/           # Controllers da API
│   ├── middlewares/           # Middlewares (auth, validation, etc)
│   ├── routes/                # Definição de rotas
│   ├── services/              # Lógica de negócio
│   ├── lib/                   # Bibliotecas e utilitários
│   └── server.ts              # Arquivo principal
├── uploads/                   # Arquivos enviados
├── .env                       # Variáveis de ambiente
├── .env.example               # Exemplo de variáveis
├── package.json
└── tsconfig.json
```

## 🔒 Autenticação

Todas as rotas (exceto `/auth/login` e `/auth/register`) requerem autenticação via JWT.

**Header necessário:**
```
Authorization: Bearer <seu-token-jwt>
```

## 🌐 Multi-tenant (SaaS)

O sistema é multi-tenant, ou seja, cada clínica tem seus dados isolados.

- Cada usuário pertence a um `tenant` (clínica)
- Todas as consultas são automaticamente filtradas por `tenantId`
- Isolamento completo de dados entre clínicas

## 🔐 Permissões

Três níveis de permissão:

1. **admin** - Acesso total ao sistema
2. **professional** - Profissionais (pode gerenciar agendamentos e clientes)
3. **receptionist** - Recepcionista (pode gerenciar agendamentos)

## 🧪 Testes

```bash
# Testes unitários
npm test

# Testes com coverage
npm run test:coverage
```

## 📦 Deploy

### Railway

```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login

# Deploy
railway up
```

### Render

1. Conecte seu repositório GitHub
2. Configure as variáveis de ambiente
3. Deploy automático a cada push

## 🔄 Migrations

```bash
# Criar nova migration
npx prisma migrate dev --name nome-da-migration

# Aplicar migrations em produção
npx prisma migrate deploy

# Reset do banco (CUIDADO!)
npx prisma migrate reset
```

## 📊 Prisma Studio

Interface visual para gerenciar o banco de dados:

```bash
npm run prisma:studio
```

Acesse: `http://localhost:5555`

## 🛠️ Scripts Úteis

```bash
npm run dev          # Desenvolvimento com hot reload
npm run build        # Build para produção
npm start            # Iniciar em produção
npm run prisma:generate  # Gerar Prisma Client
npm run prisma:migrate   # Executar migrations
npm run prisma:studio    # Abrir Prisma Studio
npm run seed         # Popular banco com dados de exemplo
```

## 📝 Logs

Em desenvolvimento: Logs detalhados no console
Em produção: Logs em formato JSON para integração com serviços de log

## 🔍 Monitoramento

Recomendações de ferramentas:

- **Sentry** - Rastreamento de erros
- **New Relic** - APM
- **LogRocket** - Session replay
- **Datadog** - Métricas e logs

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/MinhaFeature`)
3. Commit suas mudanças (`git commit -m 'Adiciona MinhaFeature'`)
4. Push para a branch (`git push origin feature/MinhaFeature`)
5. Abra um Pull Request

## 📄 Licença

MIT

## 👥 Suporte

Email: suporte@esteticaflow.com
