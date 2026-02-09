# 🚀 Resumo Rápido - Deploy na Integrator

## ⚡ Instalação em 5 Minutos

### 1. Acesse sua VPS Integrator
```bash
ssh root@SEU_IP_DA_VPS
```

### 2. Execute o script de setup
```bash
curl -fsSL https://raw.githubusercontent.com/seu-usuario/estetica-pro/main/deploy/integrator-vps/setup-vps.sh | sudo bash
```

Ou manualmente:
```bash
# Baixar script
wget https://raw.githubusercontent.com/seu-usuario/estetica-pro/main/deploy/integrator-vps/setup-vps.sh

# Executar
sudo bash setup-vps.sh
```

### 3. Faça login como usuário estetica
```bash
su - estetica
```

### 4. Clone o repositório
```bash
cd ~/apps
git clone https://github.com/seu-usuario/estetica-pro.git
cd estetica-pro
```

### 5. Configure o ambiente
```bash
cd backend
cp .env.example .env
nano .env  # Edite suas variáveis
```

### 6. Deploy!
```bash
cd ~/apps/estetica-pro
docker compose -f docker-compose.prod.yml up -d --build
```

### 7. Configure o SSL
```bash
sudo certbot --nginx -d seu-dominio.com.br
```

---

## 📁 Estrutura de Arquivos na VPS

```
/home/estetica/
├── apps/
│   └── estetica-pro/          # Código da aplicação
│       ├── backend/            # API Node.js
│       ├── frontend/           # React build
│       ├── nginx/              # Configurações nginx
│       └── docker-compose.prod.yml
├── backups/                    # Backups automáticos
│   ├── db_20250115_120000.sql.gz
│   └── uploads_20250115_120000.tar.gz
├── logs/                       # Logs da aplicação
│   ├── backup.log
│   └── health-check.log
└── scripts/                    # Scripts de automação
    ├── backup.sh
    ├── deploy.sh
    └── health-check.sh
```

---

## 🎮 Comandos do Dia a Dia

```bash
# Ver status
docker ps

# Ver logs
docker logs -f estetica-backend

# Reiniciar
docker restart estetica-backend

# Atualizar sistema
cd ~/apps/estetica-pro && git pull && docker compose -f docker-compose.prod.yml up -d --build

# Backup manual
~/scripts/backup.sh

# Ver espaço em disco
df -h
```

---

## 🔧 Solução de Problemas Rápida

| Problema | Solução |
|----------|---------|
| Site não carrega | `docker ps` - verificar se containers estão rodando |
| Erro 502 | `docker logs estetica-backend` - verificar API |
| Banco não conecta | `docker restart estetica-db` |
| Sem espaço em disco | `docker system prune -f` |
| Certificado expirado | `sudo certbot renew` |

---

## 📊 URLs Importantes

| Serviço | URL | Descrição |
|---------|-----|-----------|
| Aplicação | https://seu-dominio.com.br | Sistema principal |
| API | https://seu-dominio.com.br/api | Endpoints da API |
| Portainer | https://SEU_IP:9443 | Gerenciamento Docker |
| Netdata | http://SEU_IP:19999 | Monitoramento |

---

## 💰 Custo Mensal Estimado (Integrator)

| Plano | Especificações | Preço Estimado |
|-------|---------------|----------------|
| Básico | 2 vCPU, 4GB RAM, 50GB SSD | R$ 50-80/mês |
| Intermediário | 4 vCPU, 8GB RAM, 100GB SSD | R$ 100-150/mês |
| Avançado | 8 vCPU, 16GB RAM, 200GB SSD | R$ 200-300/mês |

> 💡 **Dica**: Comece com o plano básico e escale conforme necessário!

---

## 📞 Suporte

- **Documentação completa**: `~/apps/estetica-pro/deploy/integrator-vps/README.md`
- **Comandos úteis**: `~/apps/estetica-pro/deploy/integrator-vps/COMANDOS.md`
- **Segurança**: `~/apps/estetica-pro/deploy/integrator-vps/SEGURANCA.md`
- **Suporte Integrator**: suporte@integrator.com.br

---

## ✅ Checklist Pós-Deploy

- [ ] Aplicação acessível no domínio
- [ ] SSL/HTTPS funcionando
- [ ] Login no sistema funcionando
- [ ] Backup automático configurado
- [ ] Email de alerta configurado
- [ ] Monitoramento ativo
- [ ] Segurança revisada
- [ ] Documentação entregue ao cliente

---

**🎉 Pronto para produção!**
