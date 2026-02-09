# 🚀 Guia Completo de Deploy para Produção

## 📋 Índice
1. [Arquitetura do Sistema](#arquitetura)
2. [Backend - Node.js + Express + Prisma](#backend)
3. [Banco de Dados - PostgreSQL](#banco-de-dados)
4. [Deploy do Frontend](#deploy-frontend)
5. [Deploy do Backend](#deploy-backend)
6. [Configuração de Domínio e SSL](#dominio-ssl)
7. [Monitoramento e Backup](#monitoramento)

---

## 🏗️ Arquitetura do Sistema {#arquitetura}

```
┌─────────────────┐
│   Frontend      │
│   (Vercel/      │
│    Netlify)     │
└────────┬────────┘
         │
         │ HTTPS
         │
┌────────▼────────┐
│   Backend API   │
│   (Railway/     │
│    Render)      │
└────────┬────────┘
         │
         │
┌────────▼────────┐
│   PostgreSQL    │
│   (Supabase/    │
│    Railway)     │
└─────────────────┘
```

---

## 🔧 Backend - Node.js + Express + Prisma {#backend}

### Passo 1: Criar projeto backend

```bash
# Criar pasta do backend
mkdir backend
cd backend

# Inicializar projeto Node.js
npm init -y

# Instalar dependências principais
npm install express cors dotenv
npm install @prisma/client
npm install bcryptjs jsonwebtoken
npm install express-validator
npm install helmet compression morgan

# Instalar dependências de desenvolvimento
npm install -D typescript @types/node @types/express
npm install -D @types/bcryptjs @types/jsonwebtoken
npm install -D @types/cors prisma ts-node-dev nodemon
```

### Passo 2: Configurar TypeScript

```bash
# Gerar tsconfig.json
npx tsc --init
```

### Passo 3: Inicializar Prisma

```bash
# Inicializar Prisma com PostgreSQL
npx prisma init --datasource-provider postgresql
```

---

## 🗄️ Banco de Dados - PostgreSQL {#banco-de-dados}

### Schema Prisma Completo (Multi-tenant SaaS)

O schema completo está no arquivo `backend/prisma/schema.prisma`

### Principais Tabelas:

1. **Tenants (Clínicas)** - Isolamento multi-tenant
2. **Users** - Usuários do sistema
3. **Clients** - Clientes das clínicas
4. **Services** - Serviços oferecidos
5. **Packages** - Pacotes de sessões
6. **Appointments** - Agendamentos
7. **AppointmentServices** - Serviços por agendamento
8. **Financial** - Lançamentos financeiros
9. **Anamnesis** - Fichas de anamnese
10. **Photos** - Fotos antes/depois
11. **Notifications** - Sistema de notificações
12. **AuditLogs** - Logs de auditoria

---

## 🌐 Deploy do Frontend {#deploy-frontend}

### Opção 1: Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm install -g vercel

# Deploy
vercel

# Produção
vercel --prod
```

**Configurações no Vercel Dashboard:**
- Build Command: `npm run build`
- Output Directory: `dist`
- Install Command: `npm install`

### Opção 2: Netlify

```bash
# Instalar Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy

# Produção
netlify deploy --prod
```

**Arquivo `netlify.toml`:**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### Variáveis de Ambiente (Frontend)

```env
VITE_API_URL=https://sua-api.com
VITE_APP_NAME=EstéticaFlow
```

---

## 🖥️ Deploy do Backend {#deploy-backend}

### Opção 1: Railway (Recomendado para PostgreSQL integrado)

1. Acesse [railway.app](https://railway.app)
2. Clique em "New Project"
3. Selecione "Deploy from GitHub repo"
4. Conecte seu repositório
5. Railway detectará automaticamente Node.js
6. Adicione PostgreSQL:
   - Click "New" → "Database" → "PostgreSQL"
   - Railway gerará automaticamente `DATABASE_URL`

**Variáveis de Ambiente no Railway:**
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:password@host:5432/database
JWT_SECRET=seu-secret-super-seguro-aqui
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://seu-frontend.vercel.app
```

### Opção 2: Render

1. Acesse [render.com](https://render.com)
2. "New" → "Web Service"
3. Conecte repositório GitHub
4. Configurações:
   - Environment: Node
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Start Command: `npm start`
5. Adicione PostgreSQL:
   - "New" → "PostgreSQL"
   - Copie a URL interna

### Opção 3: Heroku

```bash
# Login no Heroku
heroku login

# Criar app
heroku create nome-do-seu-app

# Adicionar PostgreSQL
heroku addons:create heroku-postgresql:mini

# Deploy
git push heroku main

# Rodar migrations
heroku run npx prisma migrate deploy
```

---

## 🔒 Configuração de Domínio e SSL {#dominio-ssl}

### Frontend (Vercel/Netlify)

1. **Adicionar domínio customizado:**
   - Vercel: Settings → Domains
   - Netlify: Domain settings → Add custom domain

2. **Configurar DNS:**
   - Adicione os registros DNS fornecidos
   - SSL automático (Let's Encrypt)

### Backend (Railway/Render)

1. **Gerar domínio:**
   - Railway: Settings → Generate Domain
   - Render: Fornece domínio automático

2. **Domínio customizado:**
   - Adicione CNAME apontando para o domínio fornecido

---

## 📊 Monitoramento e Backup {#monitoramento}

### Backup do Banco de Dados

**Backup Automático no Railway:**
- Railway Pro oferece backups automáticos diários

**Backup Manual:**
```bash
# Exportar dump
pg_dump $DATABASE_URL > backup.sql

# Importar dump
psql $DATABASE_URL < backup.sql
```

### Monitoramento

**Opções de Monitoramento:**

1. **Sentry** - Rastreamento de erros
```bash
npm install @sentry/node @sentry/tracing
```

2. **New Relic** - APM completo

3. **LogRocket** - Session replay

4. **Uptime Robot** - Monitoramento de disponibilidade

---

## 🔐 Segurança em Produção

### Checklist de Segurança:

- ✅ HTTPS obrigatório
- ✅ CORS configurado corretamente
- ✅ Rate limiting implementado
- ✅ Helmet.js para headers HTTP seguros
- ✅ Variáveis de ambiente protegidas
- ✅ JWT com expiração curta
- ✅ Senhas hasheadas com bcrypt
- ✅ SQL Injection prevenido (Prisma)
- ✅ XSS protection
- ✅ CSRF tokens
- ✅ Input validation

---

## 📱 PWA - Progressive Web App

### Configurar Service Worker:

O projeto já está configurado como PWA com:
- `manifest.json` configurado
- Ícones para diferentes tamanhos
- Service Worker para cache offline

**Testar PWA:**
1. Build de produção
2. Servir com HTTPS
3. Chrome DevTools → Lighthouse → PWA audit

---

## 🚀 Pipeline CI/CD

### GitHub Actions para Deploy Automático:

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm run build
      - uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID}}
          vercel-project-id: ${{ secrets.PROJECT_ID}}
          vercel-args: '--prod'

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Railway
        run: |
          npm install -g railway
          railway up
```

---

## 💰 Custos Estimados

### Setup Inicial (Gratuito):
- **Vercel**: Free tier (100GB bandwidth)
- **Railway**: $5/mês (500h + PostgreSQL)
- **Supabase**: Free tier (500MB database)

### Produção Pequena/Média:
- **Frontend (Vercel Pro)**: $20/mês
- **Backend (Railway Pro)**: $20/mês
- **Database (Railway)**: Incluído
- **Domínio**: $10-15/ano
- **Total**: ~$40-50/mês

### Produção Grande:
- **Frontend (Vercel Enterprise)**: Custom
- **Backend (AWS/GCP)**: $100-500/mês
- **Database (RDS/Cloud SQL)**: $50-200/mês
- **CDN (Cloudflare)**: $20-200/mês
- **Total**: $200-1000/mês

---

## 📞 Próximos Passos

1. ✅ Criar repositório no GitHub
2. ✅ Configurar backend completo
3. ✅ Rodar migrations do Prisma
4. ✅ Deploy do frontend na Vercel
5. ✅ Deploy do backend no Railway
6. ✅ Conectar banco de dados
7. ✅ Configurar variáveis de ambiente
8. ✅ Testar endpoints da API
9. ✅ Configurar domínio customizado
10. ✅ Implementar monitoramento

---

## 📚 Documentação Adicional

- [Prisma Docs](https://www.prisma.io/docs)
- [Railway Docs](https://docs.railway.app)
- [Vercel Docs](https://vercel.com/docs)
- [PostgreSQL Docs](https://www.postgresql.org/docs)

---

**Desenvolvido com ❤️ para clínicas de estética**
