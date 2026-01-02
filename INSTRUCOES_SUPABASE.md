# 📋 Instruções Rápidas - Configurar Supabase

## ✅ O que já foi feito:

1. ✅ Dependência PostgreSQL (`pg`) instalada
2. ✅ Schema PostgreSQL criado (`drizzle/schema.pg.ts`)
3. ✅ Configuração do Drizzle atualizada para detectar PostgreSQL automaticamente

## 🔧 Próximos Passos:

### 1. Obter a String de Conexão do Supabase

No painel do Supabase:
1. Vá em **Settings** > **Database**
2. Copie a **Connection string** (URI mode)
   - Formato: `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`

### 2. Atualizar o arquivo .env

Edite o arquivo `.env` na raiz do projeto e atualize a linha `DATABASE_URL`:

```env
DATABASE_URL=postgresql://postgres:SUA_SENHA_AQUI@db.SEU_PROJECT_REF.supabase.co:5432/postgres
```

**⚠️ IMPORTANTE:** Substitua `SUA_SENHA_AQUI` e `SEU_PROJECT_REF` pelos valores reais do seu projeto Supabase.

### 3. Executar as Migrations

Execute este comando para criar as tabelas no Supabase:

```bash
pnpm db:push
```

Isso vai:
- Detectar automaticamente que é PostgreSQL (pelo `postgresql://` na URL)
- Usar o schema PostgreSQL correto
- Criar todas as tabelas no seu banco Supabase

### 4. Verificar no Supabase

1. Acesse o painel do Supabase
2. Vá em **Table Editor**
3. Você deve ver as tabelas:
   - `users`
   - `condominios`
   - `moradores`
   - `encomendas`
   - `retiradas`
   - `notificacoes`

### 5. Iniciar o Servidor

```bash
pnpm dev
```

## ⚠️ Nota Importante

O código atual (`server/db.ts`) ainda está configurado para MySQL/SQLite. Para usar PostgreSQL completamente no runtime, seria necessário atualizar o `server/db.ts` também. 

**Mas por enquanto, você pode usar o Drizzle Kit para criar as tabelas no Supabase através do `pnpm db:push`.**

## 🆘 Problemas?

Se encontrar erros ao executar `pnpm db:push`:

1. Verifique se a `DATABASE_URL` está correta no `.env`
2. Verifique se o projeto Supabase está ativo
3. Verifique se a senha está correta
4. Tente usar a connection pooler (porta 6543 em vez de 5432)

Para mais detalhes, consulte `SETUP_SUPABASE.md`.

