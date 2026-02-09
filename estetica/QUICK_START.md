# ⚡ Guia Rápido de Deploy - EstéticaFlow

Este guia te ajudará a colocar o sistema em produção em **menos de 30 minutos**.

---

## 🎯 Opção 1: Deploy Rápido (Recomendado para Iniciantes)

### Frontend na Vercel + Backend no Railway

### **PASSO 1: Preparar o Repositório**

```bash
# Criar repositório no GitHub
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/seu-usuario/estetica-flow.git
git push -u origin main
```

---

### **PASSO 2: Deploy do Backend (Railway)**

1. **Acesse:** https://railway.app
2. **Clique em:** "New Project"
3. **Selecione:** "Deploy from GitHub repo"
4. **Escolha:** Seu repositório
5. **Configure o caminho:** 
   - Root Directory: `/backend`
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Start Command: `npm start`

6. **Adicione PostgreSQL:**
   - Clique em "New" → "Database" → "PostgreSQL"
   - Railway gerará automaticamente a `DATABASE_URL`

7. **Adicione variáveis de ambiente:**

```env
NODE_ENV=production
PORT=3000
JWT_SECRET=seu-super-secret-muito-seguro-aqui-mudar-isso
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://seu-app.vercel.app
```

8. **Execute as migrations:**
   - Vá em "Settings" → "Deploy"
   - Adicione comando de deploy: `npx prisma migrate deploy`

9. **Copie a URL do backend:** `https://seu-backend.railway.app`

---

### **PASSO 3: Deploy do Frontend (Vercel)**

1. **Acesse:** https://vercel.com
2. **Clique em:** "New Project"
3. **Importe:** Seu repositório do GitHub
4. **Configure:**
   - Framework Preset: Vite
   - Root Directory: `/` (raiz do projeto)
   - Build Command: `npm run build`
   - Output Directory: `dist`

5. **Adicione variável de ambiente:**

```env
VITE_API_URL=https://seu-backend.railway.app/api/v1
```

6. **Deploy!** - Clique em "Deploy"

7. **Copie a URL:** `https://seu-app.vercel.app`

8. **Volte no Railway** e atualize a variável `FRONTEND_URL` com a URL do Vercel

---

### **PASSO 4: Configurar Domínio (Opcional)**

#### No Vercel (Frontend):
1. Settings → Domains
2. Adicione seu domínio: `app.suaclinica.com.br`
3. Configure o DNS conforme instruções

#### No Railway (Backend):
1. Settings → Networking
2. Generate Domain ou adicione domínio customizado
3. Use: `api.suaclinica.com.br`

---

## 🎯 Opção 2: Deploy Completo (Render)

### **Frontend e Backend no Render**

### **PASSO 1: Deploy do Backend**

1. **Acesse:** https://render.com
2. **New** → **Web Service**
3. **Conecte** o repositório GitHub
4. **Configure:**
   - Name: `estetica-backend`
   - Root Directory: `backend`
   - Environment: Node
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Start Command: `npm start`

5. **Adicione PostgreSQL:**
   - **New** → **PostgreSQL**
   - Copie a "Internal Database URL"

6. **Variáveis de ambiente:**

```env
NODE_ENV=production
DATABASE_URL=<internal-database-url-do-render>
JWT_SECRET=seu-secret-aqui
FRONTEND_URL=https://seu-app.onrender.com
```

### **PASSO 2: Deploy do Frontend**

1. **New** → **Static Site**
2. **Configure:**
   - Build Command: `npm run build`
   - Publish Directory: `dist`

3. **Variável de ambiente:**

```env
VITE_API_URL=https://estetica-backend.onrender.com/api/v1
```

---

## 🎯 Opção 3: VPS (Servidor Próprio)

### **Para quem quer controle total**

### **Requisitos:**
- VPS (Contabo, DigitalOcean, AWS, etc)
- Ubuntu 22.04
- Acesso SSH

### **Script de Instalação Automatizada:**

```bash
# Conecte no servidor
ssh root@seu-servidor-ip

# Execute o script de setup
curl -o- https://raw.githubusercontent.com/seu-usuario/estetica-flow/main/scripts/setup-vps.sh | bash
```

---

## 📱 Configurar PWA

Após o deploy, seu app já está configurado como PWA!

**Para testar:**

