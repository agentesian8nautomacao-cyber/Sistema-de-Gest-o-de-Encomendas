# Configuração Híbrida de Banco de Dados

O sistema agora suporta bancos de dados híbridos: SQLite local e MySQL online.

## Variáveis de Ambiente

Configure as seguintes variáveis de ambiente para controlar qual banco de dados usar:

### SQLite Local
```env
DATABASE_LOCAL_PATH=./database.sqlite
USE_LOCAL_DATABASE=true
```

### MySQL Online
```env
DATABASE_URL=mysql://usuario:senha@host:porta/database
USE_ONLINE_DATABASE=true
```

## Prioridade

O sistema usa a seguinte ordem de prioridade:
1. Se `USE_LOCAL_DATABASE=true` e `DATABASE_LOCAL_PATH` estiver definido, usa SQLite local
2. Se `USE_ONLINE_DATABASE=true` e `DATABASE_URL` estiver definido, usa MySQL online
3. Se nenhum estiver explicitamente configurado, tenta ambos (prioridade para SQLite se disponível)

## Observações Importantes

- **Schema**: O schema atual (`drizzle/schema.ts`) é otimizado para MySQL. Para usar SQLite em produção, alguns ajustes podem ser necessários (principalmente com enums e tipos).
- **Migrations**: As migrations do Drizzle Kit usam MySQL por padrão. Para criar migrations SQLite, seria necessário criar um schema SQLite separado.
- **Uso Híbrido**: O sistema usa apenas um banco por vez (não sincroniza dados entre ambos). Para sincronização, seria necessário implementar lógica adicional.

## Exemplo de Configuração

### Desenvolvimento (SQLite Local)
```env
DATABASE_LOCAL_PATH=./dev.sqlite
USE_LOCAL_DATABASE=true
```

### Produção (MySQL Online)
```env
DATABASE_URL=mysql://user:pass@localhost:3306/production_db
USE_ONLINE_DATABASE=true
```

