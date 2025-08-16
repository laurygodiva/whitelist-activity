// ====== Identidad y utilidades ======
const APP_ID      = window.APP_ID || '';
const GUILD_ID    = window.GUILD_ID || '';
const WEBHOOK_URL = window.WEBHOOK_URL || '';

let USER_ID = null;
let DISCORD_NAME = null;

const $ = s => document.querySelector(s);
const bar = $("#bar"), pill = $("#pill");

function setProgress(p){ bar.style.width = p + "%"; pill.textContent = Math.round(p)+"%"; }
function showStep(n){ $("#step1").style.display=n===1?"block":"none"; $("#step2").style.display=n===2?"block":"none"; $("#step3").style.display=n===3?"block":"none"; }
function shuffled(arr){ return arr.map(v=>({v, r:Math.random()})).sort((a,b)=>a.r-b.r).map(o=>o.v); }
function pickOneWithIndex(arr){ const idx = Math.floor(Math.random()*arr.length); return { item: arr[idx], idx }; }
function uuidv4(){ return (crypto?.randomUUID?.() || 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
  const r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8); return v.toString(16);
})); }

// ====== Banco de preguntas EXACTO (C1..C5, S1..S5) ======
const BLOCKS = {
  C1: [
    { q:"Cuál de los siguientes conceptos no es sancionable?",
      answers:[
        { text: "CK", isCorrect: true }, { text: "MG", isCorrect: false }, { text: "RK", isCorrect: false },
        { text: "PK", isCorrect: true }, { text: "IDP", isCorrect: true }, { text: "DM", isCorrect: false }
      ]},
    { q:"¿Cuando se permite hacer MG?",
      answers:[
        { text: "Siempre que no entorpezca roles ajenos o administrativos y no te de ninguna ventaja IC.", isCorrect: false },
        { text: "Nunca, todo aquello que conoce tu pj debe haberlo presenciado, escuchado o visto IC.", isCorrect: true },
        { text: "En cualquier situación excepto en los PVP.", isCorrect: false }
      ]},
    { q:"¿Qué significa IC?",
      answers:[
        { text: "In Conversation.", isCorrect: false },
        { text: "In Character.", isCorrect: true },
        { text: "In Combat.", isCorrect: false },
        { text: "In Community.", isCorrect: false }
      ]}
  ],
  C2: [
    { q:"¿A qué se refieren las siglas OOC?",
      answers:[
        { text: "Se refiere a las conversaciones por voz dentro del juego.", isCorrect: false },
        { text: "Se refiere a las conversaciones y acciones que están fuera del contexto del rol y no afectan la narrativa del personaje.", isCorrect: true },
        { text: "Se refiere a las conversaciones que ocurren exclusivamente en el chat del juego.", isCorrect: false }
      ]},
    { q:"¿Qué es el RDE y qué significa?",
      answers:[
        { text: "Significa Rol de Entorno, son ciudadanos, cámaras y vida en la ciudad que debemos tener en cuenta en todo momento para tener una interpretación correcta en la ciudad.", isCorrect: true },
        { text: "Significa Roll Death Eyes, son los NPC que estan cerca de tu personaje y avisan a la policía o EMS cuando estas muerto.", isCorrect: false },
        { text: "Significa Rol de Espera, es el tiempo que debes esperar tras la muerte de tu personaje para poder recordar como has muerto y quien fue el culpable.", isCorrect: false }
      ]},
    { q:"¿Para qué se utiliza el comando /me?",
      answers:[
        { text: "Se utilizará para acciones que realiza nuestro personaje y no exista animación para ello.", isCorrect: true },
        { text: "Se utilizará para especificar las acciones que tengan que ver con el entorno que nos rodea.", isCorrect: false },
        { text: "Se utiliza para expresar las acciones y pensamientos de tu personaje.", isCorrect: false }
      ]}
  ],
  C3: [
    { q:"¿Por qué no se permite el RK?",
      answers:[
        { text: "Porque después de acabar inconsciente, no recuerdas el rol que te llevó a dicho estado.", isCorrect: true },
        { text: "Porque tengo que esperar 30 minutos para poder volver a un PVP.", isCorrect: false },
        { text: "Si está permitido.", isCorrect: false }
      ]},
    { q:"Cuál de los siguientes comentarios no se considera una falta de interpretación?",
      answers:[
        { text: "Voy a descansar un rato, luego nos vemos.", isCorrect: true },
        { text: "¿Con qué músculo me pongo el cinturón?", isCorrect: false },
        { text: "Voy a parpadear que no te veo los brazos.", isCorrect: false },
        { text: "Mira qué dice la nube.", isCorrect: false }
      ]},
    { q:"¿Se permiten los roles sexuales?",
      answers:[
        { text: "Si, siempre que exista consentimiento de los participantes.", isCorrect: true },
        { text: "No.", isCorrect: false }
      ]}
  ],
  C4: [
    { q:"¿Cuál de los siguientes ejemplos no son aptos para la elección de nombre de personaje?",
      answers:[
        { text: "Nombres de Familiares cercanos.", isCorrect: false },
        { text: "Nombres Reales.", isCorrect: false },
        { text: "Nombres ofensivos o con doble sentido.", isCorrect: true },
        { text: "Nombres de Famosos.", isCorrect: true },
        { text: "Nombres de Personajes Ficticios.", isCorrect: true },
        { text: "Nombres extranjeros.", isCorrect: false }
      ]},
    { q:"¿Qué se necesita para publicar contenido sobre PROYECTO ROLEPLAY",
      answers:[
        { text: "Mencionar el nombre del servidor en el título del video o streaming.", isCorrect: false },
        { text: "El permiso de Creador de Contenido.", isCorrect: true },
        { text: "Nada.", isCorrect: false }
      ]},
    { q:"¿Se permite el uso de mods en el servidor?",
      answers:[
        { text: "Si, unicamente los que mejoran los gráficos visuales.", isCorrect: true },
        { text: "No, ningún tipo de mod está permitido.", isCorrect: false }
      ]}
  ],
  C5: [
    { q:"¿Cómo debes comunicarte con otros jugadores fuera de rol pero dentro del juego?",
      answers:[
        { text: "No puedes comunicarte fuera de rol.", isCorrect: false },
        { text: "Mediante la voz IC pero sin otros jugadores cerca.", isCorrect: false },
        { text: "Con el comando /msg o /ooc", isCorrect: true }
      ]},
    { q:"¿Se permiten los roles de tortura?",
      answers:[
        { text: "Si, siempre que exista la aprobación administrativa y rol previo", isCorrect: false },
        { text: "No, no se permiten ese tipo de roles tan increpantes", isCorrect: false },
        { text: "Si, pero en casos de desmembramientos debes tener la aprobación OOC de la víctima", isCorrect: true }
      ]},
    { q:"¿Cuál de estas descripciones del comando /do no es correcta?",
      answers:[
        { text: "/do se podría leer en la nota la palabra S.O.S", isCorrect: false },
        { text: "/do ¿habría algún arma dentro del bolso?", isCorrect: false },
        { text: "/do pensaría en el hambre que tiene.", isCorrect: true },
        { text: "/do se escucharía el rugir de sus tripas.", isCorrect: false }
      ]}
  ],
  S1: [
    { q:"Un staff te comunica por /msg que acudas a sala de reporte ¿Cómo debes actuar?",
      answers:[
        { text: "Tratar de terminar el rol actual si existiese e ir a sala de espera.", isCorrect: true },
        { text: "Ignorarlo y seguir roleando.", isCorrect: false },
        { text: "Desconectarme e ignorar el mensaje.", isCorrect: false },
        { text: "Quedarme AFK e ir a sala de espera.", isCorrect: false }
      ]},
    { q:"Después de un día duro de trabajo y de problemas en tu vida, decides irte a tu bar de confianza a llorar tus penas y a beberte una botella de Absenta. ¿Qué no debes hacer en este rol?",
      answers:[
        { text: "Roleas que bebes el licor, pero no consumes el ítem y te lo guardas para después.", isCorrect: true },
        { text: "Consumo el ítem y rolear que bebes el licor.", isCorrect: false },
        { text: "Roleo el beber el licor y consumo el ítem pero no roleo que voy embriagad@.", isCorrect: true },
        { text: "Roleo el beber el licor pero tiro el ítem. ", isCorrect: true }
      ]},
    { q:"¿Cuál de los siguientes roles sería el adecuado para justificar que llevas más de 15 items de un mismo objeto encima?",
      answers:[
        { text: "Roleas que te entregan los ítems mediante una caja y la transportan manualmente dando uso a la animación o transporte correspondiente.", isCorrect: true },
        { text: "Roleas que lo guardas en el bolsillo sin tener ningún objeto que justifique donde pueden estar  guardados.", isCorrect: false },
        { text: "Roleo que tengo una mochila enorme.", isCorrect: false },
        { text: "Si llevo el accesorio visual de la mochila guardo una cantidad considerable.", isCorrect: true }
      ]}
  ],
  S2: [
    { q:"Estás en medio de un rol que no ha sido pactado con otro jugador y de la nada se te cae la conexión y te saca del servidor obligándote a reiniciar. ¿Cómo se ha de proceder?",
      answers:[
        { text: "Los demás jugadores deben frenar el rol momentáneamente quedandote afk hasta que vuelvas a entrar al servidor.", isCorrect: false },
        { text: "Los demás jugadores deben seguir el rol excusando tu ausencia de forma ingeniosa hasta que puedas reconectar y seguir con el rol.", isCorrect: true },
        { text: "Los demás jugadores se tienen que quedar afk para esperarte y de mientras salen de su idp y se ponen a hablar de cosas OOC .", isCorrect: false }
      ]},
    { q:"Acabas de ser secuestrado por unos enmascarados... ¿Qué haces en ese momento?",
      answers:[
        { text: "Tratas de hacerte valiente e intentar noquear...", isCorrect: false },
        { text: "Haces caso a las indicaciones y esperas a la policía.", isCorrect: true },
        { text: "Te haces amigo de los atracadores...", isCorrect: false }
      ]},
    { q:"9 amigos excursionistas... puma los ataca... ¿Como procedes?",
      answers:[
        { text: "Llamas al equipo de emergencia...", isCorrect: true },
        { text: "Arrastráis a los heridos exponiéndolos...", isCorrect: false },
        { text: "Arrastráis hasta la cima y os tiráis...", isCorrect: false }
      ]}
  ],
  S3: [
    { q:"CK hecho, pj nuevo llega. Elige la correcta.",
      answers:[
        { text: "Reconozco lugares/personas del pj anterior.", isCorrect: false },
        { text: "No recuerdo nada del anterior pj.", isCorrect: true },
        { text: "Recuerdo amigos de antes.", isCorrect: false }
      ]},
    { q:"Llamada anónima; reconoces voz del dueño del casino...",
      answers:[
        { text: "Me hago el loco y acato instrucciones.", isCorrect: true },
        { text: "Le insulto y amenazo.", isCorrect: false },
        { text: "Voy al casino a preguntar si escucharon la voz.", isCorrect: false }
      ]},
    { q:"Rol sexual con consentimiento.",
      answers:[
        { text: "Está prohibido siempre.", isCorrect: false },
        { text: "Se puede si ambos aceptan.", isCorrect: true },
        { text: "Lo fuerzo indirectamente.", isCorrect: false }
      ]}
  ],
  S4: [
    { q:"Amigo con micro abierto OC en GC, ¿qué haces?",
      answers:[
        { text: "Paro el rol y lo digo por voz OOC.", isCorrect: false },
        { text: "Sigo el rol y le aviso por privado.", isCorrect: true },
        { text: "Paro y escribo en chat OOC y me quedo AFK.", isCorrect: false }
      ]},
    { q:"Garaje, enmascarado te apunta: ¿qué haces?",
      answers:[
        { text: "Saco arma y le tumbo.", isCorrect: false },
        { text: "Le digo que es zona segura.", isCorrect: false },
        { text: "Sigo sus indicaciones.", isCorrect: true }
      ]},
    { q:"Hospital: uno pega puñetazos a todos. ¿Cómo NO?",
      answers:[
        { text: "Me uno a pegar.", isCorrect: true },
        { text: "Me escondo y reporto.", isCorrect: false },
        { text: "Saco SMG y lo abro.", isCorrect: true }
      ]}
  ],
  S5: [
    { q:"Secuestro; son maleducados. ¿Cómo actúas?",
      answers:[
        { text: "Mala actitud pero coopero.", isCorrect: true },
        { text: "Insisto por chat OOC y amenazo con irme.", isCorrect: false },
        { text: "Sigo el rol pero reporto.", isCorrect: false }
      ]},
    { q:"Eres médico; te cae mal el paciente. ¿Qué NO puedes?",
      answers:[
        { text: "Le atiendo pero le escupo.", isCorrect: false },
        { text: "Dejo que muera y hago que sufra.", isCorrect: true },
        { text: "Le atiendo y le cobro 1.000$.", isCorrect: false }
      ]},
    { q:"Metro y racismo. ¿Qué no tendría consecuencias OOC?",
      answers:[
        { text: "Grito 'cierra el pico chimpancé'.", isCorrect: true },
        { text: "Lo empujo a las vías.", isCorrect: false },
        { text: "Le acerco cuchillo y lo hiero.", isCorrect: false },
        { text: "Cualquier racismo IC está prohibido.", isCorrect: false }
      ]}
  ],
};

