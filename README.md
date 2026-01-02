# Sistema de Gestão de Encomendas

Sistema completo para gerenciamento de encomendas em condomínios, com suporte para porteiros, moradores e síndicos.

## 🚀 Funcionalidades

- **Gestão de Encomendas**: Registro, controle e retirada de encomendas
- **Perfis de Usuário**: Porteiro, Morador, Síndico e Admin
- **Notificações**: Sistema de notificações in-app
- **Banco de Dados Híbrido**: Suporte para SQLite (local) e MySQL (online)

## 📋 Pré-requisitos

- Node.js 18+ 
- pnpm (recomendado) ou npm
- MySQL (opcional, se usar banco online)
- Git

## 🔧 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/agentesian8nautomacao-cyber/Sistema-de-Gest-o-de-Encomendas.git
cd Sistema-de-Gest-o-de-Encomendas
```

### 2. Instale as dependências

```bash
pnpm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Variáveis de Ambiente - Sistema de Gestão de Encomendas
# Configuração para desenvolvimento local

# Obrigatórias para funcionamento básico
DATABASE_URL=mysql://root:@localhost:3306/gestao_encomendas
JWT_SECRET=desenvolvimento_local_secret_key_12345678901234567890

# Para OAuth (valores temporários para desenvolvimento)
VITE_APP_ID=dev
OAUTH_SERVER_URL=http://localhost:3013
VITE_OAUTH_PORTAL_URL=http://localhost:3013

# Opcionais (podem ficar vazias para desenvolvimento)
OWNER_OPEN_ID=
BUILT_IN_FORGE_API_URL=
BUILT_IN_FORGE_API_KEY=

# Ambiente
NODE_ENV=development
PORT=3006
```

**Nota:** O arquivo `.env` não é versionado por segurança. Você precisa criá-lo localmente.

### 4. Configure o banco de dados

#### Opção A: MySQL (Online)

1. Certifique-se de que o MySQL está rodando
2. Crie o banco de dados:
   ```sql
   CREATE DATABASE gestao_encomendas;
   ```
3. Execute as migrations:
   ```bash
   pnpm db:push
   ```

#### Opção B: SQLite (Local) - Em desenvolvimento

No arquivo `.env`, adicione:
```env
DATABASE_LOCAL_PATH=./database.sqlite
USE_LOCAL_DATABASE=true
```

**Atenção:** O SQLite requer ajustes no schema. Por enquanto, use MySQL.

### 5. Inicie o servidor de desenvolvimento

```bash
pnpm dev
```

O servidor estará disponível em `http://localhost:3006`

## 🏗️ Build para Produção

### 1. Build do cliente e servidor

```bash
pnpm build
```

Isso irá:
- Compilar o cliente React com Vite
- Compilar o servidor Node.js com esbuild
- Gerar os arquivos em `dist/`

### 2. Execute em produção

```bash
# Certifique-se de que NODE_ENV=production no .env
NODE_ENV=production pnpm start
```

## 🐛 Solução de Problemas

### Problema: O navegador mostra código JavaScript em vez da interface

**Causa:** O build do cliente não foi executado ou o servidor está servindo o arquivo errado.

**Solução:**
1. Pare o servidor (Ctrl+C)
2. Execute o build:
   ```bash
   pnpm build
   ```
3. Inicie o servidor novamente:
   ```bash
   pnpm dev
   ```

### Problema: Erro de conexão com banco de dados

**Solução:**
1. Verifique se o MySQL está rodando
2. Verifique as credenciais no `.env`
3. Execute as migrations: `pnpm db:push`
4. Consulte `SOLUCAO_LOGIN.md` para mais detalhes

### Problema: Não consigo fazer login

**Solução:**
1. Verifique se o banco de dados está configurado corretamente
2. Em desenvolvimento, acesse: `http://localhost:3006/api/oauth/callback?dev=true`
3. Consulte `SOLUCAO_LOGIN.md` para mais detalhes

## 📁 Estrutura do Projeto

```
.
├── client/              # Frontend React
│   ├── src/
│   │   ├── pages/      # Páginas da aplicação
│   │   ├── components/ # Componentes React
│   │   └── ...
│   └── index.html
├── server/              # Backend Node.js
│   ├── _core/          # Código core do servidor
│   ├── db.ts           # Funções de banco de dados
│   └── routers.ts      # Rotas tRPC
├── shared/              # Código compartilhado
├── drizzle/             # Schema e migrations do banco
└── dist/                # Build de produção (gerado)
```

## 🔐 Autenticação

Em modo desenvolvimento, o sistema usa autenticação mock. Para fazer login:
- Acesse a página inicial
- Clique no botão de login
- Ou acesse diretamente: `/api/oauth/callback?dev=true`

## 📚 Documentação Adicional

- `README_DATABASE.md` - Configuração detalhada do banco de dados
- `SOLUCAO_LOGIN.md` - Solução de problemas de login

## 🤝 Contribuindo

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📝 Licença

MIT

## 👤 Autor

agentesian8nautomacao-cyber

