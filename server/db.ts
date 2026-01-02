import { eq, and, desc, gte, lte } from "drizzle-orm";
import { drizzle as drizzleMySQL } from "drizzle-orm/mysql2";
import { drizzle as drizzleSQLite } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { 
  InsertUser, 
  users, 
  condominios, 
  moradores, 
  encomendas, 
  retiradas, 
  notificacoes,
  InsertCondominio,
  InsertMorador,
  InsertEncomenda,
  InsertRetirada,
  InsertNotificacao
} from "../drizzle/schema";
import { ENV } from './_core/env';

type DbInstance = ReturnType<typeof drizzleMySQL> | ReturnType<typeof drizzleSQLite>;
type DbType = "mysql" | "sqlite";

let _dbLocal: ReturnType<typeof drizzleSQLite> | null = null;
let _dbOnline: ReturnType<typeof drizzleMySQL> | null = null;
let _dbType: DbType | null = null;
let _db: DbInstance | null = null;

async function initLocalDb() {
  if (_dbLocal || !ENV.databaseLocalPath) return _dbLocal;
  
  try {
    const sqlite = new Database(ENV.databaseLocalPath);
    _dbLocal = drizzleSQLite(sqlite);
    console.log(`[Database] SQLite local conectado: ${ENV.databaseLocalPath}`);
    return _dbLocal;
  } catch (error) {
    console.warn("[Database] Falha ao conectar SQLite local:", error);
    return null;
  }
}

async function initOnlineDb() {
  if (_dbOnline || !ENV.databaseUrl) return _dbOnline;
  
  try {
    _dbOnline = drizzleMySQL(ENV.databaseUrl);
    console.log("[Database] MySQL online conectado:", ENV.databaseUrl.replace(/:[^:@]+@/, ':****@'));
    
    // Testa a conexão fazendo uma query simples
    await _dbOnline.select().from(users).limit(1);
    console.log("[Database] Teste de conexão MySQL bem-sucedido");
    return _dbOnline;
  } catch (error: any) {
    console.error("[Database] Falha ao conectar MySQL online:", error?.message || error);
    if (error?.code === 'ECONNREFUSED') {
      console.error("[Database] ERRO: Não foi possível conectar ao servidor MySQL. Verifique se o MySQL está rodando.");
    } else if (error?.code === 'ER_BAD_DB_ERROR') {
      console.error("[Database] ERRO: Banco de dados não existe. Execute as migrations primeiro.");
    } else if (error?.code === 'ER_ACCESS_DENIED_ERROR') {
      console.error("[Database] ERRO: Acesso negado. Verifique usuário e senha no DATABASE_URL.");
    }
    return null;
  }
}

export async function getDb(): Promise<DbInstance | null> {
  if (_db) return _db;

  // Determina qual banco usar baseado na configuração
  // Prioridade: local se disponível, senão online
  if (ENV.useLocalDatabase && ENV.databaseLocalPath) {
    const db = await initLocalDb();
    if (db) {
      _dbType = "sqlite";
      _db = db;
      return db;
    }
  }

  if (ENV.useOnlineDatabase && ENV.databaseUrl) {
    const db = await initOnlineDb();
    if (db) {
      _dbType = "mysql";
      _db = db;
      return db;
    }
  }

  // Se nenhum estiver disponível, tenta inicializar ambos
  const localDb = await initLocalDb();
  if (localDb) {
    _dbType = "sqlite";
    _db = localDb;
    return localDb;
  }

  const onlineDb = await initOnlineDb();
  if (onlineDb) {
    _dbType = "mysql";
    _db = onlineDb;
    return onlineDb;
  }

  console.error("[Database] ===========================================");
  console.error("[Database] ERRO CRÍTICO: Nenhum banco de dados disponível!");
  console.error("[Database] ===========================================");
  console.error("[Database] Verifique:");
  console.error("[Database]   1. DATABASE_URL está configurado no .env (para MySQL)");
  console.error("[Database]   2. DATABASE_LOCAL_PATH está configurado no .env (para SQLite)");
  console.error("[Database]   3. O servidor MySQL está rodando (se usar DATABASE_URL)");
  console.error("[Database]   4. As migrations foram executadas (pnpm db:push)");
  console.error("[Database] ===========================================");
  
  return null;
}

