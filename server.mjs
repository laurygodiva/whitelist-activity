import express from "express";
import path from "node:path";
import { fileURLToPath } from "node:url";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const CLIENT_ID = process.env.DISCORD_CLIENT_ID;
const CLIENT_SECRET = process.env.DISCORD_CLIENT_SECRET;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("[ERR] Falta DISCORD_CLIENT_ID o DISCORD_CLIENT_SECRET en .env");
  process.exit(1);
}

/**
 * Intercambia el "code" por un access_token (OAuth2)
 * Doc OAuth2 de Discord. El flujo embed usa authorization_code.  */
app.post("/api/token", async (req, res) => {
  try {
    const { code } = req.body || {};
    if (!code) return res.status(400).json({ error: "Missing code" });

    const body = new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: "authorization_code",
      code
      // En el flujo embebido no necesitas redirect_uri.
    });

    const r = await fetch("https://discord.com/api/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body
    });

    const data = await r.json();
    if (!r.ok) {
      return res.status(500).json({ error: "token_exchange_failed", details: data });
    }

    // Solo devolvemos lo necesario para authenticate() y para /api/@me
    res.json({ access_token: data.access_token });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server_error" });
  }
});

/**
 * Obtiene el usuario (@me) usando el access_token
 * Requiere Authorization: Bearer <token> */
app.get("/api/@me", async (req, res) => {
  try {
    const auth = req.header("authorization") || "";
    const token = auth.replace(/^Bearer\s+/i, "");
    if (!token) return res.status(401).json({ error: "missing_token" });

    const r = await fetch("https://discord.com/api/users/@me", {
      headers: { Authorization: `Bearer ${token}` }
    });

    const me = await r.json();
    if (!r.ok) {
      return res.status(500).json({ error: "me_failed", details: me });
    }
    res.json(me);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "server_error" });
  }
});

app.get("/healthz", (_, res) => res.send("ok"));

// Servimos la build de Vite (dist/)
const dist = path.join(__dirname, "dist");
app.use(express.static(dist));
app.get("*", (_, res) => res.sendFile(path.join(dist, "index.html")));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`[OK] Servidor en http://localhost:${PORT}`);
});