// ====== Estado y flujo ======
const CATS = ["Conocimientos","Situaciones"];
let QUESTIONS = [];
const state = { i: 0, answers: [] };

function startTest(){
  if (!USER_ID) { alert("No se pudo identificar tu cuenta de Discord. Abre la whitelist como Actividad."); return; }
  if (!$("#discord").value.trim()) { alert("Pon tu nombre de Discord."); return; }

  const blockKeys = ["C1","C2","C3","C4","C5","S1","S2","S3","S4","S5"];
  QUESTIONS = blockKeys.map((bk, idx) => {
    const { item, idx: varIdx } = pickOneWithIndex(BLOCKS[bk]);
    const answers = shuffled(item.answers.map(a => ({...a})));
    const category = idx < 5 ? CATS[0] : CATS[1];
    return { id:`${bk}-${varIdx+1}`, bloque: bk, category, question: item.q, answers,
             multi: item.answers.filter(a=>a.isCorrect).length>1 };
  });

  state.i = 0;
  state.answers = new Array(QUESTIONS.length);
  setProgress(5);
  showStep(2);
  renderQ();
}

function renderQ(){
  const total = QUESTIONS.length || 10;
  const q = QUESTIONS[state.i];
  $("#qTitle").textContent = q.question;
  $("#catPill").textContent = q.category + (state.i<5 ? ` (Bloque ${state.i+3})` : ` (Bloque ${state.i-5+8})`);
  $("#qIndex").textContent = `Pregunta ${state.i+1} de ${total}`;

  const body = $("#qBody"); body.innerHTML="";
  q.answers.forEach((a,idx)=>{
    const lab = document.createElement("label"); lab.className="option";
    const input = document.createElement("input");
    input.type = q.multi ? "checkbox" : "radio";
    input.name = "q"; input.value = idx;
    input.addEventListener("change",()=>{ $("#nextBtn").disabled = body.querySelectorAll("input:checked").length===0; });
    const span = document.createElement("span"); span.textContent = a.text;
    lab.appendChild(input); lab.appendChild(span); body.appendChild(lab);
  });

  const saved = state.answers[state.i];
  if (saved && saved.chosenIdx) {
    saved.chosenIdx.forEach(v => { const el = body.querySelector(`input[value="${v}"]`); if (el) el.checked = true; });
    $("#nextBtn").disabled = saved.chosenIdx.length===0;
  } else {
    $("#nextBtn").disabled = true;
  }
  setProgress(5 + (state.i/total)*85);
}

