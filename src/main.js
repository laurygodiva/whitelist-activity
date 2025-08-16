import { DiscordSDK } from "@discord/embedded-app-sdk";

/**
 * Flujo:
 * 1) Espera READY
 * 2) authorize({ scope: ['identify'] })
 * 3) POST /api/token -> access_token
 * 4) authenticate({ access_token })
 * 5) GET /api/@me y pintar nombre + avatar
 */
(async () => {
  const clientId = import.meta.env.VITE_DISCORD_CLIENT_ID;
  const cdnPrefix = import.meta.env.VITE_CDN_PREFIX ?? "/cdn";

  const avatarEl = document.getElementById("avatar");
  const nameEl = document.getElementById("name");
  const hintEl = document.getElementById("hint");
  const spinnerEl = document.getElementById("spinner");

  try {
    const sdk = new DiscordSDK(clientId);
    await sdk.ready();

    const { code } = await sdk.commands.authorize({
      client_id: clientId,
      response_type: "code",
      state: "",
      prompt: "none",
      scope: ["identify"]
    });

    const tokenRes = await fetch("/api/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code })
    });
    const { access_token } = await tokenRes.json();

    await sdk.commands.authenticate({ access_token });

    const meRes = await fetch("/api/@me", {
      headers: { Authorization: `Bearer ${access_token}` }
    });
    const me = await meRes.json();

    const displayName = me.global_name || me.username || "Usuario";
    let avatarUrl = `${cdnPrefix}/embed/avatars/0.png`;
    if (me.avatar) {
      avatarUrl = `${cdnPrefix}/avatars/${me.id}/${me.avatar}.png?size=256`;
    }

    avatarEl.src = avatarUrl;
    nameEl.textContent = displayName;
    hintEl.textContent = `ID: ${me.id}`;
    spinnerEl.style.display = "none";
  } catch (err) {
    console.error(err);
    nameEl.textContent = "Error al autenticar";
    hintEl.textContent = "Revisa permisos de la Activity y URL mappings";
    spinnerEl.style.display = "none";
  }
})();
