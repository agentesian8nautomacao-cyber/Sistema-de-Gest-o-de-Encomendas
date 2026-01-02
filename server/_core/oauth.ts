import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  // Rota de desenvolvimento para login mock (apenas em desenvolvimento)
  const isDevMode = process.env.NODE_ENV === "development";
  // Sempre registrar rota mock em desenvolvimento para facilitar testes locais
  if (isDevMode) {
    console.log("[OAuth] Registering /app-auth route for development");
    app.get("/app-auth", async (req: Request, res: Response) => {
      const redirectUri = getQueryParam(req, "redirectUri") || `${req.protocol}://${req.get("host")}/api/oauth/callback`;
      const appId = getQueryParam(req, "appId") || "dev";
      
      // Simula um código de autorização
      const mockCode = "dev_mock_code_" + Date.now();
      const state = getQueryParam(req, "state") || btoa(redirectUri);
      
      // Redireciona para o callback com o código mock
      const callbackUrl = new URL(redirectUri);
      callbackUrl.searchParams.set("code", mockCode);
      callbackUrl.searchParams.set("state", state);
      
      res.redirect(302, callbackUrl.toString());
    });

    app.get("/api/oauth/callback", async (req: Request, res: Response) => {
      const code = getQueryParam(req, "code");
      const state = getQueryParam(req, "state");
      const dev = getQueryParam(req, "dev");

      // Modo desenvolvimento: cria usuário mock se não houver código
      if (dev === "true" || (code && code.startsWith("dev_mock_code_"))) {
        const mockOpenId = `dev_user_${Date.now()}`;
        const mockUser = {
          openId: mockOpenId,
          name: "Usuário Desenvolvimento",
          email: "dev@localhost",
          loginMethod: "dev",
          lastSignedIn: new Date(),
        };

        await db.upsertUser(mockUser);

        const sessionToken = await sdk.createSessionToken(mockOpenId, {
          name: mockUser.name,
          expiresInMs: ONE_YEAR_MS,
        });

        const cookieOptions = getSessionCookieOptions(req);
        res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

        res.redirect(302, "/");
        return;
      }

      if (!code || !state) {
        res.status(400).json({ error: "code and state are required" });
        return;
      }

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
    });
    return; // Retorna aqui para não executar o callback normal em modo dev
  }

  // Callback normal para produção
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });

      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}
