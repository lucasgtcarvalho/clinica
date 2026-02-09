# 🚀 Deploy na VPS Integrator - Guia Completo

## 📋 Índice
1. [Pré-requisitos](#pré-requisitos)
2. [Acesso à VPS](#acesso-à-vps)
3. [Configuração Inicial](#configuração-inicial)
4. [Instalação do Docker](#instalação-do-docker)
5. [Deploy da Aplicação](#deploy-da-aplicação)
6. [Configuração do SSL (HTTPS)](#configuração-do-ssl-https)
7. [Backup Automático](#backup-automático)
8. [Monitoramento](#monitoramento)
9. [Troubleshooting](#troubleshooting)

---

## 📋 Pré-requisitos

### O que você precisa:
- ✅ Conta ativa na [Integrator](https://www.integrator.com.br/)
- ✅ VPS Linux contratada (recomendado: Ubuntu 22.04 LTS)
- ✅ Acesso SSH (IP, usuário e senha/chave)
- ✅ Domínio configurado apontando para o IP da VPS
- ✅ Git instalado localmente

### Especificações Mínimas Recomendadas:
```
CPU: 2 vCores
RAM: 4 GB
Disco: 50 GB SSD
Banda: 100 Mbps
Sistema: Ubuntu 22.04 LTS
```

---

## 🔑 Acesso à VPS

### 1. Obter Credenciais
Após contratar a VPS na Integrator, você receberá:
- IP do servidor
- Usuário root (ou usuário com sudo)
- Senha ou chave SSH

### 2. Acessar via Terminal (Linux/Mac)
```bash
# Com senha
ssh root@SEU_IP_DA_VPS

# Com chave SSH
ssh -i caminho/para/sua/chave.pem root@SEU_IP_DA_VPS
```

### 3. Acessar via Windows (PuTTY)
1. Baixe o [PuTTY](https://www.putty.org/)
2. Host Name: `SEU_IP_DA_VPS`
3. Port: `22`
4. Connection Type: `SSH`
5. Click "Open"
6. Login: `root`
7. Password: `sua_senha`

---

## ⚙️ Configuração Inicial

### 1. Atualizar o Sistema
```bash
# Conectar na VPS
ssh root@SEU_IP_DA_VPS

# Atualizar pacotes
apt update && apt upgrade -y

# Instalar ferramentas essenciais
apt install -y curl wget git nano htop ufw fail2ban
```

### 2. Criar Usuário Não-Root (Segurança)
```bash
# Criar usuário
adduser estetica

# Adicionar ao grupo sudo
usermod -aG sudo estetica

# Configurar sudo sem senha (opcional, para automação)
echo "estetica ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

# Trocar para o novo usuário
su - estetica
```

### 3. Configurar Firewall (UFW)
```bash
# Como root ou com sudo
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Permitir SSH
sudo ufw allow 22/tcp

# Permitir HTTP e HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Permitir portas da aplicação (se necessário)
sudo ufw allow 3000/tcp
sudo ufw allow 5432/tcp  # PostgreSQL (apenas se exposto)

# Ativar firewall
sudo ufw enable

# Verificar status
sudo ufw status
```

### 4. Configurar Timezone
```bash
# Definir timezone para São Paulo
sudo timedatectl set-timezone America/Sao_Paulo

# Verificar
timedatectl
```

---

## 🐳 Instalação do Docker

### 1. Instalar Docker
```bash
# Remover versões antigas
sudo apt remove docker docker-engine docker.io containerd runc

# Instalar dependências
sudo apt install -y ca-certificates curl gnupg lsb-release

# Adicionar chave GPG oficial do Docker
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Configurar repositório
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Verificar instalação
sudo docker --version
sudo docker compose version
```

### 2. Configurar Docker para Usuário Não-Root
```bash
# Adicionar usuário ao grupo docker
sudo usermod -aG docker $USER

# Aplicar mudanças (fazer logout e login novamente)
newgrp docker

# Testar
docker ps
```

### 3. Habilitar Docker no Boot
```bash
sudo systemctl enable docker
sudo systemctl start docker
```

---

## 📦 Deploy da Aplicação

### 1. Clonar o Repositório
```bash
# Criar diretório da aplicação
mkdir -p ~/apps
cd ~/apps

# Clonar o projeto (substitua pela sua URL)
git clone https://github.com/seu-usuario/estetica-pro.git

# Entrar no diretório
cd estetica-pro
```

### 2. Configurar Variáveis de Ambiente
```bash
# Backend
cd backend
cp .env.example .env

# Editar o arquivo .env
nano .env
```

**Configure no arquivo `.env`:**
```env
# Ambiente
NODE_ENV=production
PORT=3000

# Banco de Dados
DATABASE_URL="postgresql://estetica_user:SUA_SENHA_FORTE@db:5432/estetica_db?schema=public"

# JWT
JWT_SECRET="$(openssl rand -base64 32)"
JWT_EXPIRES_IN=7d

# Frontend URL
FRONTEND_URL=https://seu-dominio.com.br

# Email (opcional - configure depois)
# SMTP_HOST=smtp.gmail.com
# SMTP_PORT=587
# SMTP_USER=seu-email@gmail.com
# SMTP_PASS=sua-senha-app

# WhatsApp (opcional - configure depois)
# WHATSAPP_API_KEY=sua-chave-api
```

### 3. Configurar Nginx (Reverse Proxy)
```bash
# Criar diretório de configuração do nginx
mkdir -p nginx/conf.d
```

Criar arquivo `nginx/conf.d/default.conf`:
```nginx
upstream backend {
    server backend:3000;
}

upstream frontend {
    server frontend:80;
}

server {
    listen 80;
    server_name seu-dominio.com.br www.seu-dominio.com.br;
    
    # Redirecionar HTTP para HTTPS (depois de configurar SSL)
    # return 301 https://$server_name$request_uri;
    
    # Logs
    access_log /var/log/nginx/estetica-access.log;
    error_log /var/log/nginx/estetica-error.log;

    # Frontend
    location / {
        proxy_pass http://frontend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # API Backend
    location /api {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # WebSocket (para notificações em tempo real)
    location /socket.io {
        proxy_pass http://backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Tamanho máximo de upload
    client_max_body_size 50M;
}

# Configuração HTTPS (descomentar após configurar SSL)
# server {
#     listen 443 ssl http2;
#     server_name seu-dominio.com.br www.seu-dominio.com.br;
#     
#     ssl_certificate /etc/letsencrypt/live/seu-dominio.com.br/fullchain.pem;
#     ssl_certificate_key /etc/letsencrypt/live/seu-dominio.com.br/privkey.pem;
#     
#     include /etc/letsencrypt/options-ssl-nginx.conf;
#     ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;
#     
#     location / {
#         proxy_pass http://frontend;
#         proxy_http_version 1.1;
#         proxy_set_header Upgrade $http_upgrade;
#         proxy_set_header Connection 'upgrade';
#         proxy_set_header Host $host;
#         proxy_set_header X-Real-IP $remote_addr;
#         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
#         proxy_set_header X-Forwarded-Proto $scheme;
#         proxy_cache_bypass $http_upgrade;
#     }
#     
#     location /api {
#         proxy_pass http://backend;
#         proxy_http_version 1.1;
#         proxy_set_header Upgrade $http_upgrade;
#         proxy_set_header Connection 'upgrade';
#         proxy_set_header Host $host;
#         proxy_set_header X-Real-IP $remote_addr;
#         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
#         proxy_set_header X-Forwarded-Proto $scheme;
#         proxy_cache_bypass $http_upgrade;
#     }
# }
```

### 4. Iniciar a Aplicação
```bash
# Voltar para a raiz do projeto
cd ~/apps/estetica-pro

# Criar redes e volumes
docker network create estetica-network 2>/dev/null || true

# Construir e iniciar os containers
docker compose -f docker-compose.prod.yml up -d --build

# Verificar logs
docker compose -f docker-compose.prod.yml logs -f

# Verificar status dos containers
docker ps
```

### 5. Verificar se está funcionando
```bash
# Testar backend
curl http://localhost:3000/api/health

# Ver logs do backend
docker logs estetica-backend

# Ver logs do frontend
docker logs estetica-frontend

# Ver logs do banco
docker logs estetica-db
```

---

## 🔒 Configuração do SSL (HTTPS)

### 1. Instalar Certbot
```bash
# Instalar snapd
sudo apt install -y snapd

# Instalar certbot
sudo snap install --classic certbot

# Criar link simbólico
sudo ln -s /snap/bin/certbot /usr/bin/certbot
```

### 2. Obter Certificado SSL
```bash
# Parar o nginx container temporariamente
docker stop estetica-nginx

# Obter certificado
sudo certbot certonly --standalone -d seu-dominio.com.br -d www.seu-dominio.com.br

# Preencha seu email
# Aceite os termos
# Escolha se deseja compartilhar email (N)

# Verificar certificado
sudo ls -la /etc/letsencrypt/live/seu-dominio.com.br/
```

### 3. Configurar Auto-Renovação
```bash
# Testar renovação automática
sudo certbot renew --dry-run

# O certbot já configura o cron automaticamente
# Verificar: sudo cat /etc/cron.d/certbot
```

### 4. Atualizar Nginx para HTTPS
```bash
# Editar configuração do nginx
nano nginx/conf.d/default.conf

# Descomentar a seção HTTPS
# Comentar o redirecionamento de HTTP para HTTPS na seção :80

# Reiniciar containers
docker compose -f docker-compose.prod.yml restart nginx
```

---

## 💾 Backup Automático

### 1. Criar Script de Backup
```bash
# Criar diretório de scripts
mkdir -p ~/scripts
cd ~/scripts

# Criar script de backup
nano backup.sh
```

Conteúdo do `backup.sh`:
```bash
#!/bin/bash

# Configurações
BACKUP_DIR="/home/estetica/backups"
DB_CONTAINER="estetica-db"
DB_NAME="estetica_db"
DB_USER="estetica_user"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Criar diretório de backup
mkdir -p $BACKUP_DIR

# Backup do banco de dados
echo "Iniciando backup do banco de dados..."
docker exec $DB_CONTAINER pg_dump -U $DB_USER $DB_NAME | gzip > $BACKUP_DIR/db_backup_$DATE.sql.gz

# Backup dos uploads
echo "Iniciando backup dos arquivos..."
tar -czf $BACKUP_DIR/uploads_backup_$DATE.tar.gz -C /home/estetica/apps/estetica-pro/backend uploads

# Remover backups antigos
echo "Removendo backups antigos..."
find $BACKUP_DIR -name "db_backup_*.sql.gz" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "uploads_backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete

# Log
echo "Backup concluído em $DATE"
echo "Arquivos:"
ls -lh $BACKUP_DIR/*$DATE*
```

### 2. Tornar Executável e Agendar
```bash
# Tornar executável
chmod +x ~/scripts/backup.sh

# Testar
~/scripts/backup.sh

# Agendar no cron (todo dia às 2h da manhã)
crontab -e

# Adicionar linha:
0 2 * * * /home/estetica/scripts/backup.sh >> /home/estetica/logs/backup.log 2>&1
```

### 3. Backup para Nuvem (Opcional - AWS S3)
```bash
# Instalar AWS CLI
sudo apt install -y awscli

# Configurar AWS
aws configure

# Adicionar ao script de backup:
# aws s3 sync /home/estetica/backups s3://seu-bucket-backup/estetica/
```

---

## 📊 Monitoramento

### 1. Instalar Monitor de Recursos
```bash
# Instalar Netdata (monitoramento em tempo real)
bash <(curl -Ss https://my-netdata.io/kickstart.sh)

# Acessar: http://SEU_IP:19999
```

### 2. Configurar Alertas
```bash
# Criar script de verificação de saúde
nano ~/scripts/health-check.sh
```

```bash
#!/bin/bash

# Verificar se containers estão rodando
if ! docker ps | grep -q "estetica-backend"; then
    echo "Backend fora do ar!" | mail -s "Alerta Estetica Pro" admin@seu-dominio.com.br
    docker compose -f /home/estetica/apps/estetica-pro/docker-compose.prod.yml restart backend
fi

# Verificar espaço em disco
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 85 ]; then
    echo "Disco com $DISK_USAGE% de uso!" | mail -s "Alerta Disco Estetica Pro" admin@seu-dominio.com.br
fi
```

### 3. Dashboard de Monitoramento
```bash
# Instalar Portainer (gerenciamento Docker)
docker volume create portainer_data
docker run -d -p 8000:8000 -p 9443:9443 --name portainer \
    --restart=always \
    -v /var/run/docker.sock:/var/run/docker.sock \
    -v portainer_data:/data \
    portainer/portainer-ce:latest

# Acessar: https://SEU_IP:9443
```

---

## 🔄 Atualização da Aplicação

### 1. Atualizar Código
```bash
cd ~/apps/estetica-pro

# Puxar atualizações
git pull origin main

# Reconstruir e reiniciar
docker compose -f docker-compose.prod.yml down
docker compose -f docker-compose.prod.yml up -d --build

# Limpar imagens antigas
docker image prune -f
```

### 2. Rollback (Se necessário)
```bash
# Voltar para versão anterior
git log --oneline  # ver commits
git checkout COMMIT_ANTERIOR

# Reconstruir
docker compose -f docker-compose.prod.yml up -d --build
```

---

## 🐛 Troubleshooting

### Problema: Containers não iniciam
```bash
# Ver logs detalhados
docker compose -f docker-compose.prod.yml logs

# Verificar erros específicos
docker logs estetica-backend
docker logs estetica-db

# Verificar portas em uso
sudo netstat -tulpn | grep :3000
sudo netstat -tulpn | grep :5432
```

### Problema: Banco de dados não conecta
```bash
# Verificar se container está rodando
docker ps | grep db

# Acessar banco manualmente
docker exec -it estetica-db psql -U estetica_user -d estetica_db

# Verificar variáveis de ambiente
docker exec estetica-backend env | grep DATABASE
```

### Problema: Frontend não carrega
```bash
# Verificar build
docker logs estetica-frontend

# Reconstruir frontend
docker compose -f docker-compose.prod.yml build frontend
docker compose -f docker-compose.prod.yml up -d frontend
```

### Problema: Certificado SSL expirado
```bash
# Renovar manualmente
sudo certbot renew

# Reiniciar nginx
docker compose -f docker-compose.prod.yml restart nginx
```

### Problema: Espaço em disco cheio
```bash
# Verificar uso
df -h

# Limpar Docker
docker system prune -a -f
docker volume prune -f

# Limpar logs
sudo truncate -s 0 /var/log/nginx/*.log
docker logs --tail 100 estetica-backend
```

---

## 📞 Suporte Integrator

Se encontrar problemas com a VPS:
- **Central de Ajuda**: https://www.integrator.com.br/suporte
- **Email**: suporte@integrator.com.br
- **Telefone**: Verificar no painel do cliente

---

## ✅ Checklist de Deploy

- [ ] VPS contratada e acessível
- [ ] Domínio configurado apontando para o IP
- [ ] Docker instalado e funcionando
- [ ] Repositório clonado na VPS
- [ ] Variáveis de ambiente configuradas
- [ ] Containers construídos e rodando
- [ ] Banco de dados inicializado
- [ ] SSL/HTTPS configurado
- [ ] Backup automático agendado
- [ ] Monitoramento configurado
- [ ] Testes de acesso realizados
- [ ] Documentação entregue ao cliente

---

**🎉 Parabéns! Seu sistema está em produção!**
