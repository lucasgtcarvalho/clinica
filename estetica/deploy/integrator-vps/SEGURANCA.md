# 🔒 Guia de Segurança - VPS Integrator

## 📋 Checklist de Segurança Obrigatória

### 1. Acesso SSH Seguro

#### Desativar Login Root
```bash
# Editar configuração do SSH
sudo nano /etc/ssh/sshd_config

# Alterar estas linhas:
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
MaxAuthTries 3
ClientAliveInterval 300
ClientAliveCountMax 2

# Reiniciar SSH
sudo systemctl restart sshd
```

#### Configurar Chave SSH
```bash
# No seu computador local, gerar chave
ssh-keygen -t ed25519 -C "seu-email@exemplo.com"

# Copiar chave para a VPS
ssh-copy-id -i ~/.ssh/id_ed25519.pub estetica@SEU_IP

# Testar login com chave
ssh estetica@SEU_IP
```

#### Alterar Porta SSH (Opcional)
```bash
# Editar SSH config
sudo nano /etc/ssh/sshd_config

# Alterar porta
Port 2222  # ou outra porta não padrão

# Atualizar firewall
sudo ufw allow 2222/tcp
sudo ufw delete allow 22/tcp

# Reiniciar SSH
sudo systemctl restart sshd
```

---

### 2. Firewall (UFW)

```bash
# Política padrão restritiva
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Permitir apenas o necessário
sudo ufw allow 22/tcp      # SSH (ou 2222 se alterou)
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS

# Bloquear tudo o mais
sudo ufw enable

# Verificar status
sudo ufw status verbose
```

---

### 3. Fail2Ban - Proteção contra Brute Force

```bash
# Instalar
sudo apt install -y fail2ban

# Configurar
sudo nano /etc/fail2ban/jail.local
```

Conteúdo:
```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 3
backend = systemd

[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 3

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log

[nginx-noscript]
enabled = true
port = http,https
filter = nginx-noscript
logpath = /var/log/nginx/access.log
maxretry = 6
```

```bash
# Reiniciar
sudo systemctl restart fail2ban
sudo systemctl enable fail2ban

# Verificar status
sudo fail2ban-client status
sudo fail2ban-client status sshd
```

---

### 4. Atualizações Automáticas de Segurança

```bash
# Instalar unattended-upgrades
sudo apt install -y unattended-upgrades

# Configurar
sudo dpkg-reconfigure -plow unattended-upgrades

# Ou editar manualmente
sudo nano /etc/apt/apt.conf.d/50unattended-upgrades
```

Configuração recomendada:
```
Unattended-Upgrade::Allowed-Origins {
    "${distro_id}:${distro_codename}-security";
};

Unattended-Upgrade::AutoFixInterruptedDpkg "true";
Unattended-Upgrade::MinimalSteps "true";
Unattended-Upgrade::InstallOnShutdown "false";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Remove-New-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "false";
```

---

### 5. Segurança do Docker

```bash
# Criar usuário docker (não rodar como root)
sudo usermod -aG docker estetica

# Limitar recursos dos containers (docker-compose.prod.yml)
# Adicionar em cada serviço:
deploy:
  resources:
    limits:
      cpus: '1.0'
      memory: 1G
    reservations:
      cpus: '0.25'
      memory: 256M

# Não expor portas desnecessárias
# Usar apenas networks internas quando possível

# Verificar containers com privilégios
docker ps --format "table {{.Names}}\t{{.Privileged}}"
```

---

### 6. Segurança da Aplicação

#### Variáveis de Ambiente
```bash
# Nunca commitar .env
# Adicionar ao .gitignore
echo ".env" >> .gitignore
echo ".env.*" >> .gitignore

# Permissões restritas
chmod 600 /home/estetica/apps/estetica-pro/backend/.env

# Usar senhas fortes
# Gerar senha segura:
openssl rand -base64 32
```

#### JWT Seguro
```bash
# Gerar secret forte
JWT_SECRET=$(openssl rand -base64 64)

# Configurar expiração curta em produção
JWT_EXPIRES_IN=1d  # ou menos
```

#### Headers de Segurança (já configurados no nginx)
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
```

---

### 7. Monitoramento de Segurança

```bash
# Instalar rkhunter (rootkit hunter)
sudo apt install -y rkhunter
sudo rkhunter --update
sudo rkhunter --check

