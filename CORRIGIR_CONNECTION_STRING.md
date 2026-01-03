# 🔧 Corrigir Connection String - Problema de Encoding

## ⚠️ Problema Detectado

A connection string no `.env` pode ter problemas se a senha contém caracteres especiais.

## ✅ Solução

### Se a senha tem caracteres especiais:

Você precisa **codificar a senha em URL encoding** (percent-encoding).

### Método 1: Usar Connection Pooler (Mais Simples)

No Supabase, use a **Connection pooling** em vez da conexão direta:

1. No Supabase: **Settings > Database**
2. Procure por **"Connection pooling"**
3. Use a connection string do pooler (porta 6543)

Formato:
```
postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

### Método 2: Codificar a Senha

Se a senha tem caracteres especiais como espaços, @, #, etc., você precisa codificá-la:

- Espaço = `%20`
- @ = `%40`
- # = `%23`
- etc.

Ou use uma ferramenta online para URL encoding.

### Método 3: Resetar a Senha (Mais Fácil)

No Supabase:
1. **Settings > Database**
2. Clique em **"Reset database password"**
3. Defina uma senha **sem caracteres especiais** (apenas letras, números)
4. Use essa nova senha no `.env`

## 📝 Formato Correto:

```env
DATABASE_URL=postgresql://postgres:SENHA_SIMPLES@db.zaemlxjwhzrfmowbckmk.supabase.co:5432/postgres
```

**Ou com pooler:**
```env
DATABASE_URL=postgresql://postgres.zaemlxjwhzrfmowbckmk:SENHA@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

## ✅ Depois de Corrigir:

1. Salve o `.env`
2. Execute: `pnpm db:push`

