# 🔧 Configuração do Supabase (Método Simples)

Você tem razão! Vamos configurar de forma simples, igual em outros projetos.

## 📋 O que você precisa

No Supabase, você precisa da **Connection String** (que também é uma variável de ambiente).

### No Supabase Dashboard:

1. Vá em **Settings** > **Database**
2. Procure por **Connection string** ou **Connection pooling**
3. Copie a string que começa com `postgresql://`
   - Ela já vem formatada, só precisa substituir `[YOUR-PASSWORD]` pela senha do banco
   - A senha você encontra na mesma página (Settings > Database)

### No arquivo .env:

Adicione a variável `DATABASE_URL` (igual outras variáveis):

```env
# Supabase - Connection String (variável de ambiente padrão)
DATABASE_URL=postgresql://postgres:[SENHA]@db.[PROJECT-REF].supabase.co:5432/postgres

# Outras configurações
JWT_SECRET=desenvolvimento_local_secret_key_12345678901234567890
VITE_APP_ID=dev
OAUTH_SERVER_URL=http://localhost:3013
VITE_OAUTH_PORTAL_URL=http://localhost:3013
NODE_ENV=development
PORT=3006
```

**⚠️ Importante:** Substitua `[SENHA]` e `[PROJECT-REF]` pelos valores do seu projeto Supabase.

### No Vercel (quando fizer deploy):

Adicione a mesma variável `DATABASE_URL` com a connection string, igual você faz com outras variáveis.

## 💡 Por que DATABASE_URL?

- O Drizzle ORM se conecta diretamente ao PostgreSQL
- Precisa da connection string completa (DATABASE_URL)
- É diferente das variáveis do cliente Supabase (SUPABASE_URL, SUPABASE_ANON_KEY)
- Mas é simples: é só mais uma variável de ambiente que você adiciona no .env e no Vercel

## ✅ Passos Rápidos:

1. **Supabase** > Settings > Database > Copiar Connection string
2. **Substituir** `[YOUR-PASSWORD]` pela senha do banco
3. **Adicionar** no `.env` como `DATABASE_URL=...`
4. **Executar:** `pnpm db:push`

Pronto! 🎉