# Instalar chkrootkit
sudo apt install -y chkrootkit
sudo chkrootkit

# Ver logs de autenticação
sudo tail -f /var/log/auth.log

# Ver tentativas de login falhas
sudo grep "Failed password" /var/log/auth.log

# Ver logins bem-sucedidos
sudo grep "Accepted" /var/log/auth.log
```

---

### 8. Backup de Segurança

```bash
# Backup das configurações importantes
sudo tar -czf ~/backups/configs-$(date +%Y%m%d).tar.gz \
    /etc/ssh/sshd_config \
    /etc/ufw \
    /etc/fail2ban \
    /etc/nginx \
    /home/estetica/apps/estetica-pro/backend/.env

# Backup fora do servidor (S3, Dropbox, etc.)
# Configurar sync automático
```

---

### 9. Auditoria de Segurança

```bash
# Ver usuários com shell
grep -E "/bin/bash|/bin/sh" /etc/passwd

# Ver processos em execução
ps aux --forest

# Ver conexões de rede
sudo netstat -tulpn
sudo ss -tulpn

# Ver arquivos SUID (potencialmente perigosos)
find / -perm -4000 -type f 2>/dev/null

# Ver arquivos modificados recentemente
find /home/estetica -mtime -1 -type f
```

---

### 10. Resposta a Incidentes

#### Se suspeitar de invasão:
```bash
# 1. Isolar o sistema (não desligar!)
sudo ufw default deny incoming
sudo ufw default deny outgoing
sudo ufw allow from SEU_IP  # Apenas seu acesso

# 2. Preservar evidências
sudo mkdir /root/incident-$(date +%Y%m%d)
sudo cp /var/log/auth.log /root/incident-$(date +%Y%m%d)/
sudo cp /var/log/syslog /root/incident-$(date +%Y%m%d)/
sudo netstat -tulpn > /root/incident-$(date +%Y%m%d)/connections.txt
sudo ps aux > /root/incident-$(date +%Y%m%d)/processes.txt

# 3. Verificar backdoors
sudo rkhunter --check
sudo chkrootkit

# 4. Analisar logs
sudo grep "Accepted" /var/log/auth.log | tail -20
sudo last -a
sudo lastb -a  # Logins falhos

# 5. Contatar suporte da Integrator se necessário
```

---

## 🔐 Boas Práticas

### Senhas
- ✅ Use senhas únicas e fortes (mínimo 16 caracteres)
- ✅ Use gerenciador de senhas (Bitwarden, 1Password)
- ✅ Ative 2FA em todos os serviços possíveis
- ❌ Nunca reuse senhas
- ❌ Nunca armazene senhas em texto plano

### Acesso
- ✅ Use chaves SSH, nunca senhas
- ✅ Desative login root
- ✅ Limite acessos por IP quando possível
- ✅ Use VPN para acesso administrativo
- ❌ Nunca compartilhe chaves SSH
- ❌ Nunca deixe portas desnecessárias abertas

### Atualizações
- ✅ Mantenha o sistema atualizado
- ✅ Assine alertas de segurança (USN, CVE)
- ✅ Teste atualizações em ambiente de staging
- ❌ Nunca ignore atualizações de segurança

### Monitoramento
- ✅ Configure alertas de segurança
- ✅ Revise logs regularmente
- ✅ Monitore uso de recursos
- ✅ Faça backups frequentes
- ❌ Nunca ignore alertas

---

## 📞 Contatos de Emergência

- **Suporte Integrator**: suporte@integrator.com.br
- **CERT.br**: https://www.cert.br/
- **Abuse**: abuse@seudominio.com.br

---

## ✅ Checklist Final

Antes de colocar em produção:

- [ ] SSH configurado com chave, root desativado
- [ ] Firewall ativo apenas com portas necessárias
- [ ] Fail2Ban configurado e rodando
- [ ] Atualizações automáticas de segurança ativas
- [ ] Docker com usuário não-root
- [ ] Variáveis de ambiente protegidas
- [ ] JWT com secret forte e expiração curta
- [ ] Headers de segurança no nginx
- [ ] Backup automático configurado
- [ ] Monitoramento de segurança ativo
- [ ] Plano de resposta a incidentes documentado
- [ ] Logs sendo preservados
- [ ] Teste de penetração básico realizado

**Lembre-se: Segurança é um processo contínuo, não um destino!**