function collectCurrentAnswer(omit=false){
  const q = QUESTIONS[state.i];
  const body = $("#qBody");
  const sel = [...body.querySelectorAll("input:checked")].map(i=>Number(i.value));
  const correctSet = new Set(q.answers.map((a,i)=> a.isCorrect ? i : null).filter(i=>i!==null));
  const chosenSet  = new Set(sel);

  let correct = true;
  if (omit || sel.length === 0) correct = false;
  else {
    for (const i of chosenSet) if (!correctSet.has(i)) { correct=false; break; }
    if (correct) for (const i of correctSet) if (!chosenSet.has(i)) { correct=false; break; }
  }
  state.answers[state.i] = { chosenIdx: omit? [] : sel, correct };
}

function next(){ collectCurrentAnswer(false); if(state.i < QUESTIONS.length-1){ state.i++; renderQ(); } else { setProgress(100); showStep(3); } }
function omit(){ collectCurrentAnswer(true);  if(state.i < QUESTIONS.length-1){ state.i++; renderQ(); } else { setProgress(100); showStep(3); } }
function prev(){ if (state.i===0) return; state.i--; renderQ(); }

function computeProvisional(){
  const total = QUESTIONS.length;
  const correct = state.answers.reduce((acc,a)=> acc + (a && a.correct ? 1 : 0), 0);
  const wrong = total - correct;
  const passed = wrong <= 2; // 3 fallos ⇒ suspenso
  return { total, correct, wrong, passed };
}

