# 🔍 Como Encontrar a Connection String no Supabase

Se você não encontrou "Connection string" ou "Connection pooling", siga estes passos:

## 📍 Localização no Painel Supabase

### Método 1: Botão "Connect" (Mais Fácil)

1. **Acesse o painel do Supabase**
2. **No topo da página**, procure por um botão chamado **"Connect"** ou ícone de conexão
3. **Clique no botão "Connect"**
4. Uma janela/modal será aberta
5. Procure pela seção **"Direct connection"** ou **"Connection string"**
6. Você verá a string no formato: `postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres`

### Método 2: Settings > Database

1. **Acesse o painel do Supabase**
2. **Clique em "Settings"** (Configurações) no menu lateral
3. **Clique em "Database"** no submenu
4. Procure por:
   - **"Connection string"** ou **"Connection string (URI)"**
   - **"Connection info"**
   - Seção com informações de conexão

### Método 2: Project Settings > Database

1. No menu lateral, procure por **"Project Settings"**
2. Depois clique em **"Database"**
3. Procure pela connection string lá

### Método 3: SQL Editor (Alternativa)

Se ainda não encontrar:

1. Vá em **SQL Editor** no menu lateral
2. Clique em **"New query"**
3. Às vezes a connection string aparece no topo da página

## 📋 O que procurar:

Você está procurando por uma string que:
- Começa com `postgresql://` ou `postgres://`
- Tem o formato: `postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres`
- Ou com pooler: `postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres`

## 🎯 Seção Típica no Supabase:

Na página **Settings > Database**, você geralmente vê:

```
Database
├── Database password: [Show] [Reset]
├── Connection string
│   └── URI: postgresql://postgres:[PASSWORD]@db.xxx.supabase.co:5432/postgres
├── Connection pooling
│   └── Connection string: postgresql://postgres.xxx:[PASSWORD]@...
└── ...
```

## 💡 Dica:

Se ainda não encontrar, tente:
1. **Rolar a página para baixo** - às vezes está mais abaixo
2. **Procurar por "URI"** ou "PostgreSQL connection"
3. **Verificar diferentes abas** na página Database

## 🔑 Informações que você PRECISA:

Para construir a connection string manualmente, você precisa:

1. **Host:** Geralmente `db.[PROJECT-REF].supabase.co`
2. **Porta:** `5432` (ou `6543` para pooler)
3. **Usuário:** `postgres`
4. **Senha:** A senha do banco (Settings > Database > Database password)
5. **Database:** `postgres`

## 📝 Formato da Connection String:

```
postgresql://postgres:[SUA-SENHA]@db.[PROJECT-REF].supabase.co:5432/postgres
```

Onde:
- `[SUA-SENHA]` = Senha do banco (encontrada em Settings > Database)
- `[PROJECT-REF]` = ID do seu projeto (aparece na URL do Supabase ou no Project Settings)

## ✅ Alternativa: Construir Manualmente

Se não encontrar a connection string pronta, você pode construí-la:

1. Vá em **Settings > API**
2. Veja a **"Project URL"** - ela tem o formato: `https://[PROJECT-REF].supabase.co`
3. Use o `[PROJECT-REF]` dessa URL
4. Vá em **Settings > Database** e pegue a senha
5. Monte a string: `postgresql://postgres:[SENHA]@db.[PROJECT-REF].supabase.co:5432/postgres`

## 🆘 Ainda não encontrou?

Me diga:
- Qual seção você está vendo em **Settings > Database**?
- Quais opções/menus aparecem na página?
- Posso te ajudar a localizar a informação específica!

