# ⚡ Como Encontrar a Connection String - Método Rápido

## 🎯 Método Mais Simples:

1. **No painel do Supabase**, procure por um botão **"Connect"** no topo da página
2. **Clique em "Connect"**
3. Na janela que abrir, procure por **"Direct connection"** ou **"Connection string"**
4. **Copie a string** que começa com `postgresql://`

## 📝 Formato que você vai ver:

```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

**⚠️ IMPORTANTE:** A senha `[YOUR-PASSWORD]` **NÃO aparece** na string. Você precisa:

1. Ir em **Settings > Database**
2. Ver a seção **"Database password"**
3. Clicar em **"Show"** ou **"Reset"** se não souber a senha
4. Substituir `[YOUR-PASSWORD]` na connection string pela senha real

## ✅ Depois de ter a connection string completa:

1. Adicione no `.env`:
   ```env
   DATABASE_URL=postgresql://postgres:SUA_SENHA_AQUI@db.PROJECT_REF_AQUI.supabase.co:5432/postgres
   ```

2. Execute:
   ```bash
   pnpm db:push
   ```

## 🆘 Se não encontrar o botão "Connect":

Tente:
- **Settings** > **Database** > Procure por "Connection info" ou "Connection string"
- Ou me diga quais seções você vê em Settings > Database que eu te ajudo a encontrar!