// ====== Envío al webhook (embed + adjunto JSON) ======
function toProxiedDiscordUrl(url){
  // Convierte https://discord.com/api/... a /discord-api/...
  return url.replace(/^https?:\/\/(?:ptb\.)?discord\.com\/api/i, '/discord-api');
}

async function send(){
  const { total, correct, wrong, passed } = computeProvisional();
  const submissionId = uuidv4();
  const clientTs = Date.now();

  const detail = QUESTIONS.map((q, i)=>{
    const saved = state.answers[i] || { chosenIdx: [] , correct: false};
    return {
      id: q.id, bloque: q.bloque, category: q.category, question: q.question,
      answers: q.answers.map(a => ({ text: a.text, isCorrect: !!a.isCorrect })),
      chosenIdx: saved.chosenIdx, chosenText: saved.chosenIdx.map(idx => q.answers[idx]?.text || ""),
      multi: q.multi
    };
  });

  const playerData = {
    discordName: $("#discord").value || DISCORD_NAME || "",
    edad: $("#edad").value || "",
    region: $("#region").value || "",
    conoces: $("#conoces").value || "",
    exp: ($("#exp").value || "").slice(0, 1000)
  };

  const attachment = {
    submissionId, userId: USER_ID, guildId: GUILD_ID, clientTs,
    provisional: { score: correct, total, wrong, passed },
    detail, playerData
  };

  const embed = {
    title: "Nueva solicitud de Whitelist",
    description: "Solicitud enviada desde la Activity.",
    color: passed ? 0x46b34b : 0xff6b6b,
    fields: [
      { name: "Usuario", value: `<@${USER_ID}> \`${USER_ID}\``, inline: false },
      { name: "Discord", value: playerData.discordName || "—", inline: true },
      { name: "Edad", value: playerData.edad || "—", inline: true },
      { name: "Región", value: playerData.region || "—", inline: true },
      { name: "Conociste por", value: playerData.conoces || "—", inline: true },
      { name: "Resultado provisional", value: `Score: ${correct}/${total} • Fallos: ${wrong} • ${passed ? "APROBADO" : "SUSPENSO"}`, inline: false }
    ],
    footer: { text: "Proyecto Roleplay – Sistema de Whitelist" },
    timestamp: new Date(clientTs).toISOString()
  };

  try {
    $("#sendNote").textContent = "Enviando…";
    const fd = new FormData();
    fd.append("payload_json", JSON.stringify({
      username: "Whitelist (Actividad)",
      embeds: [embed],
      allowed_mentions: { parse: [] }
    }));
    const blob = new Blob([JSON.stringify(attachment, null, 2)], { type: "application/json" });
    fd.append("files[0]", blob, "submission.json");

    const webhook = toProxiedDiscordUrl(WEBHOOK_URL);
    const r = await fetch(webhook, { method: "POST", body: fd });
    if (!r.ok) throw new Error("HTTP " + r.status);

    $("#sendNote").textContent = "¡Enviado! El staff procesará tu solicitud.";
  } catch (e) {
    console.error(e);
    $("#sendNote").textContent = "Error al enviar. Reintenta más tarde.";
  }
}

