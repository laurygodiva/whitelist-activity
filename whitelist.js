// ===== Config & identidad =====
const API_BASE = '';                   // Importantísimo: rutas relativas → /api/...
const APP_ID   = window.APP_ID || '';
let USER_ID = null;
let DISCORD_NAME = null;

function api(u){ return API_BASE + u; }
function fmtES(ms){
  if(!ms) return '';
  const d = new Date(ms);
  return new Intl.DateTimeFormat('es-ES',{
    year:'numeric',month:'2-digit',day:'2-digit',
    hour:'2-digit',minute:'2-digit',hour12:false,timeZone:'Europe/Madrid'
  }).format(d).replace(',', '');
}
function showFatal(msg){
  const box = document.querySelector('#cooldownBox');
  if (box) { box.style.display='block'; box.innerHTML = msg; }
  const btn = document.querySelector('#startBtn');
  if (btn) btn.disabled = true;
}

async function initIdentityAndStatus(){
  if (!APP_ID) { showFatal('Falta configurar APP_ID en el HTML.'); return; }
  if (!window.DiscordSDK) { showFatal('Abre la whitelist como <b>Actividad de Discord</b>.'); return; }

  try {
    const sdk = new window.DiscordSDK(APP_ID);
    await sdk.ready();

    const { code } = await sdk.commands.authorize({
      client_id: APP_ID, response_type: 'code', scope: ['identify']
    });
    const { access_token } = await sdk.commands.authenticate({ client_id: APP_ID, code });

    const me = await fetch('https://discord.com/api/users/@me', {
      headers: { Authorization: 'Bearer ' + access_token }
    }).then(r => r.json());

    if (!me?.id) throw new Error('No se pudo resolver /users/@me');

    USER_ID = String(me.id);
    DISCORD_NAME = me.global_name || me.username || null;

    const nameInput = document.querySelector('#discord');
    if (nameInput && !nameInput.value && DISCORD_NAME) nameInput.value = DISCORD_NAME;

    const tag = document.querySelector('#statusTag');
    if (tag) { tag.style.display = 'block'; tag.textContent = `Sesión: ${DISCORD_NAME || USER_ID}`; }

    await checkStatus();
  } catch (e) {
    console.error('initIdentity error', e);
    showFatal('No se pudo identificar automáticamente. Abre la whitelist como <b>Actividad de Discord</b>.');
  }
}

async function checkStatus(){
  if (!USER_ID) return;
  try{
    const url = api(`/api/whitelist/status?user_id=${encodeURIComponent(USER_ID)}&discord_name=${encodeURIComponent(document.querySelector('#discord').value || DISCORD_NAME || '')}`);
    const r = await fetch(url);
    const data = await r.json();
    const box = document.querySelector('#cooldownBox');

    if (data.status === 'blocked') {
      const mins = Math.ceil((data.secondsRemaining||0)/60);
      const until = Date.now() + (data.secondsRemaining||0)*1000;
      box.style.display = 'block';
      box.innerHTML = `No puedes repetir todavía. Te faltan ~${mins} minutos. Podrás reintentar el <b>${fmtES(until)}</b>.`;
      document.querySelector('#startBtn').disabled = true;
    } else {
      box.style.display = 'none';
      document.querySelector('#startBtn').disabled = false;
    }
  }catch(e){
    console.error('status fetch error', e);
    const box = document.querySelector('#cooldownBox');
    box.style.display = 'block';
    box.textContent = 'No se pudo verificar el estado. Intenta de nuevo más tarde.';
    document.querySelector('#startBtn').disabled = true;
  }
}

