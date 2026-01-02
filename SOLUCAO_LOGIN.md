# Solução para Problema de Login

## Diagnóstico

Se você não consegue entrar no sistema além da página principal, o problema provavelmente está relacionado ao banco de dados.

## Passos para Resolver

### 1. Verificar se o MySQL está rodando

No Windows, verifique se o serviço MySQL está rodando:
```powershell
Get-Service -Name MySQL* | Select-Object Name, Status
```

Ou inicie o MySQL:
```powershell
# Se usar XAMPP/WAMP
# Inicie o MySQL pelo painel de controle do XAMPP/WAMP

# Se usar MySQL como serviço do Windows
net start MySQL
```

### 2. Criar o banco de dados (se não existir)

Conecte ao MySQL e crie o banco:
```sql
CREATE DATABASE IF NOT EXISTS gestao_encomendas;
```

### 3. Executar as migrations

Execute as migrations para criar as tabelas:
```powershell
pnpm db:push
```

### 4. Verificar a conexão

Verifique se o arquivo `.env` tem a configuração correta:
```env
DATABASE_URL=mysql://root:@localhost:3306/gestao_encomendas
```

**Nota:** Se sua senha do MySQL root não estiver vazia, use:
```env
DATABASE_URL=mysql://root:SUA_SENHA@localhost:3306/gestao_encomendas
```

### 5. Alternativa: Usar SQLite (mais fácil para desenvolvimento)

Se o MySQL estiver dando problemas, você pode usar SQLite local:

1. No arquivo `.env`, adicione ou modifique:
```env
DATABASE_LOCAL_PATH=./database.sqlite
USE_LOCAL_DATABASE=true
```

2. Comente ou remova o DATABASE_URL:
```env
# DATABASE_URL=mysql://root:@localhost:3306/gestao_encomendas
```

3. **IMPORTANTE:** O SQLite requer um schema diferente. Por enquanto, o sistema está otimizado para MySQL. Para usar SQLite completamente, seria necessário criar um schema SQLite separado.

### 6. Reiniciar o servidor

Após fazer as alterações:
```powershell
# Pare o servidor (Ctrl+C) e inicie novamente
pnpm dev
```

### 7. Testar o login

Em modo desenvolvimento, você pode fazer login acessando:
```
http://localhost:3006/api/oauth/callback?dev=true
```

Ou clicar no botão de login na página inicial (que deve redirecionar automaticamente).

## Verificar Logs

Procure no console do servidor por mensagens como:
- `[Database] MySQL online conectado` - Conexão OK
- `[Database] ERRO:` - Indica problema específico
- `[OAuth] Callback failed` - Problema na autenticação

## Problema Persistente?

Se o problema persistir, verifique:
1. Os logs do servidor para mensagens de erro
2. Se as tabelas existem no banco: `SHOW TABLES;` no MySQL
3. Se o usuário tem permissões: verifique o DATABASE_URL no .env

