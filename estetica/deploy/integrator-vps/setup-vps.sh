#!/bin/bash

# =============================================================================
# Script de Configuração Inicial da VPS Integrator
# Autor: Estetica Pro
# Data: 2025
# =============================================================================

set -e  # Parar em caso de erro

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variáveis
APP_NAME="estetica-pro"
APP_USER="estetica"
APP_DIR="/home/$APP_USER/apps/$APP_NAME"
DOMAIN=""

# Funções de log
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[AVISO]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERRO]${NC} $1"
}

# Verificar se está rodando como root
check_root() {
    if [[ $EUID -ne 0 ]]; then
        log_error "Este script precisa ser executado como root"
        log_info "Execute: sudo bash setup-vps.sh"
        exit 1
    fi
}

# Solicitar informações
get_user_input() {
    echo ""
    echo "=========================================="
    echo "  Configuração VPS - Estetica Pro"
    echo "=========================================="
    echo ""
    
    read -p "Digite o domínio (ex: clinica.seudominio.com.br): " DOMAIN
    
    if [[ -z "$DOMAIN" ]]; then
        log_error "Domínio é obrigatório"
        exit 1
    fi
    
    echo ""
    log_info "Configurando para o domínio: $DOMAIN"
    echo ""
}

# Atualizar sistema
update_system() {
    log_info "Atualizando sistema..."
    apt update && apt upgrade -y
    log_success "Sistema atualizado"
}

# Instalar dependências básicas
install_base_packages() {
    log_info "Instalando pacotes essenciais..."
    
    apt install -y \
        curl \
        wget \
        git \
        nano \
        vim \
        htop \
        tree \
        unzip \
        software-properties-common \
        apt-transport-https \
        ca-certificates \
        gnupg \
        lsb-release \
        ufw \
        fail2ban \
        cron \
        logrotate
    
    log_success "Pacotes essenciais instalados"
}

# Configurar timezone
setup_timezone() {
    log_info "Configurando timezone..."
    timedatectl set-timezone America/Sao_Paulo
    log_success "Timezone configurado: $(timedatectl | grep "Time zone")"
}

# Configurar swap
setup_swap() {
    log_info "Configurando swap..."
    
    # Verificar se já existe swap
    if swapon --show | grep -q "swap"; then
        log_warning "Swap já existe"
        return
    fi
    
    # Criar swap de 4GB
    fallocate -l 4G /swapfile
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    
    # Persistir no fstab
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    
    # Configurar swappiness
    sysctl vm.swappiness=10
    echo 'vm.swappiness=10' >> /etc/sysctl.conf
    
    log_success "Swap configurado (4GB)"
}

# Configurar firewall
setup_firewall() {
    log_info "Configurando firewall (UFW)..."
    
    ufw default deny incoming
    ufw default allow outgoing
    
    # SSH
    ufw allow 22/tcp
    
    # HTTP e HTTPS
    ufw allow 80/tcp
    ufw allow 443/tcp
    
    # Portainer (opcional)
    ufw allow 9443/tcp
    
    # Netdata (opcional)
    ufw allow 19999/tcp
    
    # Habilitar
    echo "y" | ufw enable
    
    log_success "Firewall configurado"
    ufw status
}

# Configurar Fail2Ban
setup_fail2ban() {
    log_info "Configurando Fail2Ban..."
    
    systemctl enable fail2ban
    systemctl start fail2ban
    
    log_success "Fail2Ban configurado"
}

# Instalar Docker
install_docker() {
    log_info "Instalando Docker..."
    
    # Remover versões antigas
    apt remove -y docker docker-engine docker.io containerd runc 2>/dev/null || true
    
    # Adicionar repositório oficial
    mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" > /etc/apt/sources.list.d/docker.list
    
    apt update
    apt install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin
    
    # Habilitar no boot
    systemctl enable docker
    systemctl start docker
    
    log_success "Docker instalado: $(docker --version)"
}

# Criar usuário da aplicação
create_app_user() {
    log_info "Criando usuário da aplicação..."
    
    if id "$APP_USER" &>/dev/null; then
        log_warning "Usuário $APP_USER já existe"
    else
        useradd -m -s /bin/bash $APP_USER
        usermod -aG sudo $APP_USER
        usermod -aG docker $APP_USER
        
        # Configurar sudo sem senha para automação
        echo "$APP_USER ALL=(ALL) NOPASSWD:ALL" > /etc/sudoers.d/$APP_USER
        chmod 440 /etc/sudoers.d/$APP_USER
        
        log_success "Usuário $APP_USER criado"
    fi
}

