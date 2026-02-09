#!/bin/bash

# =============================================================================
# Script de Health Check - Estetica Pro
# Verifica saúde dos serviços e envia alertas
# =============================================================================

# Configurações
APP_NAME="Estetica Pro"
LOG_FILE="/home/estetica/logs/health-check.log"
APP_DIR="/home/estetica/apps/estetica-pro"
ALERT_EMAIL="admin@seudominio.com.br"  # Configure seu email
WEBHOOK_URL=""  # Opcional: URL para webhook (Slack, Discord, etc.)

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Data
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# Função de log
log() {
    echo "[$DATE] $1" | tee -a $LOG_FILE
}

# Criar diretório de logs se não existir
mkdir -p $(dirname $LOG_FILE)

# Contador de erros
ERRORS=0

# =============================================================================
# VERIFICAÇÕES
# =============================================================================

echo "=========================================="
echo "  Health Check - $APP_NAME"
echo "  $DATE"
echo "=========================================="

# 1. Verificar se containers estão rodando
echo ""
echo "🔍 Verificando containers..."

CONTAINERS=("estetica-backend" "estetica-db" "estetica-nginx")
for container in "${CONTAINERS[@]}"; do
    if docker ps | grep -q "$container"; then
        echo -e "${GREEN}✅ $container está rodando${NC}"
    else
        echo -e "${RED}❌ $container está PARADO${NC}"
        log "ERRO: Container $container está parado"
        ERRORS=$((ERRORS + 1))
        
        # Tentar reiniciar
        echo "🔄 Tentando reiniciar $container..."
        cd $APP_DIR
        docker compose -f docker-compose.prod.yml up -d $container
        sleep 5
        
        if docker ps | grep -q "$container"; then
            echo -e "${GREEN}✅ $container reiniciado com sucesso${NC}"
            log "INFO: $container reiniciado com sucesso"
        else
            echo -e "${RED}❌ Falha ao reiniciar $container${NC}"
            log "CRÍTICO: Falha ao reiniciar $container"
        fi
    fi
done

# 2. Verificar conectividade do backend
echo ""
echo "🔍 Verificando backend..."

if curl -sf http://localhost:3000/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend respondendo${NC}"
else
    echo -e "${RED}❌ Backend não responde${NC}"
    log "ERRO: Backend não está respondendo na porta 3000"
    ERRORS=$((ERRORS + 1))
fi

# 3. Verificar banco de dados
echo ""
echo "🔍 Verificando banco de dados..."

if docker exec estetica-db pg_isready -U estetica_user > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Banco de dados está aceitando conexões${NC}"
else
    echo -e "${RED}❌ Banco de dados não responde${NC}"
    log "ERRO: PostgreSQL não está respondendo"
    ERRORS=$((ERRORS + 1))
fi

# 4. Verificar espaço em disco
echo ""
echo "🔍 Verificando espaço em disco..."

DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 90 ]; then
    echo -e "${RED}❌ CRÍTICO: Disco com ${DISK_USAGE}% de uso!${NC}"
    log "CRÍTICO: Disco com ${DISK_USAGE}% de uso"
    ERRORS=$((ERRORS + 1))
elif [ "$DISK_USAGE" -gt 80 ]; then
    echo -e "${YELLOW}⚠️  AVISO: Disco com ${DISK_USAGE}% de uso${NC}"
    log "AVISO: Disco com ${DISK_USAGE}% de uso"
else
    echo -e "${GREEN}✅ Disco com ${DISK_USAGE}% de uso${NC}"
fi

# 5. Verificar uso de memória
echo ""
echo "🔍 Verificando memória..."

MEMORY_INFO=$(free | grep Mem)
MEMORY_TOTAL=$(echo $MEMORY_INFO | awk '{print $2}')
MEMORY_USED=$(echo $MEMORY_INFO | awk '{print $3}')
MEMORY_USAGE=$((MEMORY_USED * 100 / MEMORY_TOTAL))

if [ "$MEMORY_USAGE" -gt 90 ]; then
    echo -e "${RED}❌ CRÍTICO: Memória com ${MEMORY_USAGE}% de uso!${NC}"
    log "CRÍTICO: Memória com ${MEMORY_USAGE}% de uso"
    ERRORS=$((ERRORS + 1))
elif [ "$MEMORY_USAGE" -gt 80 ]; then
    echo -e "${YELLOW}⚠️  AVISO: Memória com ${MEMORY_USAGE}% de uso${NC}"
    log "AVISO: Memória com ${MEMORY_USAGE}% de uso"
else
    echo -e "${GREEN}✅ Memória com ${MEMORY_USAGE}% de uso${NC}"
fi

# 6. Verificar carga do sistema
echo ""
echo "🔍 Verificando carga do sistema..."

LOAD=$(uptime | awk -F'load average:' '{print $2}' | awk '{print $1}' | sed 's/,//')
CPU_CORES=$(nproc)
LOAD_PERCENT=$(echo "$LOAD * 100 / $CPU_CORES" | bc)

