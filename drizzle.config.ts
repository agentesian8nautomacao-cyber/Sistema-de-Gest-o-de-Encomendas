import { defineConfig } from "drizzle-kit";

// Detecta automaticamente o tipo de banco baseado na string de conexão
const connectionString = process.env.DATABASE_URL;
const localPath = process.env.DATABASE_LOCAL_PATH;

if (!connectionString && !localPath) {
  throw new Error("DATABASE_URL ou DATABASE_LOCAL_PATH é necessário para executar comandos drizzle");
}

// Detecta se é PostgreSQL (Supabase) ou MySQL baseado na URL
const isPostgres = connectionString?.startsWith("postgresql://") || connectionString?.startsWith("postgres://");

// Usa o schema apropriado baseado no tipo de banco
const schemaPath = isPostgres ? "./drizzle/schema.pg.ts" : "./drizzle/schema.ts";
const dialect = isPostgres ? "postgresql" : "mysql";

export default defineConfig({
  schema: schemaPath,
  out: "./drizzle",
  dialect: dialect as "postgresql" | "mysql",
  dbCredentials: {
    url: connectionString || "mysql://localhost:3306/temp",
  },
});
