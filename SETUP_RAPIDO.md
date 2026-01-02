# ⚡ Setup Rápido - Sistema de Gestão de Encomendas

## 🚨 Problema: Navegador mostra código JavaScript em vez da interface

Se você acabou de clonar o repositório e o navegador está mostrando código JavaScript/minificado, siga estes passos:

## ✅ Solução Rápida

### 1. Instale as dependências

```bash
pnpm install
```

### 2. Crie o arquivo .env

Crie um arquivo `.env` na raiz do projeto com este conteúdo:

```env
DATABASE_URL=mysql://root:@localhost:3306/gestao_encomendas
JWT_SECRET=desenvolvimento_local_secret_key_12345678901234567890
VITE_APP_ID=dev
OAUTH_SERVER_URL=http://localhost:3013
VITE_OAUTH_PORTAL_URL=http://localhost:3013
NODE_ENV=development
PORT=3006
```

### 3. Configure o MySQL

1. **Inicie o MySQL** (se usar XAMPP/WAMP, inicie pelo painel)
2. **Crie o banco de dados:**
   ```sql
   CREATE DATABASE gestao_encomendas;
   ```
3. **Execute as migrations:**
   ```bash
   pnpm db:push
   ```

### 4. Inicie o servidor

```bash
pnpm dev
```

### 5. Acesse o sistema

Abra o navegador em: `http://localhost:3006`

## ⚠️ Importante

- O sistema **NÃO** precisa de build para desenvolvimento (`pnpm dev`)
- O build (`pnpm build`) é necessário apenas para **produção**
- Em desenvolvimento, o Vite compila tudo automaticamente

## 🔍 Se ainda não funcionar

1. **Verifique se o MySQL está rodando:**
   ```powershell
   # Windows
   Get-Service -Name MySQL*
   ```

2. **Verifique os logs do servidor** - procure por erros de conexão com banco

3. **Limpe o cache e reinstale:**
   ```bash
   rm -rf node_modules pnpm-lock.yaml
   pnpm install
   ```

4. **Verifique se a porta 3006 está livre**

## 📞 Precisa de mais ajuda?

Consulte:
- `README.md` - Documentação completa
- `SOLUCAO_LOGIN.md` - Problemas de login/autenticação
- `README_DATABASE.md` - Configuração do banco de dados

