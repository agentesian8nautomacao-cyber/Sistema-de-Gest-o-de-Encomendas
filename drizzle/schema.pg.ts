import { integer, pgEnum, pgTable, text, timestamp, varchar, boolean, serial } from "drizzle-orm/pg-core";

/**
 * Schema PostgreSQL - Compatível com Supabase
 * Core user table backing auth flow.
 * Extended with condominium association and role-based access control.
 */

// Enums
export const roleEnum = pgEnum("role", ["porteiro", "morador", "sindico", "admin"]);
export const tipoEnum = pgEnum("tipo", ["carta", "pacote", "delivery"]);
export const statusEnum = pgEnum("status", ["pendente", "retirada"]);
export const tipoNotificacaoEnum = pgEnum("tipo_notificacao", ["nova_encomenda", "encomenda_retirada", "sistema"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: roleEnum("role").default("morador").notNull(),
  condominioId: integer("condominioId"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Condomínios - cada condomínio é isolado dos demais
 */
export const condominios = pgTable("condominios", {
  id: serial("id").primaryKey(),
  nome: varchar("nome", { length: 255 }).notNull(),
  endereco: text("endereco"),
  telefone: varchar("telefone", { length: 20 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Condominio = typeof condominios.$inferSelect;
export type InsertCondominio = typeof condominios.$inferInsert;

/**
 * Moradores - vinculados a um condomínio e apartamento
 */
export const moradores = pgTable("moradores", {
  id: serial("id").primaryKey(),
  condominioId: integer("condominioId").notNull(),
  nome: varchar("nome", { length: 255 }).notNull(),
  apartamento: varchar("apartamento", { length: 20 }).notNull(),
  telefone: varchar("telefone", { length: 20 }),
  email: varchar("email", { length: 320 }),
  userId: integer("userId"), // Vinculação opcional com usuário do sistema
  ativo: boolean("ativo").default(true).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Morador = typeof moradores.$inferSelect;
export type InsertMorador = typeof moradores.$inferInsert;

/**
 * Encomendas - registro de entrada de encomendas na portaria
 */
export const encomendas = pgTable("encomendas", {
  id: serial("id").primaryKey(),
  condominioId: integer("condominioId").notNull(),
  moradorId: integer("moradorId").notNull(),
  apartamento: varchar("apartamento", { length: 20 }).notNull(),
  tipo: tipoEnum("tipo").notNull(),
  fotoUrl: text("fotoUrl"), // URL da foto no S3
  fotoKey: text("fotoKey"), // Chave do arquivo no S3
  observacoes: text("observacoes"),
  status: statusEnum("status").default("pendente").notNull(),
  porteiroRegistroId: integer("porteiroRegistroId").notNull(), // ID do porteiro que registrou
  porteiroRegistroNome: varchar("porteiroRegistroNome", { length: 255 }), // Nome do porteiro (cache)
  dataHoraRegistro: timestamp("dataHoraRegistro").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Encomenda = typeof encomendas.$inferSelect;
export type InsertEncomenda = typeof encomendas.$inferInsert;

/**
 * Retiradas - registro de quando a encomenda foi retirada
 */
export const retiradas = pgTable("retiradas", {
  id: serial("id").primaryKey(),
  encomendaId: integer("encomendaId").notNull().unique(),
  condominioId: integer("condominioId").notNull(),
  nomeQuemRetirou: varchar("nomeQuemRetirou", { length: 255 }).notNull(),
  assinatura: text("assinatura"), // Base64 da assinatura digital ou código de confirmação
  observacoes: text("observacoes"),
  porteiroRetiradaId: integer("porteiroRetiradaId"), // ID do porteiro que registrou a retirada
  porteiroRetiradaNome: varchar("porteiroRetiradaNome", { length: 255 }),
  dataHoraRetirada: timestamp("dataHoraRetirada").defaultNow().notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Retirada = typeof retiradas.$inferSelect;
export type InsertRetirada = typeof retiradas.$inferInsert;

/**
 * Notificações in-app para moradores
 */
export const notificacoes = pgTable("notificacoes", {
  id: serial("id").primaryKey(),
  condominioId: integer("condominioId").notNull(),
  userId: integer("userId").notNull(), // Usuário que receberá a notificação
  moradorId: integer("moradorId"), // Morador relacionado (opcional)
  encomendaId: integer("encomendaId"), // Encomenda relacionada (opcional)
  tipo: tipoNotificacaoEnum("tipo").notNull(),
  titulo: varchar("titulo", { length: 255 }).notNull(),
  mensagem: text("mensagem").notNull(),
  lida: boolean("lida").default(false).notNull(),
  dataHoraLeitura: timestamp("dataHoraLeitura"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Notificacao = typeof notificacoes.$inferSelect;
export type InsertNotificacao = typeof notificacoes.$inferInsert;