// ==================== USERS ====================

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }
    if (user.condominioId !== undefined) {
      values.condominioId = user.condominioId;
      updateSet.condominioId = user.condominioId;
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    // Para SQLite, usar insert + update separado
    if (_dbType === "sqlite") {
      try {
        await (db as ReturnType<typeof drizzleSQLite>).insert(users).values(values);
      } catch (error: any) {
        // Se já existe, atualiza
        if (error?.message?.includes("UNIQUE constraint") || error?.code === "SQLITE_CONSTRAINT_UNIQUE") {
          await (db as ReturnType<typeof drizzleSQLite>).update(users).set(updateSet).where(eq(users.openId, user.openId));
        } else {
          throw error;
        }
      }
    } else {
      // MySQL usa onDuplicateKeyUpdate
      await (db as ReturnType<typeof drizzleMySQL>).insert(users).values(values).onDuplicateKeyUpdate({
        set: updateSet,
      });
    }
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await (db as any).select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await (db as any).select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUsersByCondominio(condominioId: number) {
  const db = await getDb();
  if (!db) return [];
  return (db as any).select().from(users).where(eq(users.condominioId, condominioId));
}

// ==================== CONDOMINIOS ====================

export async function createCondominio(data: InsertCondominio) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await (db as any).insert(condominios).values(data);
  
  if (_dbType === "sqlite") {
    // SQLite retorna lastInsertRowid
    const inserted = await (db as any).select().from(condominios).orderBy(desc(condominios.id)).limit(1);
    return inserted[0]?.id ?? 0;
  } else {
    // MySQL retorna insertId
    return Number((result as any)[0].insertId);
  }
}