// ====== Identidad (SDK embebido) ======
function showFatal(msg){
  const tag = $("#statusTag");
  tag.style.display='block';
  tag.innerHTML = msg;
  $("#startBtn").disabled = true;
}

async function initIdentity(){
  if (!APP_ID) { showFatal("Falta configurar APP_ID en el HTML."); return; }
  if (!window.DiscordSDK) { showFatal("Abre la whitelist como <b>Actividad de Discord</b>."); return; }

  try {
    const sdk = new window.DiscordSDK(APP_ID);
    await sdk.ready();

    const { code } = await sdk.commands.authorize({
      client_id: APP_ID, response_type: 'code', scope: ['identify']
    });
    const { access_token } = await sdk.commands.authenticate({ client_id: APP_ID, code });

    // IMPORTANTE: usar el proxy /discord-api
    const me = await fetch('/discord-api/users/@me', {
      headers: { Authorization: 'Bearer ' + access_token }
    }).then(r => r.json());

    if (!me?.id) throw new Error('No se pudo resolver /users/@me');

    USER_ID = String(me.id);
    DISCORD_NAME = me.global_name || me.username || null;

    const nameInput = $('#discord');
    if (nameInput && !nameInput.value && DISCORD_NAME) nameInput.value = DISCORD_NAME;

    const tag = $('#statusTag');
    tag.style.display = 'block';
    tag.textContent = `Sesión: ${DISCORD_NAME || USER_ID}`;
    $("#startBtn").disabled = false;
  } catch (e) {
    console.error('initIdentity error', e);
    showFatal('No se pudo identificar automáticamente. Abre la whitelist como <b>Actividad de Discord</b>.');
  }
}

// ====== Wiring inicial ======
$("#startBtn").addEventListener("click", startTest);
$("#nextBtn").addEventListener("click", next);
$("#omitBtn").addEventListener("click", omit);
$("#prevBtn").addEventListener("click", prev);
$("#backToTest").addEventListener("click", ()=> showStep(2));
$("#sendBtn").addEventListener("click", send);

showStep(1); setProgress(0); $("#startBtn").disabled = true;
initIdentity();