if [ "$LOAD_PERCENT" -gt 90 ]; then
    echo -e "${RED}❌ CRÍTICO: Carga do sistema em ${LOAD}%${NC}"
    log "CRÍTICO: Carga do sistema em ${LOAD}%"
    ERRORS=$((ERRORS + 1))
elif [ "$LOAD_PERCENT" -gt 70 ]; then
    echo -e "${YELLOW}⚠️  AVISO: Carga do sistema em ${LOAD}%${NC}"
    log "AVISO: Carga do sistema em ${LOAD}%"
else
    echo -e "${GREEN}✅ Carga do sistema em ${LOAD}%${NC}"
fi

# 7. Verificar certificado SSL
echo ""
echo "🔍 Verificando certificado SSL..."

if command -v certbot &> /dev/null; then
    CERT_DAYS=$(certbot certificates 2>/dev/null | grep "VALID:" | head -1 | grep -oP '\d+' | head -1)
    
    if [ -n "$CERT_DAYS" ]; then
        if [ "$CERT_DAYS" -lt 7 ]; then
            echo -e "${RED}❌ CRÍTICO: Certificado expira em ${CERT_DAYS} dias!${NC}"
            log "CRÍTICO: Certificado SSL expira em ${CERT_DAYS} dias"
            ERRORS=$((ERRORS + 1))
        elif [ "$CERT_DAYS" -lt 30 ]; then
            echo -e "${YELLOW}⚠️  AVISO: Certificado expira em ${CERT_DAYS} dias${NC}"
            log "AVISO: Certificado SSL expira em ${CERT_DAYS} dias"
        else
            echo -e "${GREEN}✅ Certificado válido por ${CERT_DAYS} dias${NC}"
        fi
    else
        echo -e "${YELLOW}⚠️  Não foi possível verificar o certificado${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Certbot não instalado${NC}"
fi

# 8. Verificar último backup
echo ""
echo "🔍 Verificando último backup..."

BACKUP_DIR="/home/estetica/backups"
if [ -d "$BACKUP_DIR" ]; then
    LATEST_BACKUP=$(ls -t $BACKUP_DIR/db_*.sql.gz 2>/dev/null | head -1)
    
    if [ -n "$LATEST_BACKUP" ]; then
        BACKUP_AGE=$(( ($(date +%s) - $(stat -c %Y "$LATEST_BACKUP")) / 86400 ))
        
        if [ "$BACKUP_AGE" -gt 2 ]; then
            echo -e "${RED}❌ AVISO: Último backup tem ${BACKUP_AGE} dias${NC}"
            log "AVISO: Último backup tem ${BACKUP_AGE} dias"
        else
            echo -e "${GREEN}✅ Último backup há ${BACKUP_AGE} dia(s)${NC}"
        fi
    else
        echo -e "${RED}❌ Nenhum backup encontrado!${NC}"
        log "ERRO: Nenhum backup encontrado"
        ERRORS=$((ERRORS + 1))
    fi
else
    echo -e "${RED}❌ Diretório de backups não existe!${NC}"
    log "ERRO: Diretório de backups não existe"
    ERRORS=$((ERRORS + 1))
fi

# =============================================================================
# RESUMO E ALERTAS
# =============================================================================

echo ""
echo "=========================================="
echo "  RESUMO"
echo "=========================================="

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ Todos os serviços estão saudáveis!${NC}"
    log "INFO: Health check concluído - Todos os serviços OK"
    exit 0
else
    echo -e "${RED}❌ $ERRORS problema(s) encontrado(s)!${NC}"
    log "ALERTA: Health check concluído - $ERRORS problemas encontrados"
    
    # Enviar alerta (se email configurado)
    if [ -n "$ALERT_EMAIL" ] && [ "$ALERT_EMAIL" != "admin@seudominio.com.br" ]; then
        echo "📧 Enviando alerta por email..."
        echo "Alerta de saúde - $APP_NAME

$ERRORS problema(s) detectados em $DATE.

Verifique os logs em: $LOG_FILE

Containers:
$(docker ps --format "table {{.Names}}\t{{.Status}}")

Uso de recursos:
Disco: ${DISK_USAGE}%
Memória: ${MEMORY_USAGE}%
Carga: ${LOAD}%" | mail -s "🚨 Alerta: $APP_NAME - $ERRORS problemas" $ALERT_EMAIL 2>/dev/null || echo "⚠️  Falha ao enviar email"
    fi
    
    # Enviar webhook (se configurado)
    if [ -n "$WEBHOOK_URL" ]; then
        echo "📤 Enviando alerta para webhook..."
        curl -X POST -H "Content-Type: application/json" \
            -d "{\"text\":\"🚨 Alerta $APP_NAME: $ERRORS problemas detectados\"}" \
            $WEBHOOK_URL 2>/dev/null || echo "⚠️  Falha ao enviar webhook"
    fi
    
    exit 1
fi
