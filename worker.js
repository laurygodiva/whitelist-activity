export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const CORS = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization"
    };
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS });
    }

    try {
      // 1) Servir el SDK empaquetado desde npm (el Worker lo descarga y lo cachea)
      if (url.pathname === "/sdk") {
        const sdkUrl = "https://cdn.jsdelivr.net/npm/@discord/embedded-app-sdk@2.2.0/dist/index.mjs";
        const r = await fetch(sdkUrl, { cf: { cacheEverything: true, cacheTtl: 3600 } });
        const body = await r.text();
        return new Response(body, {
          status: r.status,
          headers: { ...CORS, "Content-Type": "application/javascript; charset=utf-8", "Cache-Control": "public, max-age=3600" }
        });
      }

      // 2) OAuth2: intercambio de code por access_token
      if (url.pathname === "/token" && request.method === "POST") {
        const { code } = await request.json();
        if (!code) return json({ error: "missing_code" }, 400, CORS);

        const form = new URLSearchParams({
          client_id: env.DISCORD_CLIENT_ID,
          client_secret: env.DISCORD_CLIENT_SECRET,
          grant_type: "authorization_code",
          code
          // En Activities no se usa redirect_uri
        });

        const r = await fetch("https://discord.com/api/oauth2/token", {
          method: "POST",
          headers: { "Content-Type": "application/x-www-form-urlencoded" },
          body: form
        });
        const data = await r.json();
        if (!r.ok) return json({ error: "token_exchange_failed", details: data }, 500, CORS);

        return json({ access_token: data.access_token }, 200, CORS);
      }

      // 3) Proxy a /users/@me con el access_token
      if (url.pathname === "/@me" && request.method === "GET") {
        const auth = request.headers.get("authorization") || "";
        if (!auth) return json({ error: "missing_token" }, 401, CORS);

        const r = await fetch("https://discord.com/api/users/@me", { headers: { Authorization: auth } });
        const me = await r.json();
        if (!r.ok) return json({ error: "me_failed", details: me }, 500, CORS);
        return json(me, 200, CORS);
      }

      // 4) Health
      if (url.pathname === "/healthz") return new Response("ok", { headers: CORS });

      return json({ ok: true }, 200, CORS);
    } catch (e) {
      return json({ error: "server_error", details: e?.message }, 500, CORS);
    }
  }
};

function json(obj, status = 200, headers = {}) {
  return new Response(JSON.stringify(obj), { status, headers: { "Content-Type": "application/json", ...headers } });
}
