# 🚀 Configuração para Supabase (PostgreSQL)

Este guia explica como configurar o sistema para usar Supabase como banco de dados.

## 📋 Pré-requisitos

1. Conta no Supabase (https://supabase.com)
2. Projeto criado no Supabase
3. String de conexão do Supabase

## 🔧 Passo a Passo

### 1. Obter a String de Conexão do Supabase

1. Acesse o painel do seu projeto no Supabase
2. Vá em **Settings** > **Database**
3. Copie a **Connection string** (URI mode)
   - Formato: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

### 2. Configurar o arquivo .env

Atualize o arquivo `.env` na raiz do projeto:

```env
# Supabase PostgreSQL Connection
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres

# Outras configurações
JWT_SECRET=desenvolvimento_local_secret_key_12345678901234567890
VITE_APP_ID=dev
OAUTH_SERVER_URL=http://localhost:3013
VITE_OAUTH_PORTAL_URL=http://localhost:3013
NODE_ENV=development
PORT=3006
```

**⚠️ Importante:** Substitua `[YOUR-PASSWORD]` e `[PROJECT-REF]` pelos valores reais do seu projeto Supabase.

### 3. Instalar Dependências

As dependências do PostgreSQL já devem estar instaladas, mas caso não estejam:

```bash
pnpm install
```

### 4. Executar as Migrations

Execute as migrations para criar as tabelas no Supabase:

```bash
pnpm db:push
```

Isso irá:
- Gerar as migrations baseadas no schema PostgreSQL
- Aplicar as migrations no banco Supabase
- Criar todas as tabelas necessárias

### 5. Verificar no Supabase

1. Acesse o painel do Supabase
2. Vá em **Table Editor**
3. Você deve ver as seguintes tabelas criadas:
   - `users`
   - `condominios`
   - `moradores`
   - `encomendas`
   - `retiradas`
   - `notificacoes`

### 6. Iniciar o Servidor

```bash
pnpm dev
```

O servidor irá conectar automaticamente ao Supabase.

## ✅ Verificação

Após configurar, você pode verificar a conexão:

1. Inicie o servidor: `pnpm dev`
2. Procure no console por: `[Database] PostgreSQL online conectado`
3. Se houver erros, verifique:
   - A string de conexão no `.env`
   - Se o projeto Supabase está ativo
   - Se as migrations foram executadas

## 🔐 Segurança

- **NUNCA** commite o arquivo `.env` no Git
- Use variáveis de ambiente em produção
- O arquivo `.env` já está no `.gitignore`

## 🆘 Problemas Comuns

### Erro: "relation does not exist"

**Causa:** As migrations não foram executadas.

**Solução:**
```bash
pnpm db:push
```

### Erro: "password authentication failed"

**Causa:** Senha incorreta na string de conexão.

**Solução:** Verifique a senha no `.env` e no painel do Supabase.

### Erro: "timeout"

**Causa:** Problema de conexão com o Supabase.

**Solução:** 
- Verifique sua conexão com a internet
- Verifique se o projeto Supabase está ativo
- Tente usar a connection pooler do Supabase (porta 6543)

## 📚 Documentação Adicional

- [Documentação do Supabase](https://supabase.com/docs)
- [Drizzle ORM com PostgreSQL](https://orm.drizzle.team/docs/get-started-postgresql)

