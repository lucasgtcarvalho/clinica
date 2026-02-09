#!/bin/bash

# =============================================================================
# Script de Instalação Rápida - Estetica Pro na VPS Integrator
# =============================================================================
# Uso: curl -fsSL https://seu-dominio.com/install.sh | sudo bash
# =============================================================================

set -e

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║           🚀 ESTETICA PRO - INSTALAÇÃO RÁPIDA              ║"
echo "║                   VPS Integrator                           ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Verificar root
if [[ $EUID -ne 0 ]]; then
    echo -e "${RED}❌ Execute como root: sudo bash install.sh${NC}"
    exit 1
fi

# Solicitar informações
echo ""
echo -e "${YELLOW}📋 Informações necessárias:${NC}"
echo ""

read -p "Domínio (ex: clinica.seudominio.com.br): " DOMAIN
read -p "Email para SSL (ex: admin@seudominio.com.br): " SSL_EMAIL
read -p "URL do repositório Git: " REPO_URL

echo ""
echo -e "${BLUE}🔧 Iniciando instalação...${NC}"
echo ""

# 1. Atualizar sistema
echo -e "${BLUE}[1/10] Atualizando sistema...${NC}"
apt update && apt upgrade -y > /dev/null 2>&1

# 2. Instalar dependências
echo -e "${BLUE}[2/10] Instalando dependências...${NC}"
apt install -y curl wget git nano ufw fail2ban > /dev/null 2>&1

# 3. Configurar timezone
echo -e "${BLUE}[3/10] Configurando timezone...${NC}"
timedatectl set-timezone America/Sao_Paulo

# 4. Configurar firewall
echo -e "${BLUE}[4/10] Configurando firewall...${NC}"
ufw default deny incoming > /dev/null 2>&1
ufw default allow outgoing > /dev/null 2>&1
ufw allow 22/tcp > /dev/null 2>&1
ufw allow 80/tcp > /dev/null 2>&1
ufw allow 443/tcp > /dev/null 2>&1
echo "y" | ufw enable > /dev/null 2>&1

# 5. Instalar Docker
echo -e "${BLUE}[5/10] Instalando Docker...${NC}"
apt install -y ca-certificates curl gnupg > /dev/null 2>&1
install -m 0755 -d /etc/apt/keyrings > /dev/null 2>&1
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg > /dev/null 2>&1
chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch="$(dpkg --print-architecture)" signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu "$(. /etc/os-release && echo "$VERSION_CODENAME")" stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null 2>&1
apt update > /dev/null 2>&1
apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin > /dev/null 2>&1
systemctl enable docker > /dev/null 2>&1

# 6. Criar usuário
echo -e "${BLUE}[6/10] Criando usuário estetica...${NC}"
useradd -m -s /bin/bash estetica 2>/dev/null || true
usermod -aG sudo estetica
usermod -aG docker estetica
echo "estetica ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/estetica

# 7. Criar diretórios
echo -e "${BLUE}[7/10] Criando estrutura de diretórios...${NC}"
mkdir -p /home/estetica/apps
mkdir -p /home/estetica/backups
mkdir -p /home/estetica/logs
mkdir -p /home/estetica/scripts
chown -R estetica:estetica /home/estetica

# 8. Clonar repositório
echo -e "${BLUE}[8/10] Clonando repositório...${NC}"
cd /home/estetica/apps
sudo -u estetica git clone $REPO_URL estetica-pro 2>/dev/null || sudo -u estetica git -C estetica-pro pull

# 9. Configurar variáveis de ambiente
echo -e "${BLUE}[9/10] Configurando ambiente...${NC}"
cd /home/estetica/apps/estetica-pro/backend
JWT_SECRET=$(openssl rand -base64 32)

cat > .env << EOF
NODE_ENV=production
PORT=3000
DATABASE_URL="postgresql://estetica_user:estetica_pass_$(openssl rand -hex 8)@db:5432/estetica_db?schema=public"
JWT_SECRET="$JWT_SECRET"
JWT_EXPIRES_IN=7d
FRONTEND_URL=https://$DOMAIN
EOF

chown estetica:estetica .env

# 10. Iniciar aplicação
echo -e "${BLUE}[10/10] Iniciando aplicação...${NC}"
cd /home/estetica/apps/estetica-pro
docker compose -f docker-compose.prod.yml up -d --build > /dev/null 2>&1

# Aguardar containers
sleep 10

# Verificar status
if docker ps | grep -q "estetica-backend"; then
    echo ""
    echo -e "${GREEN}"
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║                                                            ║"
    echo "║           ✅ INSTALAÇÃO CONCLUÍDA COM SUCESSO!             ║"
    echo "║                                                            ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo -e "${NC}"
    echo ""
    echo -e "${GREEN}🌐 Acesse sua aplicação:${NC}"
    echo "   http://$DOMAIN"
    echo ""
    echo -e "${YELLOW}📋 Próximos passos:${NC}"
    echo "   1. Configure o DNS apontando $DOMAIN para este servidor"
    echo "   2. Execute: certbot --nginx -d $DOMAIN"
    echo "   3. Acesse o sistema e complete o cadastro inicial"
    echo ""
    echo -e "${BLUE}🔧 Comandos úteis:${NC}"
    echo "   Ver logs:    docker logs estetica-backend"
    echo "   Reiniciar:   docker compose -f docker-compose.prod.yml restart"
    echo "   Atualizar:   cd /home/estetica/apps/estetica-pro && git pull"
    echo ""
    echo -e "${BLUE}📁 Diretórios importantes:${NC}"
    echo "   Aplicação:   /home/estetica/apps/estetica-pro"
    echo "   Backups:     /home/estetica/backups"
    echo "   Logs:        /home/estetica/logs"
    echo ""
else
    echo -e "${RED}"
    echo "❌ Algo deu errado. Verifique os logs:"
    echo "   docker logs estetica-backend"
    echo "   docker logs estetica-db"
    echo -e "${NC}"
    exit 1
fi