# Criar estrutura de diretórios
create_directory_structure() {
    log_info "Criando estrutura de diretórios..."
    
    mkdir -p /home/$APP_USER/apps
    mkdir -p /home/$APP_USER/backups
    mkdir -p /home/$APP_USER/logs
    mkdir -p /home/$APP_USER/scripts
    
    chown -R $APP_USER:$APP_USER /home/$APP_USER
    
    log_success "Estrutura de diretórios criada"
}

# Configurar logrotate
setup_logrotate() {
    log_info "Configurando logrotate..."
    
    cat > /etc/logrotate.d/estetica-pro << EOF
/home/$APP_USER/logs/*.log {
    daily
    rotate 14
    compress
    delaycompress
    missingok
    notifempty
    create 0644 $APP_USER $APP_USER
}
EOF
    
    log_success "Logrotate configurado"
}

# Instalar Certbot
install_certbot() {
    log_info "Instalando Certbot..."
    
    snap install --classic certbot
    ln -sf /snap/bin/certbot /usr/bin/certbot
    
    log_success "Certbot instalado"
}

# Criar script de deploy
create_deploy_script() {
    log_info "Criando script de deploy..."
    
    cat > /home/$APP_USER/scripts/deploy.sh << 'EOF'
#!/bin/bash

# Script de Deploy - Estetica Pro

APP_DIR="/home/estetica/apps/estetica-pro"
BACKUP_DIR="/home/estetica/backups"
DATE=$(date +%Y%m%d_%H%M%S)

echo "=========================================="
echo "  Deploy Estetica Pro"
echo "  Data: $DATE"
echo "=========================================="

# Backup antes do deploy
echo "[1/5] Criando backup..."
mkdir -p $BACKUP_DIR
cd $APP_DIR
docker exec estetica-db pg_dump -U estetica_user estetica_db | gzip > $BACKUP_DIR/pre-deploy-$DATE.sql.gz

# Pull do código
echo "[2/5] Atualizando código..."
git pull origin main

# Down dos containers
echo "[3/5] Parando containers..."
docker compose -f docker-compose.prod.yml down

# Build e up
echo "[4/5] Construindo e iniciando..."
docker compose -f docker-compose.prod.yml up -d --build

# Limpeza
echo "[5/5] Limpando..."
docker system prune -f
docker image prune -f

# Verificação
echo ""
echo "Status dos containers:"
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

echo ""
echo "✅ Deploy concluído com sucesso!"
EOF

    chmod +x /home/$APP_USER/scripts/deploy.sh
    chown -R $APP_USER:$APP_USER /home/$APP_USER/scripts
    
    log_success "Script de deploy criado"
}

# Criar script de backup
create_backup_script() {
    log_info "Criando script de backup..."
    
    cat > /home/$APP_USER/scripts/backup.sh << 'EOF'
#!/bin/bash

# Script de Backup - Estetica Pro

BACKUP_DIR="/home/estetica/backups"
LOG_FILE="/home/estetica/logs/backup.log"
DB_CONTAINER="estetica-db"
DB_NAME="estetica_db"
DB_USER="estetica_user"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Criar diretórios
mkdir -p $BACKUP_DIR
mkdir -p $(dirname $LOG_FILE)

# Função de log
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a $LOG_FILE
}

log "=========================================="
log "Iniciando backup - $DATE"
log "=========================================="

# Verificar se container está rodando
if ! docker ps | grep -q $DB_CONTAINER; then
    log "❌ ERRO: Container $DB_CONTAINER não está rodando"
    exit 1
fi

# Backup do banco
log "[1/3] Backup do banco de dados..."
if docker exec $DB_CONTAINER pg_dump -U $DB_USER $DB_NAME | gzip > $BACKUP_DIR/db_$DATE.sql.gz; then
    log "✅ Backup do banco concluído"
else
    log "❌ ERRO no backup do banco"
    exit 1
fi

# Backup dos uploads
log "[2/3] Backup dos arquivos..."
if tar -czf $BACKUP_DIR/uploads_$DATE.tar.gz -C /home/estetica/apps/estetica-pro/backend uploads 2>/dev/null; then
    log "✅ Backup dos arquivos concluído"
else
    log "⚠️  Aviso: Pasta uploads não encontrada ou vazia"
fi

# Limpar backups antigos
log "[3/3] Limpando backups antigos..."
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +$RETENTION_DAYS -delete
find $BACKUP_DIR -name "uploads_*.tar.gz" -mtime +$RETENTION_DAYS -delete

# Resumo
log "=========================================="
log "Backup concluído!"
log "Arquivos:"
ls -lh $BACKUP_DIR/*$DATE* 2>/dev/null | while read line; do
    log "  $line"
done
log "=========================================="
EOF

    chmod +x /home/$APP_USER/scripts/backup.sh
    chown -R $APP_USER:$APP_USER /home/$APP_USER/scripts
    
    log_success "Script de backup criado"
}

# Configurar cron
setup_cron() {
    log_info "Configurando cron jobs..."
    
    # Crontab para o usuário estetica
    crontab -u $APP_USER << EOF
# Backup diário às 2h da manhã
0 2 * * * /home/$APP_USER/scripts/backup.sh

# Verificação de saúde a cada 5 minutos
*/5 * * * * /home/$APP_USER/scripts/health-check.sh

# Renovação de certificado (duas vezes por dia)
0 12 * * * certbot renew --quiet
30 12 * * * certbot renew --quiet
EOF
    
    log_success "Cron jobs configurados"
}

