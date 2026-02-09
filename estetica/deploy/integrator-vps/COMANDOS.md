# 📘 Guia de Comandos - VPS Integrator

## 🔐 Acesso à VPS

```bash
# Acessar via SSH
ssh root@SEU_IP_DA_VPS

# Acessar como usuário estetica
ssh estetica@SEU_IP_DA_VPS

# Ou trocar de usuário após login como root
su - estetica
```

---

## 🐳 Docker - Comandos Essenciais

### Verificar Status
```bash
# Listar containers rodando
docker ps

# Listar todos containers (incluindo parados)
docker ps -a

# Ver uso de recursos
docker stats

# Ver logs em tempo real
docker logs -f estetica-backend
docker logs -f estetica-db
docker logs -f estetica-nginx
```

### Gerenciar Containers
```bash
# Parar todos containers
docker compose -f docker-compose.prod.yml down

# Iniciar todos containers
docker compose -f docker-compose.prod.yml up -d

# Reiniciar container específico
docker restart estetica-backend

# Reconstruir e iniciar
docker compose -f docker-compose.prod.yml up -d --build

# Ver logs de todos serviços
docker compose -f docker-compose.prod.yml logs -f
```

### Limpeza
```bash
# Remover containers parados
docker container prune -f

# Remover imagens não utilizadas
docker image prune -f

# Remover volumes não utilizados
docker volume prune -f

# Limpeza completa (CUIDADO!)
docker system prune -a -f
```

---

## 🗄️ Banco de Dados (PostgreSQL)

### Acessar Banco
```bash
# Acessar container do banco
docker exec -it estetica-db psql -U estetica_user -d estetica_db

# Comandos úteis dentro do psql:
\dt                    # Listar tabelas
\d nome_tabela         # Descrever tabela
\q                     # Sair
SELECT * FROM "User";  # Exemplo de query
```

### Backup e Restore
```bash
# Backup manual
docker exec estetica-db pg_dump -U estetica_user estetica_db > backup_$(date +%Y%m%d).sql

# Backup compactado
docker exec estetica-db pg_dump -U estetica_user estetica_db | gzip > backup_$(date +%Y%m%d).sql.gz

# Restore
gunzip < backup_20250115.sql.gz | docker exec -i estetica-db psql -U estetica_user -d estetica_db

# Ou sem compactação
docker exec -i estetica-db psql -U estetica_user -d estetica_db < backup.sql
```

---

## 📁 Navegação e Arquivos

```bash
# Ir para diretório da aplicação
cd ~/apps/estetica-pro

# Ver estrutura de arquivos
tree -L 2

# Ver tamanho dos arquivos
du -sh *

# Ver espaço em disco
df -h

# Ver uso de memória
free -h

# Ver processos
htop
```

---

## 🔄 Atualização da Aplicação

```bash
# 1. Ir para diretório
cd ~/apps/estetica-pro

# 2. Backup do banco
docker exec estetica-db pg_dump -U estetica_user estetica_db | gzip > ~/backups/pre-update-$(date +%Y%m%d-%H%M).sql.gz

# 3. Puxar atualizações
git pull origin main

# 4. Parar containers
docker compose -f docker-compose.prod.yml down

# 5. Reconstruir e iniciar
docker compose -f docker-compose.prod.yml up -d --build

# 6. Verificar status
docker ps
```

---

## 🔒 SSL/Certificado

```bash
# Verificar status do certificado
sudo certbot certificates

# Renovar manualmente
sudo certbot renew

# Testar renovação automática
sudo certbot renew --dry-run

# Forçar renovação
sudo certbot renew --force-renewal

# Ver logs de renovação
sudo cat /var/log/letsencrypt/letsencrypt.log
```

---

## 🔥 Firewall (UFW)

```bash
# Ver status
sudo ufw status

# Ver status detalhado
sudo ufw status verbose

# Permitir porta
sudo ufw allow 8080/tcp

# Bloquear porta
sudo ufw deny 8080/tcp

# Remover regra
sudo ufw delete allow 8080/tcp

# Desabilitar firewall
sudo ufw disable

# Habilitar firewall
sudo ufw enable
```

---

## 💾 Backup

```bash
# Executar backup manual
~/scripts/backup.sh

# Ver backups existentes
ls -lh ~/backups/

# Ver log de backups
cat ~/logs/backup.log

# Restaurar backup específico
cd ~/backups
gunzip < db_20250115_120000.sql.gz | docker exec -i estetica-db psql -U estetica_user -d estetica_db
```

---

## 📊 Monitoramento

```bash
# Ver logs do sistema
sudo journalctl -f

# Ver logs do nginx
sudo tail -f /var/log/nginx/error.log

# Ver uso de recursos
htop

# Ver espaço em disco
df -h

# Ver tamanho de pastas
sudo du -sh /var/lib/docker/*

# Ver conexões de rede
sudo netstat -tulpn
```

---

## 🆘 Troubleshooting

### Container não inicia
```bash
# Ver logs detalhados
docker logs estetica-backend --tail 100

# Verificar erro específico
docker logs estetica-backend 2>&1 | grep ERROR

# Reiniciar com logs em tempo real
docker compose -f docker-compose.prod.yml up
```

### Banco de dados não conecta
```bash
# Verificar se container está rodando
docker ps | grep db

# Ver logs do banco
docker logs estetica-db

# Testar conexão
docker exec -it estetica-db pg_isready -U estetica_user

# Reiniciar banco
docker restart estetica-db
```

### Frontend não carrega
```bash
# Verificar nginx
docker logs estetica-nginx

# Testar configuração do nginx
docker exec estetica-nginx nginx -t

# Reiniciar nginx
docker restart estetica-nginx
```

### Erro de permissão
```bash
# Corrigir permissões do diretório
sudo chown -R estetica:estetica ~/apps/estetica-pro

# Corrigir permissões do Docker
sudo chmod 666 /var/run/docker.sock
```

### Limpar espaço em disco
```bash
# Limpar Docker
docker system prune -a -f
docker volume prune -f

# Limpar logs
sudo find /var/log -type f -name "*.log" -exec truncate -s 0 {} \;
docker logs --tail 100 estetica-backend

# Limpar cache do apt
sudo apt clean
sudo apt autoremove -y
```

---

## 🚀 Comandos Rápidos

```bash
# Status completo do sistema
alias status='docker ps && echo "---" && df -h && echo "---" && free -h'

# Reiniciar tudo
alias restart-all='cd ~/apps/estetica-pro && docker compose -f docker-compose.prod.yml restart'

# Ver logs
alias logs='docker compose -f ~/apps/estetica-pro/docker-compose.prod.yml logs -f'

# Backup rápido
alias backup='~/scripts/backup.sh'

# Atualizar sistema
alias update-system='sudo apt update && sudo apt upgrade -y'
```

Adicione ao `~/.bashrc`:
```bash
echo "alias status='docker ps && echo \"---\" && df -h && echo \"---\" && free -h'" >> ~/.bashrc
echo "alias restart-all='cd ~/apps/estetica-pro && docker compose -f docker-compose.prod.yml restart'" >> ~/.bashrc
echo "alias logs='docker compose -f ~/apps/estetica-pro/docker-compose.prod.yml logs -f'" >> ~/.bashrc
source ~/.bashrc
```

---

## 📞 Suporte

Em caso de problemas:
1. Verifique os logs: `docker logs estetica-backend`
2. Verifique recursos: `htop` e `df -h`
3. Consulte a documentação completa em `~/apps/estetica-pro/deploy/`
4. Contate o suporte da Integrator se for problema de infraestrutura
