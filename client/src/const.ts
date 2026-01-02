export { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";

// Generate login URL at runtime so redirect URI reflects the current origin.
export const getLoginUrl = () => {
  const oauthPortalUrl = import.meta.env.VITE_OAUTH_PORTAL_URL || import.meta.env.VITE_OAUTH_SERVER_URL || "";
  const appId = import.meta.env.VITE_APP_ID || "dev";
  
  // Se não houver URL de OAuth configurada, retorna uma URL local temporária
  if (!oauthPortalUrl) {
    console.warn("VITE_OAUTH_PORTAL_URL não configurado. Usando URL local temporária.");
    return `${window.location.origin}/api/oauth/callback?dev=true`;
  }

  const redirectUri = `${window.location.origin}/api/oauth/callback`;
  const state = btoa(redirectUri);

  try {
    const url = new URL(`${oauthPortalUrl}/app-auth`);
    url.searchParams.set("appId", appId);
    url.searchParams.set("redirectUri", redirectUri);
    url.searchParams.set("state", state);
    url.searchParams.set("type", "signIn");
    return url.toString();
  } catch (error) {
    console.error("Erro ao criar URL de login:", error);
    return `${window.location.origin}/api/oauth/callback?dev=true`;
  }
};