# Criar script de health check
create_health_check_script() {
    log_info "Criando script de health check..."
    
    cat > /home/$APP_USER/scripts/health-check.sh << 'EOF'
#!/bin/bash

# Health Check - Estetica Pro

LOG_FILE="/home/estetica/logs/health-check.log"
APP_DIR="/home/estetica/apps/estetica-pro"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Função de log
log() {
    echo "[$DATE] $1" >> $LOG_FILE
}

# Verificar backend
if ! docker ps | grep -q "estetica-backend"; then
    log "❌ Backend fora do ar - Reiniciando..."
    cd $APP_DIR
    docker compose -f docker-compose.prod.yml restart backend
fi

# Verificar banco
if ! docker ps | grep -q "estetica-db"; then
    log "❌ Banco de dados fora do ar - Reiniciando..."
    cd $APP_DIR
    docker compose -f docker-compose.prod.yml restart db
fi

# Verificar nginx
if ! docker ps | grep -q "estetica-nginx"; then
    log "❌ Nginx fora do ar - Reiniciando..."
    cd $APP_DIR
    docker compose -f docker-compose.prod.yml restart nginx
fi

# Verificar espaço em disco
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 90 ]; then
    log "⚠️  ALERTA: Disco com ${DISK_USAGE}% de uso!"
    # Limpar logs antigos
    find /home/estetica/logs -name "*.log" -mtime +7 -delete
fi

# Verificar memória
MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100}')
if [ "$MEMORY_USAGE" -gt 90 ]; then
    log "⚠️  ALERTA: Memória com ${MEMORY_USAGE}% de uso!"
fi
EOF

    chmod +x /home/$APP_USER/scripts/health-check.sh
    chown -R $APP_USER:$APP_USER /home/$APP_USER/scripts
    
    log_success "Script de health check criado"
}

# Resumo final
show_summary() {
    echo ""
    echo "=========================================="
    echo "  ✅ CONFIGURAÇÃO CONCLUÍDA!"
    echo "=========================================="
    echo ""
    echo "📋 Resumo:"
    echo "  • Usuário criado: $APP_USER"
    echo "  • Diretório da aplicação: /home/$APP_USER/apps/"
    echo "  • Backups: /home/$APP_USER/backups/"
    echo "  • Logs: /home/$APP_USER/logs/"
    echo "  • Scripts: /home/$APP_USER/scripts/"
    echo ""
    echo "🔧 Próximos passos:"
    echo "  1. Faça login como usuário $APP_USER:"
    echo "     su - $APP_USER"
    echo ""
    echo "  2. Clone o repositório:"
    echo "     git clone https://github.com/seu-usuario/estetica-pro.git"
    echo ""
    echo "  3. Configure as variáveis de ambiente"
    echo ""
    echo "  4. Execute o deploy:"
    echo "     ~/scripts/deploy.sh"
    echo ""
    echo "📚 Documentação completa em:"
    echo "  /home/$APP_USER/apps/estetica-pro/deploy/integrator-vps/README.md"
    echo ""
    echo "⚠️  IMPORTANTE:"
    echo "  • Altere a senha do root: passwd"
    echo "  • Configure o SSH key-based authentication"
    echo "  • Desative login root via SSH em /etc/ssh/sshd_config"
    echo ""
    echo "=========================================="
}

# Função principal
main() {
    echo ""
    echo "=========================================="
    echo "  Setup VPS - Estetica Pro"
    echo "  VPS Integrator"
    echo "=========================================="
    echo ""
    
    check_root
    get_user_input
    
    log_info "Iniciando configuração..."
    
    update_system
    install_base_packages
    setup_timezone
    setup_swap
    setup_firewall
    setup_fail2ban
    install_docker
    create_app_user
    create_directory_structure
    setup_logrotate
    install_certbot
    create_deploy_script
    create_backup_script
    create_health_check_script
    setup_cron
    
    show_summary
}

# Executar
main "$@"
