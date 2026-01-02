import { COOKIE_NAME } from "@shared/const";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { storagePut } from "./storage";
import * as db from "./db";

// Middleware para verificar se usuário pertence a um condomínio
const condominioMiddleware = protectedProcedure.use(({ ctx, next }) => {
  if (!ctx.user.condominioId) {
    throw new TRPCError({ 
      code: 'FORBIDDEN', 
      message: 'Usuário não está vinculado a nenhum condomínio' 
    });
  }
  return next({ ctx: { ...ctx, condominioId: ctx.user.condominioId } });
});

// Middleware para porteiros
const porteiroMiddleware = condominioMiddleware.use(({ ctx, next }) => {
  if (ctx.user.role !== 'porteiro' && ctx.user.role !== 'sindico' && ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso restrito a porteiros' });
  }
  return next({ ctx });
});

// Middleware para síndicos
const sindicoMiddleware = condominioMiddleware.use(({ ctx, next }) => {
  if (ctx.user.role !== 'sindico' && ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Acesso restrito a síndicos' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ==================== MORADORES ====================
  moradores: router({
    list: condominioMiddleware.query(async ({ ctx }) => {
      return db.getMoradoresByCondominio(ctx.condominioId);
    }),

    create: sindicoMiddleware
      .input(z.object({
        nome: z.string().min(1),
        apartamento: z.string().min(1),
        telefone: z.string().optional(),
        email: z.string().email().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const id = await db.createMorador({
          condominioId: ctx.condominioId,
          nome: input.nome,
          apartamento: input.apartamento,
          telefone: input.telefone,
          email: input.email,
        });
        return { id };
      }),

    getByUser: condominioMiddleware.query(async ({ ctx }) => {
      if (ctx.user.role !== 'morador') return null;
      return db.getMoradorByUserId(ctx.user.id, ctx.condominioId);
    }),
  }),

  // ==================== ENCOMENDAS ====================
  encomendas: router({
    create: porteiroMiddleware
      .input(z.object({
        moradorId: z.number(),
        apartamento: z.string(),
        tipo: z.enum(["carta", "pacote", "delivery"]),
        observacoes: z.string().optional(),
        fotoBase64: z.string().optional(),
        fotoMimeType: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        let fotoUrl: string | undefined;
        let fotoKey: string | undefined;

        // Upload da foto para S3 se fornecida
        if (input.fotoBase64 && input.fotoMimeType) {
          const buffer = Buffer.from(input.fotoBase64, 'base64');
          const timestamp = Date.now();
          const random = Math.random().toString(36).substring(7);
          const fileKey = `encomendas/${ctx.condominioId}/${timestamp}-${random}.jpg`;
          
          const result = await storagePut(fileKey, buffer, input.fotoMimeType);
          fotoUrl = result.url;
          fotoKey = fileKey;
        }

        const encomendaId = await db.createEncomenda({
          condominioId: ctx.condominioId,
          moradorId: input.moradorId,
          apartamento: input.apartamento,
          tipo: input.tipo,
          observacoes: input.observacoes,
          fotoUrl,
          fotoKey,
          porteiroRegistroId: ctx.user.id,
          porteiroRegistroNome: ctx.user.name || undefined,
          status: "pendente",
        });

        // Buscar morador para notificação
        const morador = await db.getMoradorById(input.moradorId, ctx.condominioId);
        
        // Criar notificação se morador tiver userId vinculado
        if (morador?.userId) {
          await db.createNotificacao({
            condominioId: ctx.condominioId,
            userId: morador.userId,
            moradorId: input.moradorId,
            encomendaId,
            tipo: "nova_encomenda",
            titulo: "Nova encomenda recebida",
            mensagem: `Você tem uma nova ${input.tipo} aguardando retirada no apartamento ${input.apartamento}.`,
          });
        }

        return { id: encomendaId };
      }),

    listPendentes: condominioMiddleware.query(async ({ ctx }) => {
      return db.getEncomendasPendentes(ctx.condominioId);
    }),

    listByMorador: condominioMiddleware
      .input(z.object({ moradorId: z.number() }))
      .query(async ({ ctx, input }) => {
        // Moradores só podem ver suas próprias encomendas
        if (ctx.user.role === 'morador') {
          const morador = await db.getMoradorByUserId(ctx.user.id, ctx.condominioId);
          if (!morador || morador.id !== input.moradorId) {
            throw new TRPCError({ code: 'FORBIDDEN' });
          }
        }
        return db.getEncomendasByMorador(input.moradorId, ctx.condominioId);
      }),

    listByPeriodo: condominioMiddleware
      .input(z.object({
        dataInicio: z.date(),
        dataFim: z.date(),
      }))
      .query(async ({ ctx, input }) => {
        return db.getEncomendasByPeriodo(ctx.condominioId, input.dataInicio, input.dataFim);
      }),

    registrarRetirada: porteiroMiddleware
      .input(z.object({
        encomendaId: z.number(),
        nomeQuemRetirou: z.string().min(1),
        assinatura: z.string().optional(),
        observacoes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Verificar se encomenda existe e está pendente
        const encomenda = await db.getEncomendaById(input.encomendaId, ctx.condominioId);
        if (!encomenda) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Encomenda não encontrada' });
        }
        if (encomenda.status !== 'pendente') {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Encomenda já foi retirada' });
        }

        // Criar registro de retirada
        const retiradaId = await db.createRetirada({
          encomendaId: input.encomendaId,
          condominioId: ctx.condominioId,
          nomeQuemRetirou: input.nomeQuemRetirou,
          assinatura: input.assinatura,
          observacoes: input.observacoes,
          porteiroRetiradaId: ctx.user.id,
          porteiroRetiradaNome: ctx.user.name || undefined,
        });

        // Atualizar status da encomenda
        await db.updateEncomendaStatus(input.encomendaId, ctx.condominioId, "retirada");

        // Criar notificação de retirada se morador tiver userId
        const morador = await db.getMoradorById(encomenda.moradorId, ctx.condominioId);
        if (morador?.userId) {
          await db.createNotificacao({
            condominioId: ctx.condominioId,
            userId: morador.userId,
            moradorId: encomenda.moradorId,
            encomendaId: input.encomendaId,
            tipo: "encomenda_retirada",
            titulo: "Encomenda retirada",
            mensagem: `Sua ${encomenda.tipo} foi retirada por ${input.nomeQuemRetirou}.`,
          });
        }

        return { id: retiradaId };
      }),
  }),

  // ==================== NOTIFICAÇÕES ====================
  notificacoes: router({
    list: condominioMiddleware.query(async ({ ctx }) => {
      return db.getNotificacoesByUser(ctx.user.id, ctx.condominioId);
    }),

    listNaoLidas: condominioMiddleware.query(async ({ ctx }) => {
      return db.getNotificacoesNaoLidas(ctx.user.id, ctx.condominioId);
    }),

    marcarComoLida: condominioMiddleware
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        await db.marcarNotificacaoComoLida(input.id, ctx.user.id, ctx.condominioId);
        return { success: true };
      }),

    marcarTodasComoLidas: condominioMiddleware.mutation(async ({ ctx }) => {
      await db.marcarTodasNotificacoesComoLidas(ctx.user.id, ctx.condominioId);
      return { success: true };
    }),
  }),

  // ==================== CONDOMÍNIO ====================
  condominio: router({
    get: condominioMiddleware.query(async ({ ctx }) => {
      return db.getCondominioById(ctx.condominioId);
    }),

    getUsers: sindicoMiddleware.query(async ({ ctx }) => {
      return db.getUsersByCondominio(ctx.condominioId);
    }),
  }),

  // ==================== RELATÓRIOS (SÍNDICO) ====================
  relatorios: router({
    dashboard: sindicoMiddleware.query(async ({ ctx }) => {
      const pendentes = await db.getEncomendasPendentes(ctx.condominioId);
      const hoje = new Date();
      const inicioMes = new Date(hoje.getFullYear(), hoje.getMonth(), 1);
      const fimMes = new Date(hoje.getFullYear(), hoje.getMonth() + 1, 0, 23, 59, 59);
      
      const encomendaMes = await db.getEncomendasByPeriodo(ctx.condominioId, inicioMes, fimMes);
      
      return {
        totalPendentes: pendentes.length,
        totalMes: encomendaMes.length,
        totalRetiradas: encomendaMes.filter(e => e.status === 'retirada').length,
      };
    }),
  }),
});

export type AppRouter = typeof appRouter;