1. Acesse o site no celular
2. Chrome: Menu → "Adicionar à tela inicial"
3. Safari: Compartilhar → "Adicionar à Tela de Início"

---

## ✅ Checklist Pós-Deploy

- [ ] Backend rodando e acessível
- [ ] Frontend rodando e acessível
- [ ] Banco de dados conectado
- [ ] Migrations executadas
- [ ] CORS configurado corretamente
- [ ] SSL/HTTPS ativo (automático na Vercel/Railway)
- [ ] Criar primeiro usuário admin
- [ ] Testar login
- [ ] Testar criação de cliente
- [ ] Testar criação de agendamento
- [ ] Configurar backup do banco (Railway faz automático no plano Pro)

---

## 🧪 Testar a API

### **1. Registrar primeira clínica:**

```bash
curl -X POST https://seu-backend.railway.app/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "tenantName": "Clínica Exemplo",
    "tenantSlug": "clinica-exemplo",
    "name": "Admin",
    "email": "admin@clinica.com",
    "password": "senha123"
  }'
```

### **2. Fazer login:**

```bash
curl -X POST https://seu-backend.railway.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@clinica.com",
    "password": "senha123"
  }'
```

Você receberá um `token` JWT na resposta.

### **3. Criar um cliente:**

```bash
curl -X POST https://seu-backend.railway.app/api/v1/clients \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \
  -d '{
    "name": "Maria Silva",
    "phone": "(11) 98888-7777",
    "email": "maria@email.com"
  }'
```

---

## 💰 Custos Mensais Estimados

### **Opção 1: Vercel + Railway (Mais barato)**
- Vercel (Frontend): **Grátis** (até 100GB bandwidth)
- Railway (Backend + DB): **$5/mês**
- **Total: ~$5/mês** 💚

### **Opção 2: Render (Simples)**
- Web Service: **$7/mês**
- PostgreSQL: **$7/mês**
- **Total: ~$14/mês**

### **Opção 3: VPS (Controle total)**
- Contabo VPS: **€5/mês (~R$27)**
- **Total: ~R$27/mês**

---

## 🆘 Problemas Comuns

### **Erro: "Cannot connect to database"**
✅ Verifique se a `DATABASE_URL` está correta
✅ Certifique-se que o PostgreSQL está rodando
✅ Execute `npx prisma migrate deploy`

### **Erro: "CORS blocked"**
✅ Configure `FRONTEND_URL` no backend com a URL correta do frontend
✅ Sem barra `/` no final

### **Erro: "JWT malformed"**
✅ Certifique-se que está enviando o header: `Authorization: Bearer TOKEN`
✅ Verifique se `JWT_SECRET` está configurado

### **Frontend não conecta com Backend**
✅ Verifique `VITE_API_URL` no frontend
✅ Teste a URL do backend diretamente no navegador
✅ Verifique se backend está rodando: `https://seu-backend.railway.app/health`

---

## 📊 Monitorar o Sistema

### **Railway Dashboard:**
- Logs em tempo real
- Uso de CPU e memória
- Requisições por segundo

### **Vercel Analytics:**
- Visitantes
- Performance
- Web Vitals

---

## 🔄 Atualizações Automáticas

### **GitHub → Vercel/Railway**

Qualquer push na branch `main` dispara deploy automático! 🚀

```bash
git add .
git commit -m "Nova funcionalidade"
git push origin main
```

---

## 📞 Próximos Passos

1. ✅ **Configurar domínio próprio**
2. ✅ **Adicionar Google Analytics**
3. ✅ **Configurar Sentry para monitoramento de erros**
4. ✅ **Implementar backup automático**
5. ✅ **Adicionar integração com WhatsApp**
6. ✅ **Configurar gateway de pagamento**

---

## 🎉 Pronto!

Seu sistema SaaS está no ar e funcionando!

Acesse: `https://seu-app.vercel.app`

**Primeiro acesso:**
1. Clique em "Registrar"
2. Preencha dados da clínica
3. Crie sua conta de administrador
4. Comece a cadastrar clientes e agendamentos!

---

## 📚 Documentação Completa

- [Guia de Deploy Detalhado](./DEPLOY_GUIDE.md)
- [Documentação da API](./backend/README.md)
- [Prisma Schema](./backend/prisma/schema.prisma)

---

**Dúvidas?** Abra uma issue no GitHub!

**Desenvolvido com ❤️ para clínicas de estética**
