# ⚠️ IMPORTANTE: Atualizar a Senha no .env

O arquivo `.env` foi atualizado com a connection string do Supabase, mas **você precisa substituir `[YOUR-PASSWORD]` pela senha real do banco**.

## 🔑 Próximo Passo: Adicionar a Senha

### 1. Obter a Senha do Banco

No Supabase:
1. Vá em **Settings** > **Database**
2. Procure por **"Database password"**
3. Clique em **"Show"** para ver a senha (ou **"Reset"** se não souber)

### 2. Atualizar o .env

Abra o arquivo `.env` e substitua `[YOUR-PASSWORD]` pela senha real:

**ANTES:**
```env
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.zaemlxjwhzrfmowbckmk.supabase.co:5432/postgres
```

**DEPOIS (exemplo):**
```env
DATABASE_URL=postgresql://postgres:SUA_SENHA_AQUI@db.zaemlxjwhzrfmowbckmk.supabase.co:5432/postgres
```

### 3. Executar as Migrations

Depois de atualizar com a senha correta:

```bash
pnpm db:push
```

## 📋 Dados Configurados:

✅ Connection string: `postgresql://postgres:[YOUR-PASSWORD]@db.zaemlxjwhzrfmowbckmk.supabase.co:5432/postgres`
✅ Project URL: `https://zaemlxjwhzrfmowbckmk.supabase.co`
✅ Anon Key: Configurada (se necessário para outras funcionalidades)

⚠️ **Falta apenas:** Substituir `[YOUR-PASSWORD]` pela senha real do banco

## 💡 Dica de Segurança

- Nunca commite o `.env` com a senha real
- O arquivo `.env` já está no `.gitignore` (não será enviado para o Git)

