import { defineConfig } from "drizzle-kit";

// Drizzle Kit usa MySQL por padrão para migrations
// O código runtime (server/db.ts) pode usar SQLite ou MySQL baseado nas variáveis de ambiente
const connectionString = process.env.DATABASE_URL;
const localPath = process.env.DATABASE_LOCAL_PATH;

// Se DATABASE_LOCAL_PATH estiver definido, pode usar SQLite
// Caso contrário, usa MySQL
if (!connectionString && !localPath) {
  throw new Error("DATABASE_URL ou DATABASE_LOCAL_PATH é necessário para executar comandos drizzle");
}

// Para migrations, usamos MySQL por padrão (schema atual é MySQL)
// Para usar SQLite em migrations, seria necessário criar um schema SQLite separado
export default defineConfig({
  schema: "./drizzle/schema.ts",
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    url: connectionString || "mysql://localhost:3306/temp", // Fallback temporário se não houver DATABASE_URL
  },
});