export async function getCondominioById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await (db as any).select().from(condominios).where(eq(condominios.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllCondominios() {
  const db = await getDb();
  if (!db) return [];
  return (db as any).select().from(condominios);
}

// ==================== MORADORES ====================

export async function createMorador(data: InsertMorador) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await (db as any).insert(moradores).values(data);
  
  if (_dbType === "sqlite") {
    const inserted = await (db as any).select().from(moradores).orderBy(desc(moradores.id)).limit(1);
    return inserted[0]?.id ?? 0;
  } else {
    return Number((result as any)[0].insertId);
  }
}

export async function getMoradorById(id: number, condominioId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await (db as any).select().from(moradores)
    .where(and(eq(moradores.id, id), eq(moradores.condominioId, condominioId)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getMoradoresByCondominio(condominioId: number) {
  const db = await getDb();
  if (!db) return [];
  return (db as any).select().from(moradores)
    .where(eq(moradores.condominioId, condominioId))
    .orderBy(moradores.apartamento);
}

export async function getMoradorByUserId(userId: number, condominioId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await (db as any).select().from(moradores)
    .where(and(eq(moradores.userId, userId), eq(moradores.condominioId, condominioId)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ==================== ENCOMENDAS ====================

export async function createEncomenda(data: InsertEncomenda) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await (db as any).insert(encomendas).values(data);
  
  if (_dbType === "sqlite") {
    const inserted = await (db as any).select().from(encomendas).orderBy(desc(encomendas.id)).limit(1);
    return inserted[0]?.id ?? 0;
  } else {
    return Number((result as any)[0].insertId);
  }
}

export async function getEncomendaById(id: number, condominioId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await (db as any).select().from(encomendas)
    .where(and(eq(encomendas.id, id), eq(encomendas.condominioId, condominioId)))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getEncomendasPendentes(condominioId: number) {
  const db = await getDb();
  if (!db) return [];
  return (db as any).select().from(encomendas)
    .where(and(
      eq(encomendas.condominioId, condominioId),
      eq(encomendas.status, "pendente")
    ))
    .orderBy(desc(encomendas.dataHoraRegistro));
}

export async function getEncomendasByMorador(moradorId: number, condominioId: number) {
  const db = await getDb();
  if (!db) return [];
  return (db as any).select().from(encomendas)
    .where(and(
      eq(encomendas.moradorId, moradorId),
      eq(encomendas.condominioId, condominioId)
    ))
    .orderBy(desc(encomendas.dataHoraRegistro));
}

export async function getEncomendasByPeriodo(
  condominioId: number, 
  dataInicio: Date, 
  dataFim: Date
) {
  const db = await getDb();
  if (!db) return [];
  return (db as any).select().from(encomendas)
    .where(and(
      eq(encomendas.condominioId, condominioId),
      gte(encomendas.dataHoraRegistro, dataInicio),
      lte(encomendas.dataHoraRegistro, dataFim)
    ))
    .orderBy(desc(encomendas.dataHoraRegistro));
}

export async function updateEncomendaStatus(id: number, condominioId: number, status: "pendente" | "retirada") {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await (db as any).update(encomendas)
    .set({ status })
    .where(and(eq(encomendas.id, id), eq(encomendas.condominioId, condominioId)));
}

// ==================== RETIRADAS ====================

export async function createRetirada(data: InsertRetirada) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await (db as any).insert(retiradas).values(data);
  
  if (_dbType === "sqlite") {
    const inserted = await (db as any).select().from(retiradas).orderBy(desc(retiradas.id)).limit(1);
    return inserted[0]?.id ?? 0;
  } else {
    return Number((result as any)[0].insertId);
  }
}

export async function getRetiradaByEncomenda(encomendaId: number, condominioId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await (db as any).select().from(retiradas)
    .where(and(
      eq(retiradas.encomendaId, encomendaId),
      eq(retiradas.condominioId, condominioId)
    ))
    .limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ==================== NOTIFICAÇÕES ====================

export async function createNotificacao(data: InsertNotificacao) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await (db as any).insert(notificacoes).values(data);
  
  if (_dbType === "sqlite") {
    const inserted = await (db as any).select().from(notificacoes).orderBy(desc(notificacoes.id)).limit(1);
    return inserted[0]?.id ?? 0;
  } else {
    return Number((result as any)[0].insertId);
  }
}

export async function getNotificacoesByUser(userId: number, condominioId: number) {
  const db = await getDb();
  if (!db) return [];
  return (db as any).select().from(notificacoes)
    .where(and(
      eq(notificacoes.userId, userId),
      eq(notificacoes.condominioId, condominioId)
    ))
    .orderBy(desc(notificacoes.createdAt));
}

export async function getNotificacoesNaoLidas(userId: number, condominioId: number) {
  const db = await getDb();
  if (!db) return [];
  return (db as any).select().from(notificacoes)
    .where(and(
      eq(notificacoes.userId, userId),
      eq(notificacoes.condominioId, condominioId),
      eq(notificacoes.lida, false)
    ))
    .orderBy(desc(notificacoes.createdAt));
}

export async function marcarNotificacaoComoLida(id: number, userId: number, condominioId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await (db as any).update(notificacoes)
    .set({ lida: true, dataHoraLeitura: new Date() })
    .where(and(
      eq(notificacoes.id, id),
      eq(notificacoes.userId, userId),
      eq(notificacoes.condominioId, condominioId)
    ));
}

export async function marcarTodasNotificacoesComoLidas(userId: number, condominioId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await (db as any).update(notificacoes)
    .set({ lida: true, dataHoraLeitura: new Date() })
    .where(and(
      eq(notificacoes.userId, userId),
      eq(notificacoes.condominioId, condominioId),
      eq(notificacoes.lida, false)
    ));
}
