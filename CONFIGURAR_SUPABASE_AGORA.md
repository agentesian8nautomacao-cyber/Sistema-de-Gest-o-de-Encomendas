# ⚠️ ATENÇÃO: Configure o Supabase Agora

## Problema Identificado

Seu arquivo `.env` ainda está configurado para MySQL:
```
DATABASE_URL=mysql://root:@localhost:3306/gestao_encomendas
```

Mas você mencionou que tem um projeto no Supabase (PostgreSQL). Para usar o Supabase, você precisa atualizar o `.env`.

## 🔧 Solução: Atualizar o .env

### 1. Obter a String de Conexão do Supabase

No painel do Supabase:
1. Vá em **Settings** > **Database**
2. Procure por **Connection string** ou **Connection pooling**
3. Copie a string que começa com `postgresql://`
   - Formato: `postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

### 2. Editar o arquivo .env

Abra o arquivo `.env` na raiz do projeto e substitua a linha `DATABASE_URL`:

**ANTES (MySQL):**
```env
DATABASE_URL=mysql://root:@localhost:3306/gestao_encomendas
```

**DEPOIS (Supabase PostgreSQL):**
```env
DATABASE_URL=postgresql://postgres:SUA_SENHA_AQUI@db.SEU_PROJECT_REF.supabase.co:5432/postgres
```

**⚠️ IMPORTANTE:**
- Substitua `SUA_SENHA_AQUI` pela senha do seu banco Supabase
- Substitua `SEU_PROJECT_REF` pelo ID do seu projeto Supabase
- A senha pode ser encontrada em **Settings** > **Database** > **Database password**

### 3. Executar as Migrations

Depois de atualizar o `.env`, execute:

```bash
pnpm db:push
```

Agora o sistema vai:
- ✅ Detectar automaticamente que é PostgreSQL (pelo `postgresql://`)
- ✅ Usar o schema PostgreSQL correto (`schema.pg.ts`)
- ✅ Criar as tabelas no Supabase

## 📋 Exemplo Completo do .env

```env
# Supabase PostgreSQL Connection
DATABASE_URL=postgresql://postgres.xxxxxxxxxxxxx:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres

# Outras configurações
JWT_SECRET=desenvolvimento_local_secret_key_12345678901234567890
VITE_APP_ID=dev
OAUTH_SERVER_URL=http://localhost:3013
VITE_OAUTH_PORTAL_URL=http://localhost:3013
NODE_ENV=development
PORT=3006
```

## 🔍 Como Encontrar a Senha do Supabase

Se você não lembra da senha:
1. Acesse o painel do Supabase
2. Vá em **Settings** > **Database**
3. Clique em **Reset database password** se necessário
4. Ou use a senha que você definiu ao criar o projeto

## ✅ Depois de Configurar

Execute novamente:
```bash
pnpm db:push
```

Você deve ver:
- "Reading schema files: ...\drizzle\schema.pg.ts" (não schema.ts)
- As tabelas sendo criadas no Supabase
- Sem erros de conexão

