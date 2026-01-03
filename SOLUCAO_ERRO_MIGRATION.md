# 🔧 Solução para Erro de Migration

## Problemas Identificados:

1. **Snapshots malformados** - Os snapshots antigos são do MySQL e agora estamos usando PostgreSQL
2. **Connection string pode estar incorreta** - Verificar se a senha foi substituída

## ✅ Solução:

### Passo 1: Verificar a Connection String

Verifique se no `.env` a senha `[YOUR-PASSWORD]` foi substituída pela senha real:

```env
DATABASE_URL=postgresql://postgres:SUA_SENHA_REAL@db.zaemlxjwhzrfmowbckmk.supabase.co:5432/postgres
```

**⚠️ Se ainda tiver `[YOUR-PASSWORD]`, substitua pela senha real!**

### Passo 2: Limpar Snapshots Antigos (MySQL)

Os snapshots são do MySQL e precisam ser limpos para gerar novos para PostgreSQL:

```bash
# Backup dos snapshots antigos (opcional)
# Depois delete ou mova para backup:
# rm drizzle/meta/0000_snapshot.json
# rm drizzle/meta/0001_snapshot.json
```

Ou simplesmente delete os arquivos:
- `drizzle/meta/0000_snapshot.json`
- `drizzle/meta/0001_snapshot.json`

### Passo 3: Atualizar o Journal

O arquivo `drizzle/meta/_journal.json` também pode precisar ser atualizado ou resetado.

### Passo 4: Executar Novamente

Depois de limpar os snapshots e garantir que a connection string está correta:

```bash
pnpm db:push
```

## 🔍 Alternativa: Resetar Completamente as Migrations

Se os problemas persistirem, você pode resetar as migrations:

1. **Backup dos arquivos atuais** (opcional)
2. **Delete a pasta `drizzle/meta`** (ou apenas os snapshots)
3. **Execute novamente:**
   ```bash
   pnpm db:push
   ```

Isso vai gerar novos snapshots para PostgreSQL.

## ⚠️ Importante

- Certifique-se de que a senha no `.env` está correta
- Os snapshots antigos (MySQL) não são compatíveis com PostgreSQL
- Após limpar, o Drizzle vai gerar novos snapshots automaticamente

