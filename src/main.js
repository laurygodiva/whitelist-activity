// Import del SDK sin npm, vía el proxy /npm (lo declaras en URL Mappings).
import { DiscordSDK } from "/npm/@discord/embedded-app-sdk@2.2.0";

const CLIENT_ID = "1383517896747126987"; // tu client_id

const avatarEl  = document.getElementById("avatar");
const nameEl    = document.getElementById("name");
const hintEl    = document.getElementById("hint");
const spinnerEl = document.getElementById("spinner");

// Utilidad para construir URLs de avatar desde el CDN proxyeado
const cdn = (path) => `/cdn${path}`;

function paintUser(u) {
  const display = u?.global_name || u?.username || "Usuario";
  let avatar = cdn(`/embed/avatars/0.png`);
  if (u?.avatar) avatar = cdn(`/avatars/${u.id}/${u.avatar}.png?size=256`);
  avatarEl.src = avatar;
  nameEl.textContent = display;
  hintEl.textContent = `ID: ${u?.id ?? "desconocido"}`;
  spinnerEl.style.display = "none";
}

(async () => {
  try {
    const sdk = new DiscordSDK(CLIENT_ID);
    await sdk.ready(); // Espera a Discord

    // Ruta 100% estática: getUser (sin OAuth)
    // Algunos clientes aceptan sin args; otros requieren { id: 'me' }.
    let me = null;
    if (sdk?.commands?.getUser) {
      try {
        const r1 = await sdk.commands.getUser();
        me = r1?.user ?? r1 ?? null;
      } catch {
        const r2 = await sdk.commands.getUser({ id: "me" });
        me = r2?.user ?? r2 ?? null;
      }
    }

    if (!me) {
      // Si tu cliente aún no soporta getUser, mostramos ayuda.
      throw new Error("getUser_unavailable");
    }

    paintUser(me);
  } catch (err) {
    console.error(err);
    nameEl.textContent = "No se pudo obtener tu perfil";
    hintEl.innerHTML = [
      "Asegúrate de abrir esto dentro de una Activity en Discord.",
      "Si el error persiste, tu cliente podría no soportar <code>getUser</code> aún.",
      "En ese caso, usa la Opción B (OAuth con Worker) o pídeme que la añada."
    ].join("<br>");
    hintEl.classList.add("err");
    spinnerEl.style.display = "none";
  }
})();
