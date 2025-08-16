const CLIENT_ID = "1383517896747126987";

const avatarEl  = document.getElementById("avatar");
const nameEl    = document.getElementById("name");
const hintEl    = document.getElementById("hint");
const spinnerEl = document.getElementById("spinner");

const cdn = (path) => `/cdn${path}`;

function paintUser(u) {
  const display = u?.global_name || u?.username || "Usuario";
  let avatar = cdn(`/embed/avatars/0.png`);
  if (u?.avatar) avatar = cdn(`/avatars/${u.id}/${u.avatar}.png?size=256`);
  avatarEl.src = avatar;
  nameEl.textContent = display;
  hintEl.innerHTML = `<span class="ok">OK</span> ID: ${u?.id ?? "desconocido"}`;
  spinnerEl.style.display = "none";
}

function setError(title, details) {
  nameEl.textContent = title;
  hintEl.innerHTML = details;
  hintEl.classList.add("err");
  spinnerEl.style.display = "none";
}

(async () => {
  try {
    // 0) Verifica que /npm funciona (debe devolver 200).
    try {
      const ping = await fetch("/npm/@discord/embedded-app-sdk@2.2.0", { method: "GET", cache: "no-store" });
      if (!ping.ok) throw new Error("bad_response");
    } catch {
      return setError(
        "No carga el SDK",
        [
          "Revisa los URL Mappings:",
          "• <code>/ → https://laurygodiva.github.io/whitelist-activity/</code>",
          "• <code>/npm → https://esm.sh</code>",
          "• <code>/cdn → https://cdn.discordapp.com</code>"
        ].join("<br>")
      );
    }

    // 1) Import dinámico del SDK (si falla, es mapping /npm).
    let DiscordSDK;
    try {
      ({ DiscordSDK } = await import("/npm/@discord/embedded-app-sdk@2.2.0"));
    } catch {
      return setError(
        "Error importando el SDK",
        "El proxy de <code>/npm</code> no está resolviendo correctamente (usa <code>https://</code> en el Target)."
      );
    }

    hintEl.textContent = "Esperando handshake de Discord…";

    // 2) Handshake con timeout: si no es Activity o app incorrecta, no resuelve.
    const sdk = new DiscordSDK(CLIENT_ID);
    const ready = sdk.ready();
    const timeout = new Promise((_, rej) => setTimeout(() => rej(new Error("sdk_ready_timeout")), 8000));
    await Promise.race([ready, timeout]);

    // 3) Obtener usuario (ruta estática sin OAuth).
    hintEl.textContent = "Obteniendo usuario…";
    let me = null;

    // Algunos clientes aceptan sin args; otros necesitan { id:'me' }.
    try {
      const r1 = await sdk.commands.getUser?.();
      me = r1?.user ?? r1 ?? null;
    } catch {}
    if (!me) {
      try {
        const r2 = await sdk.commands.getUser?.({ id: "me" });
        me = r2?.user ?? r2 ?? null;
      } catch {}
    }

    if (me) return paintUser(me);

    // Si no hay getUser:
    return setError(
      "El cliente no soporta getUser",
      [
        "Tu build de Discord no expone <code>sdk.commands.getUser</code> todavía.",
        "Soluciones:",
        "• Prueba en el cliente Desktop actualizado.",
        "• O pasamos a la Opción B (OAuth con Worker) y añades <code>/api</code> al mapping."
      ].join("<br>")
    );

  } catch (err) {
    if (String(err?.message) === "sdk_ready_timeout") {
      return setError(
        "Sin handshake con Discord",
        [
          "Asegúrate de abrirlo como la <b>Activity</b> de esta misma aplicación.",
          "Revisa que <b>Embedded App</b> esté activado en el Developer Portal.",
          "Confirma el Root Mapping: <code>/ → https://laurygodiva.github.io/whitelist-activity/</code>."
        ].join("<br>")
      );
    }
    console.error(err);
    return setError("Error inesperado", "Abre la consola de la Activity (Ctrl/Cmd+Shift+I) para ver el detalle.");
  }
})();