// ===== Banco de preguntas EXACTO =====
const BLOCKS = {
  C1: [
    { q:"Cuál de los siguientes conceptos no es sancionable?",
      answers:[
        { text: "CK", isCorrect: true },
        { text: "MG", isCorrect: false },
        { text: "RK", isCorrect: false },
        { text: "PK", isCorrect: true },
        { text: "IDP", isCorrect: true },
        { text: "DM", isCorrect: false }
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
        { text: "Se refiere a las conversaciones y acciones que están fuera del contexto del rol y no afectan la narrativa del el personaje.", isCorrect: true },
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
    { q:"¿Cuál de los siguientes comentarios no se considera una falta de interpretación?",
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
    { q:"Acabas de ser secuestrado por unos enmascarados que te han maniatado y obligado a subir a un coche, sin darte tiempo de reacción te han metido a la fuerza dentro de un flecca y te han obligado a arrodillarte delante de la puerta con intención de que te vea la policía. ¿Qué haces en ese momento?",
      answers:[
        { text: "Tratas de hacerte valiente e intentar noquear a alguno de los enmascarados para apoderarte de su arma y tratar de huir.", isCorrect: false },
        { text: "Haces caso a las indicaciones de los enmascarados y esperas paciente y con cautela a que la policía venga en tu ayuda.", isCorrect: true },
        { text: "Te haces amigo de los atracadores y te unes a ellos haciendo de rehén y quedándote una parte del botín.", isCorrect: false }
      ]},
    { q:"9 amigos excursionistas y tú habéis decidido subir al monte andando para realizar una excursión y tirarnos en paracaídas desde la cima. Estando a mitad del camino un puma los ataca dejando a más de la mitad del grupo herido.¿Como procedes a este rol?",
      answers:[
        { text: "Llamas al equipo de emergencia para que os intenten evacuar mediante helicóptero o camioneta para llevaros a un centro sanitario cercano a curar las heridas.", isCorrect: true },
        { text: "Tus compañeros no heridos y tú tratas de arrastrar a los demás heridos exponiendolos a un nuevo ataque o problemas por el camino en la bajada.", isCorrect: false },
        { text: "Tratáis de arrastrar a los heridos hasta la cima y os tirais todos juntos en paracaídas tratando de llegar a una zona donde haya un centro sanitario.", isCorrect: false }
      ]}
  ],
  S3: [
    { q:"Esta última semana finalmente le has realizado un ck a tu pj. Hoy por fin te has decidido y te has creado un personaje nuevo que llega a la ciudad. Elige la respuesta correcta.",
      answers:[
        { text: "Camino por la ciudad con el nuevo personaje reconociendo los lugares y las personas con las que interactúe con el personaje anterior.", isCorrect: false },
        { text: "Como el personaje es completamente nuevo no puedo acordarme de las personas o lugares que haya conocido con el anterior personaje.", isCorrect: true },
        { text: "Voy por la ciudad conociendo todo de nuevo y me acuerdo de algunos personajes de otros jugadores porque son mis amigos.", isCorrect: false }
      ]},
    { q:"Estás tranquilamente caminando cuando de repente recibes una llamada anónima, amenazándote y pidiéndote dinero. En medio de la llamada, reconoces que esa voz es la del dueño del casino. ¿Cómo continuarías el rol?",
      answers:[
        { text: "Me hago el loco y acato sus instrucciones.", isCorrect: true },
        { text: "Le insultaría, le mencionaría su nombre y le diría que le voy a mandar cuatro sicarios al casino a partirle las piernas.", isCorrect: false },
        { text: "Me hago el loco, espero un rato y voy al casino a preguntar a los trabajadores si han escuchado al jefe amenazar a alguien por teléfono.", isCorrect: false }
      ]},
    { q:"Hace nada has empezado un rol de pareja con otr@ jugador, como queréis ir a más y profundizar la relación IC, propones realizar un rol de carácter sexual con dicha persona.",
      answers:[
        { text: "No se puede realizar dicho rol ya que está prohibido realizar roles de carácter sexual.", isCorrect: true },
        { text: "Se puede realizar dicho rol siempre y cuando las dos personas estén de acuerdo en realizarlo.", isCorrect: false },
        { text: "Fuerzas indirectamente al otr@ jugador/a a realizar dicho rol sin tener su consentimiento.", isCorrect: false }
      ]}
  ],
  S4: [
    { q:"Tu y tu amigo estás roleando con otros jugadores en GC, sin querer, en medio de un rol, tu amigo se deja el micrófono encendido y se escuchan conversaciones OC.¿Qué haces en esta situación?",
      answers:[
        { text: "Paramos el rol de inmediato y avisamos por voz saliendo del pj que se ha dejado el micrófono encendido.", isCorrect: false },
        { text: "Tratáis de continuar con el rol haciendo caso omiso a lo que ha dicho tu amigo y mediante mensaje privado le avisas de que se ha dejado el micrófono abierto.posteriormente seguís el rol como si no hubiera pasado nada.", isCorrect: true },
        { text: "Parais el rol momentáneamente y escribís por el chat oc para avisar a tu amigo. Os quedáis Afk hasta que solucione el problema hablando de vuestras cosas por discord. Posteriormente haceis regresión de rol y seguis.", isCorrect: false }
      ]},
    { q:"Te encuentras en un garaje sacando un vehículo, de repente aparece un enmascarado con una pistola, el cual te dice que estás secuestrado y que a la mínima tontería te pegará un tiro. ¿Cómo actuarías?",
      answers:[
        { text: "Sacaría una pistola y le dispararía hasta dejarlo en el suelo en coma y luego me reiria de el.", isCorrect: false },
        { text: "Le diría IC que en el garaje no me puede robar, que se vaya o, si no, rezaría para que lo deportaran de la ciudad por intentar robarme en una zona segura.", isCorrect: false },
        { text: "Seguiría sus indicaciones.", isCorrect: true }
      ]},
    { q:"Estas en el hospital y te percatas de que un jugador nada mas entrar en el hospital empieza a dar puñetazos a todo el mundo sin mediar palabra. ¿Cómo no deberías actuar?",
      answers:[
        { text: "Me uno a dar puñetazos, la culpa es del que empieza.", isCorrect: true },
        { text: "Me escondo en algún lugar donde no pueda pegarme y aviso al staff con el comando /reporte", isCorrect: false },
        { text: "Saco una SMG y le abro la cabeza para que deje de hacer antirol.", isCorrect: true }
      ]}
  ],
  S5: [
    { q:"Durante un rol de secuestro siendo tu el rehen empiezas a valorar que los secuestradores empiezan a ser excesivamente maleducados contigo ¿Cómo deberías actuar frente ese rol?",
      answers:[
        { text: "Tomo mala actitud por el desagrado llegando a insultar pero manteniendo la cooperación.", isCorrect: true },
        { text: "Insisto por el chat OOC que se están pasando y si no paran me desconecto.", isCorrect: false },
        { text: "Continuo el rol pero reporto.", isCorrect: false }
      ]},
    { q:"Tu personaje es un médico y acudes a un aviso de un jugador inconsciente, y resulta que este te cae mal en el rol. ¿Qué no puedes hacer?",
      answers:[
        { text: "Le atiendo pero no sin antes escupirle en la boca por payaso.", isCorrect: false },
        { text: "Aprovecho la situación para dejar que se muera definitivamente y si puedo hago que sufra en el proceso.", isCorrect: true },
        { text: "Le atiendo pero pongo una excusa para cobrarle 1.000$", isCorrect: false }
      ]},
    { q:"Estás en el metro esperando el tren, a los minutos otro jugador comienza a cantar rancheras mexicanas pidiendo limosna, pero los ideales racistas de tu personaje hacen que te sientas completamente incómodo. ¿Cuál de estas acciones no tendría consecuencias OOC? ",
      answers:[
        { text: "Comienzas una batalla de miradas tensas y cuando llega el tren, mientras subes le gritas: cierra el pico chimpancé.", isCorrect: true },
        { text: "Dejas caer un billete de 500$ junto a las vías y cuando este lo recoge del suelo aprovechas para darle una patada en el culo para que sea atropellado por el tren.", isCorrect: false },
        { text: "Le acercas un cuchillo al cuello, comienzas a dar tu discurso xenófobo y sin intenciones de matarlo pero sí de herirlo lo apuñalas.", isCorrect: false },
        { text: "Cualquier acción, comentario o comportamiento racista, xenófoba o discriminatoria IC está prohibida. Las ideologías de los personajes deben ser respetuosas.", isCorrect: false }
      ]}
  ],
};

function pickOne(a){ return a[Math.floor(Math.random()*a.length)]; }
function shuffled(arr){ return arr.map(v=>({v, r:Math.random()})).sort((a,b)=>a.r-b.r).map(o=>o.v); }

let QUESTIONS = [];
const CATS = ["Conocimientos","Situaciones"];

const state = { step: 1, i: 0, answers: [] };
const $ = s=>document.querySelector(s);
const bar = $("#bar"), pill=$("#pill");
function setProgress(p){ bar.style.width = p + "%"; pill.textContent = Math.round(p)+"%"; }
function showStep(n){ state.step=n; $("#step1").style.display=n===1?"block":"none"; $("#step2").style.display=n===2?"block":"none"; $("#step3").style.display=n===3?"block":"none"; }

// ===== Test flow =====
function startTest(){
  if (!USER_ID) { alert("No se pudo identificar tu cuenta de Discord."); return; }
  if(!$("#discord").value.trim()){ alert("Pon tu nombre de Discord."); return; }

  const selected = [
    pickOne(BLOCKS.C1), pickOne(BLOCKS.C2), pickOne(BLOCKS.C3), pickOne(BLOCKS.C4), pickOne(BLOCKS.C5),
    pickOne(BLOCKS.S1), pickOne(BLOCKS.S2), pickOne(BLOCKS.S3), pickOne(BLOCKS.S4), pickOne(BLOCKS.S5),
  ];
  QUESTIONS = selected.map((q, idx) => {
    const category = idx < 5 ? CATS[0] : CATS[1];
    const answers = shuffled(q.answers.map(a => ({...a})));
    return { category, question: q.q, answers };
  });
  state.i=0; state.answers = new Array(QUESTIONS.length);
  setProgress(5); showStep(2); renderQ();
}

function renderQ(){
  const total = QUESTIONS.length || 10;
  const q = QUESTIONS[state.i];
  $("#qTitle").textContent = q.question;
  $("#catPill").textContent = q.category + (state.i<5 ? " (Bloque "+(state.i+3)+")" : " (Bloque "+(state.i-5+8)+")");
  $("#qIndex").textContent = "Pregunta " + (state.i+1) + " de " + total;
  const body = $("#qBody"); body.innerHTML="";
  const multi = q.answers.filter(a=>a.isCorrect).length>1;
  q.answers.forEach((a,idx)=>{
    const lab=document.createElement("label"); lab.className="option";
    const input=document.createElement("input"); input.type=multi?"checkbox":"radio"; input.name="q"; input.value=idx;
    input.addEventListener("change",()=>{ $("#nextBtn").disabled = body.querySelectorAll("input:checked").length===0; });
    const span=document.createElement("span"); span.textContent=a.text;
    lab.appendChild(input); lab.appendChild(span); body.appendChild(lab);
  });
  const saved = state.answers[state.i];
  if(saved && saved.chosen){
    saved.chosen.forEach(v=>{ const input = body.querySelector(`input[value="${v}"]`); if(input) input.checked=true; });
    $("#nextBtn").disabled = saved.chosen.length===0;
  } else { $("#nextBtn").disabled=true; }
  setProgress(5 + (state.i/total)*85);
}

function collectCurrentAnswer(omit=false){
  const q = QUESTIONS[state.i]; const body=$("#qBody");
  const sel=[...body.querySelectorAll("input:checked")].map(i=>Number(i.value));
  const correctSet=new Set(q.answers.map((a,i)=>a.isCorrect?i:null).filter(i=>i!==null));
  const chosenSet=new Set(sel);
  let correct=true;
  if(!omit){
    for(const i of chosenSet) if(!correctSet.has(i)) { correct=false; break; }
    if(correct) for(const i of correctSet) if(!chosenSet.has(i)) { correct=false; break; }
  } else { correct=false; }
  state.answers[state.i] = { index: state.i, chosen: omit? [] : sel, correct };
}
function next(){ collectCurrentAnswer(false); if(state.i < QUESTIONS.length-1){ state.i++; renderQ(); } else { setProgress(100); showStep(3); } }
function omit(){ collectCurrentAnswer(true); if(state.i < QUESTIONS.length-1){ state.i++; renderQ(); } else { setProgress(100); showStep(3); } }
function prev(){ if(state.i===0) return; state.i--; renderQ(); }

function computeScore(){
  const total = QUESTIONS.length;
  const correct = state.answers.reduce((acc,a)=> acc + (a && a.correct ? 1 : 0), 0);
  const wrong = total - correct;
  return { total, correct, wrong };
}

// ===== Envío al bot =====
async function send(){
  const { total, correct } = computeScore();
  const detail = QUESTIONS.map((q, i)=>{
    const saved = state.answers[i] || { chosen: [] , correct: false};
    return {
      bloque: (i<5 ? ("C"+(i+1)) : ("S"+(i-5+1))),
      question: q.question,
      answers: q.answers.map(a => ({ text: a.text, isCorrect: !!a.isCorrect })),
      chosen: saved.chosen.map(idx => q.answers[idx]?.text || "")
    };
  });

  const payload = {
    userId: USER_ID,
    discordName: document.querySelector('#discord').value || DISCORD_NAME || "",
    score: correct,
    total,
    detail
  };

  try {
    document.querySelector('#sendNote').textContent = "Enviando al bot…";
    const r = await fetch(api('/api/whitelist/submit'), {
      method: "POST", headers: { "Content-Type":"application/json" },
      body: JSON.stringify(payload)
    });
    const out = await r.json();

    if (!r.ok) {
      if (out && out.error === 'cooldown_active') {
        const until = Date.now() + (out.secondsRemaining||0)*1000;
        document.querySelector('#sendNote').textContent = `Tienes un cooldown activo. Podrás reintentar el ${fmtES(until)}.`;
      } else {
        document.querySelector('#sendNote').textContent = "Error al enviar al bot. Inténtalo más tarde.";
      }
      return;
    }
    if (out.verdict === 'suspenso' && out.cooldownUntil) {
      document.querySelector('#sendNote').textContent = `Recibido. Tu intento ha sido registrado y tienes cooldown hasta ${fmtES(out.cooldownUntil)}.`;
    } else {
      document.querySelector('#sendNote').textContent = "¡Enviado! El staff continuará el proceso automáticamente.";
    }
  } catch(e) {
    document.querySelector('#sendNote').textContent = "Error de red al contactar con el bot.";
    console.error(e);
  }
}

// ===== Wiring =====
document.querySelector('#startBtn').addEventListener('click', startTest);
document.querySelector('#nextBtn').addEventListener('click', next);
document.querySelector('#omitBtn').addEventListener('click', omit);
document.querySelector('#prevBtn').addEventListener('click', prev);
document.querySelector('#backToTest').addEventListener('click', ()=> showStep(2));
document.querySelector('#sendBtn').addEventListener('click', send);
document.querySelector('#discord').addEventListener('change', () => { if (USER_ID) checkStatus(); });

showStep(1); setProgress(0);
initIdentityAndStatus();
