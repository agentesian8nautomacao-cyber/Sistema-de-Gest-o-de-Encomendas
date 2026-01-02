import { describe, expect, it, beforeAll } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import * as db from "./db";

type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createContext(user: AuthenticatedUser): TrpcContext {
  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => {},
    } as TrpcContext["res"],
  };
}

describe("Sistema de Encomendas - RBAC e Isolamento", () => {
  let condominioId1: number;
  let condominioId2: number;
  let moradorId1: number;
  let moradorId2: number;

  beforeAll(async () => {
    // Criar condomínios de teste
    condominioId1 = await db.createCondominio({
      nome: "Condomínio Teste 1",
      endereco: "Rua A, 123",
    });

    condominioId2 = await db.createCondominio({
      nome: "Condomínio Teste 2",
      endereco: "Rua B, 456",
    });

    // Criar moradores de teste
    moradorId1 = await db.createMorador({
      condominioId: condominioId1,
      nome: "João Silva",
      apartamento: "101",
    });

    moradorId2 = await db.createMorador({
      condominioId: condominioId2,
      nome: "Maria Santos",
      apartamento: "202",
    });
  });

  describe("Controle de Acesso - Porteiro", () => {
    it("deve permitir que porteiro registre encomenda em seu condomínio", async () => {
      const porteiro: AuthenticatedUser = {
        id: 100,
        openId: "porteiro-test-1",
        email: "porteiro1@test.com",
        name: "Porteiro Teste",
        loginMethod: "manus",
        role: "porteiro",
        condominioId: condominioId1,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      };

      const ctx = createContext(porteiro);
      const caller = appRouter.createCaller(ctx);

      const result = await caller.encomendas.create({
        moradorId: moradorId1,
        apartamento: "101",
        tipo: "pacote",
      });

      expect(result.id).toBeDefined();
      expect(typeof result.id).toBe("number");
    });

    it("deve bloquear morador de registrar encomenda", async () => {
      const morador: AuthenticatedUser = {
        id: 101,
        openId: "morador-test-1",
        email: "morador1@test.com",
        name: "Morador Teste",
        loginMethod: "manus",
        role: "morador",
        condominioId: condominioId1,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      };

      const ctx = createContext(morador);
      const caller = appRouter.createCaller(ctx);

      await expect(
        caller.encomendas.create({
          moradorId: moradorId1,
          apartamento: "101",
          tipo: "pacote",
        })
      ).rejects.toThrow("Acesso restrito a porteiros");
    });
  });

  describe("Isolamento de Dados por Condomínio", () => {
    it("deve retornar apenas moradores do condomínio do usuário", async () => {
      const porteiro1: AuthenticatedUser = {
        id: 102,
        openId: "porteiro-test-2",
        email: "porteiro2@test.com",
        name: "Porteiro Condomínio 1",
        loginMethod: "manus",
        role: "porteiro",
        condominioId: condominioId1,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      };

      const ctx1 = createContext(porteiro1);
      const caller1 = appRouter.createCaller(ctx1);

      const moradores1 = await caller1.moradores.list();
      
      // Deve retornar apenas moradores do condomínio 1
      expect(moradores1.length).toBeGreaterThan(0);
      expect(moradores1.every(m => m.condominioId === condominioId1)).toBe(true);
    });

    it("deve isolar encomendas entre condomínios diferentes", async () => {
      // Criar encomenda no condomínio 1
      const porteiro1: AuthenticatedUser = {
        id: 103,
        openId: "porteiro-test-3",
        email: "porteiro3@test.com",
        name: "Porteiro Condomínio 1",
        loginMethod: "manus",
        role: "porteiro",
        condominioId: condominioId1,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      };

      const ctx1 = createContext(porteiro1);
      const caller1 = appRouter.createCaller(ctx1);

      await caller1.encomendas.create({
        moradorId: moradorId1,
        apartamento: "101",
        tipo: "carta",
      });

      // Verificar que porteiro do condomínio 2 não vê encomendas do condomínio 1
      const porteiro2: AuthenticatedUser = {
        id: 104,
        openId: "porteiro-test-4",
        email: "porteiro4@test.com",
        name: "Porteiro Condomínio 2",
        loginMethod: "manus",
        role: "porteiro",
        condominioId: condominioId2,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      };

      const ctx2 = createContext(porteiro2);
      const caller2 = appRouter.createCaller(ctx2);

      const encomendas2 = await caller2.encomendas.listPendentes();
      
      // Não deve ver encomendas do condomínio 1
      expect(encomendas2.every(e => e.condominioId === condominioId2)).toBe(true);
    });
  });

  describe("Controle de Acesso - Morador", () => {
    it("deve permitir que morador veja apenas suas próprias encomendas", async () => {
      const morador: AuthenticatedUser = {
        id: 105,
        openId: "morador-test-2",
        email: "morador2@test.com",
        name: "João Silva",
        loginMethod: "manus",
        role: "morador",
        condominioId: condominioId1,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      };

      // Vincular morador ao userId
      const dbInstance = await db.getDb();
      if (dbInstance) {
        await dbInstance.execute(
          `UPDATE moradores SET userId = ${morador.id} WHERE id = ${moradorId1}`
        );
      }

      const ctx = createContext(morador);
      const caller = appRouter.createCaller(ctx);

      const encomendas = await caller.encomendas.listByMorador({ moradorId: moradorId1 });
      
      // Deve retornar apenas encomendas do morador específico
      expect(encomendas.every(e => e.moradorId === moradorId1)).toBe(true);
    });

    it("deve bloquear morador de ver encomendas de outro morador", async () => {
      const morador: AuthenticatedUser = {
        id: 106,
        openId: "morador-test-3",
        email: "morador3@test.com",
        name: "Pedro Costa",
        loginMethod: "manus",
        role: "morador",
        condominioId: condominioId1,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      };

      const ctx = createContext(morador);
      const caller = appRouter.createCaller(ctx);

      // Tentar ver encomendas de outro morador
      await expect(
        caller.encomendas.listByMorador({ moradorId: moradorId1 })
      ).rejects.toThrow("FORBIDDEN");
    });
  });

  describe("Controle de Acesso - Síndico", () => {
    it("deve permitir que síndico acesse relatórios do condomínio", async () => {
      const sindico: AuthenticatedUser = {
        id: 107,
        openId: "sindico-test-1",
        email: "sindico1@test.com",
        name: "Síndico Teste",
        loginMethod: "manus",
        role: "sindico",
        condominioId: condominioId1,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      };

      const ctx = createContext(sindico);
      const caller = appRouter.createCaller(ctx);

      const dashboard = await caller.relatorios.dashboard();
      
      expect(dashboard).toBeDefined();
      expect(typeof dashboard.totalPendentes).toBe("number");
      expect(typeof dashboard.totalMes).toBe("number");
    });

    it("deve bloquear porteiro de acessar relatórios", async () => {
      const porteiro: AuthenticatedUser = {
        id: 108,
        openId: "porteiro-test-5",
        email: "porteiro5@test.com",
        name: "Porteiro Teste",
        loginMethod: "manus",
        role: "porteiro",
        condominioId: condominioId1,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      };

      const ctx = createContext(porteiro);
      const caller = appRouter.createCaller(ctx);

      await expect(caller.relatorios.dashboard()).rejects.toThrow("Acesso restrito a síndicos");
    });
  });

  describe("Sistema de Notificações", () => {
    it("deve criar notificação quando encomenda é registrada", async () => {
      const porteiro: AuthenticatedUser = {
        id: 109,
        openId: "porteiro-test-6",
        email: "porteiro6@test.com",
        name: "Porteiro Teste",
        loginMethod: "manus",
        role: "porteiro",
        condominioId: condominioId1,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      };

      // Criar morador com userId vinculado
      const moradorComUser = await db.createMorador({
        condominioId: condominioId1,
        nome: "Carlos Oliveira",
        apartamento: "303",
        userId: 110,
      });

      const ctx = createContext(porteiro);
      const caller = appRouter.createCaller(ctx);

      await caller.encomendas.create({
        moradorId: moradorComUser,
        apartamento: "303",
        tipo: "delivery",
      });

      // Verificar se notificação foi criada
      const notificacoes = await db.getNotificacoesByUser(110, condominioId1);
      expect(notificacoes.length).toBeGreaterThan(0);
      expect(notificacoes.some(n => n.tipo === "nova_encomenda")).toBe(true);
    });
  });
});
