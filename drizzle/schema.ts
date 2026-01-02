import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, boolean } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extended with condominium association and role-based access control.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["porteiro", "morador", "sindico", "admin"]).default("morador").notNull(),
  condominioId: int("condominioId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Condomínios - cada condomínio é isolado dos demais
 */
export const condominios = mysqlTable("condominios", {
  id: int("id").autoincrement().primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  endereco: text("endereco"),
  telefone: varchar("telefone", { length: 20 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Condominio = typeof condominios.$inferSelect;
export type InsertCondominio = typeof condominios.$inferInsert;

/**
 * Moradores - vinculados a um condomínio e apartamento
 */
export const moradores = mysqlTable("moradores", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  apartamento: varchar("apartamento", { length: 20 }).notNull(),
  telefone: varchar("telefone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  userId: int("userId"), // Vinculação opcional com usuário do sistema
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Morador = typeof moradores.$inferSelect;
export type InsertMorador = typeof moradores.$inferInsert;

/**
 * Encomendas - registro de entrada de encomendas na portaria
 */
export const encomendas = mysqlTable("encomendas", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").notNull(),
  moradorId: int("moradorId").notNull(),
  apartamento: varchar("apartamento", { length: 20 }).notNull(),
  tipo: mysqlEnum("tipo", ["carta", "pacote", "delivery"]).notNull(),
  fotoUrl: text("fotoUrl"), // URL da foto no S3
  fotoKey: text("fotoKey"), // Chave do arquivo no S3
  observacoes: text("observacoes"),
  status: mysqlEnum("status", ["pendente", "retirada"]).default("pendente").notNull(),
  porteiroRegistroId: int("porteiroRegistroId").notNull(), // ID do porteiro que registrou
  porteiroRegistroNome: varchar("porteiroRegistroNome", { length: 255 }), // Nome do porteiro (cache)
  dataHoraRegistro: timestamp("dataHoraRegistro").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Encomenda = typeof encomendas.$inferSelect;
export type InsertEncomenda = typeof encomendas.$inferInsert;

/**
 * Retiradas - registro de quando a encomenda foi retirada
 */
export const retiradas = mysqlTable("retiradas", {
  id: int("id").autoincrement().primaryKey(),
  encomendaId: int("encomendaId").notNull().unique(),
  condominioId: int("condominioId").notNull(),
  nomeQuemRetirou: varchar("nomeQuemRetirou", { length: 255 }).notNull(),
  assinatura: text("assinatura"), // Base64 da assinatura digital ou código de confirmação
  observacoes: text("observacoes"),
  porteiroRetiradaId: int("porteiroRetiradaId"), // ID do porteiro que registrou a retirada
  porteiroRetiradaNome: varchar("porteiroRetiradaNome", { length: 255 }),
  dataHoraRetirada: timestamp("dataHoraRetirada").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Retirada = typeof retiradas.$inferSelect;
export type InsertRetirada = typeof retiradas.$inferInsert;

/**
 * Notificações in-app para moradores
 */
export const notificacoes = mysqlTable("notificacoes", {
  id: int("id").autoincrement().primaryKey(),
  condominioId: int("condominioId").notNull(),
  userId: int("userId").notNull(), // Usuário que receberá a notificação
  moradorId: int("moradorId"), // Morador relacionado (opcional)
  encomendaId: int("encomendaId"), // Encomenda relacionada (opcional)
  tipo: mysqlEnum("tipo", ["nova_encomenda", "encomenda_retirada", "sistema"]).notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  mensagem: text("mensagem").notNull(),
  lida: boolean("lida").default(false).notNull(),
  dataHoraLeitura: timestamp("dataHoraLeitura"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notificacao = typeof notificacoes.$inferSelect;
export type InsertNotificacao = typeof notificacoes.$inferInsert;
